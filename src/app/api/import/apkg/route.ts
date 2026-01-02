import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseAPKG, convertToFlashcards, getAPKGStats } from '@/lib/apkg/parser';

export const maxDuration = 60; // Allow up to 60 seconds for large files
export const dynamic = 'force-dynamic';

interface ImportResult {
  success: boolean;
  stats?: {
    deckName: string;
    totalNotes: number;
    totalCards: number;
    totalMedia: number;
    uniqueTags: number;
    tags: string[];
    clozeCount: number;
    regularCount: number;
  };
  flashcards?: {
    id: string;
    front: string;
    back: string;
    extra?: string;
    tags: string[];
    imageUrls: string[];
    clozeIndex?: number;
  }[];
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ImportResult>> {
  try {
    // Get the Supabase client and check auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string || 'preview'; // 'preview' or 'import'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.apkg')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an .apkg file' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 100MB' },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Parse the APKG file
    const parsed = await parseAPKG(arrayBuffer);
    const stats = getAPKGStats(parsed);

    // Convert to flashcards
    const flashcards = convertToFlashcards(parsed);

    if (action === 'preview') {
      // Just return stats and preview (first 10 cards)
      const previewCards = flashcards.slice(0, 10).map((card, idx) => ({
        id: `preview-${idx}`,
        front: card.front.substring(0, 500),
        back: card.back.substring(0, 500),
        extra: card.extra?.substring(0, 300),
        tags: card.tags.slice(0, 10),
        imageUrls: [], // Don't upload images for preview
        clozeIndex: card.clozeIndex,
      }));

      return NextResponse.json({
        success: true,
        stats,
        flashcards: previewCards,
      });
    }

    // Full import - upload media and create cards
    const processedCards = [];

    for (const card of flashcards) {
      const imageUrls: string[] = [];

      // Upload images to Supabase
      for (const image of card.images) {
        try {
          // Determine content type from filename
          const ext = image.filename.split('.').pop()?.toLowerCase() || 'jpg';
          const contentType = ext === 'png' ? 'image/png'
            : ext === 'gif' ? 'image/gif'
            : ext === 'webp' ? 'image/webp'
            : ext === 'svg' ? 'image/svg+xml'
            : 'image/jpeg';

          // Generate unique filename
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8);
          const filename = `${user.id}/anking/${timestamp}_${random}_${image.filename}`;

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('images')
            .upload(filename, image.data, {
              contentType,
              cacheControl: '31536000', // 1 year cache
              upsert: false,
            });

          if (uploadError) {
            console.warn(`Failed to upload image ${image.filename}:`, uploadError.message);
            continue;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(uploadData.path);

          imageUrls.push(urlData.publicUrl);
        } catch (imgError) {
          console.warn(`Error processing image ${image.filename}:`, imgError);
        }
      }

      // Create the flashcard record
      const now = new Date().toISOString();
      const cardId = crypto.randomUUID();

      // Extract system from tags (common AnKing patterns)
      let system = 'General';
      const systemPatterns: Record<string, string> = {
        'cardio': 'Cardiology',
        'pulm': 'Pulmonology',
        'gi': 'Gastroenterology',
        'renal': 'Nephrology',
        'neuro': 'Neurology',
        'endo': 'Endocrinology',
        'heme': 'Hematology/Oncology',
        'onc': 'Hematology/Oncology',
        'id': 'Infectious Disease',
        'infect': 'Infectious Disease',
        'rheum': 'Rheumatology',
        'derm': 'Dermatology',
        'psych': 'Psychiatry',
        'obgyn': 'OB/GYN',
        'repro': 'OB/GYN',
        'peds': 'Pediatrics',
        'surg': 'Surgery',
        'msk': 'Rheumatology',
        'immuno': 'Rheumatology',
      };

      for (const tag of card.tags) {
        const tagLower = tag.toLowerCase();
        for (const [pattern, systemName] of Object.entries(systemPatterns)) {
          if (tagLower.includes(pattern)) {
            system = systemName;
            break;
          }
        }
        if (system !== 'General') break;
      }

      processedCards.push({
        id: cardId,
        schema_version: '1.0',
        created_at: now,
        updated_at: now,
        user_id: user.id,
        front: card.front,
        back: card.back,
        explanation: card.extra || null,
        images: imageUrls,
        tags: card.tags,
        system,
        topic: card.deckName,
        difficulty: 'medium',
        clinical_vignette: true,
        source: 'anking',
        sr_state: 'new',
        sr_interval: 0,
        sr_ease: 2.5,
        sr_reps: 0,
        sr_lapses: 0,
        sr_next_review: now,
      });
    }

    // Batch insert cards into Supabase
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < processedCards.length; i += batchSize) {
      const batch = processedCards.slice(i, i + batchSize);

      const { error: insertError } = await supabase
        .from('flashcards')
        .insert(batch);

      if (insertError) {
        console.error('Insert error:', insertError);
        // Continue with remaining batches
      } else {
        insertedCount += batch.length;
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        totalCards: insertedCount,
      },
      flashcards: processedCards.slice(0, 5).map(card => ({
        id: card.id,
        front: card.front.substring(0, 500),
        back: card.back.substring(0, 500),
        extra: card.explanation?.substring(0, 300) || undefined,
        tags: card.tags.slice(0, 10),
        imageUrls: card.images,
        clozeIndex: undefined,
      })),
    });

  } catch (error) {
    console.error('APKG import error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process APKG file'
      },
      { status: 500 }
    );
  }
}
