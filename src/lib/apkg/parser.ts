import JSZip from 'jszip';
import initSqlJs, { Database } from 'sql.js';

export interface AnkiNote {
  id: number;
  guid: string;
  mid: number; // model id
  mod: number; // modification time
  tags: string[];
  flds: string[]; // fields array
  sfld: string; // sort field (usually front)
}

export interface AnkiCard {
  id: number;
  nid: number; // note id
  did: number; // deck id
  ord: number; // ordinal
  type: number;
  queue: number;
  due: number;
  ivl: number; // interval
  factor: number; // ease factor
  reps: number;
  lapses: number;
}

export interface AnkiModel {
  id: number;
  name: string;
  flds: { name: string; ord: number }[];
  tmpls: { name: string; qfmt: string; afmt: string }[];
}

export interface AnkiDeck {
  id: number;
  name: string;
}

export interface ParsedAPKG {
  deckName: string;
  notes: AnkiNote[];
  cards: AnkiCard[];
  models: Record<number, AnkiModel>;
  decks: Record<number, AnkiDeck>;
  media: Map<string, Uint8Array>; // filename -> binary data
  mediaMapping: Record<string, string>; // index -> filename
}

export interface ParsedFlashcard {
  front: string;
  back: string;
  extra?: string;
  tags: string[];
  images: { filename: string; data: Uint8Array }[];
  clozeIndex?: number;
  deckName: string;
  noteId: number;
}

/**
 * Parse an APKG file (Anki package) and extract all content
 */
export async function parseAPKG(fileBuffer: ArrayBuffer): Promise<ParsedAPKG> {
  // Load sql.js with WASM
  const SQL = await initSqlJs({
    // Use CDN for the WASM file in browser/Node environments
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });

  // Unzip the APKG file
  const zip = await JSZip.loadAsync(fileBuffer);

  // Find the SQLite database file (could be collection.anki2 or collection.anki21)
  let dbFile: JSZip.JSZipObject | null = null;
  let dbFileName = '';

  for (const filename of Object.keys(zip.files)) {
    if (filename === 'collection.anki2' || filename === 'collection.anki21') {
      dbFile = zip.files[filename];
      dbFileName = filename;
      break;
    }
  }

  if (!dbFile) {
    throw new Error('No Anki database found in APKG file. Expected collection.anki2 or collection.anki21');
  }

  // Extract and load the database
  const dbBuffer = await dbFile.async('arraybuffer');
  const db: Database = new SQL.Database(new Uint8Array(dbBuffer));

  // Extract media mapping (JSON file that maps numeric IDs to filenames)
  let mediaMapping: Record<string, string> = {};
  const mediaFile = zip.files['media'];
  if (mediaFile) {
    try {
      const mediaJson = await mediaFile.async('string');
      mediaMapping = JSON.parse(mediaJson);
    } catch {
      console.warn('Failed to parse media mapping file');
    }
  }

  // Extract media files
  const media = new Map<string, Uint8Array>();
  for (const [index, filename] of Object.entries(mediaMapping)) {
    const mediaFileEntry = zip.files[index];
    if (mediaFileEntry && !mediaFileEntry.dir) {
      try {
        const data = await mediaFileEntry.async('uint8array');
        media.set(filename, data);
      } catch {
        console.warn(`Failed to extract media file: ${filename}`);
      }
    }
  }

  // Parse collection metadata (contains models and decks)
  const colResult = db.exec('SELECT models, decks FROM col LIMIT 1');
  if (!colResult.length || !colResult[0].values.length) {
    throw new Error('Invalid Anki database: no collection data found');
  }

  const modelsJson = colResult[0].values[0][0] as string;
  const decksJson = colResult[0].values[0][1] as string;

  const models: Record<number, AnkiModel> = {};
  const decks: Record<number, AnkiDeck> = {};

  try {
    const modelsData = JSON.parse(modelsJson);
    for (const [id, model] of Object.entries(modelsData)) {
      const m = model as {
        id?: number;
        name?: string;
        flds?: { name: string; ord: number }[];
        tmpls?: { name: string; qfmt: string; afmt: string }[];
      };
      models[Number(id)] = {
        id: Number(id),
        name: m.name || 'Unknown',
        flds: m.flds || [],
        tmpls: m.tmpls || [],
      };
    }
  } catch {
    console.warn('Failed to parse models JSON');
  }

  try {
    const decksData = JSON.parse(decksJson);
    for (const [id, deck] of Object.entries(decksData)) {
      const d = deck as { id?: number; name?: string };
      decks[Number(id)] = {
        id: Number(id),
        name: d.name || 'Default',
      };
    }
  } catch {
    console.warn('Failed to parse decks JSON');
  }

  // Get primary deck name
  let deckName = 'Imported Deck';
  const deckValues = Object.values(decks);
  if (deckValues.length > 0) {
    // Find the most specific deck name (longest path, excluding Default)
    const nonDefaultDecks = deckValues.filter(d => d.name !== 'Default');
    if (nonDefaultDecks.length > 0) {
      deckName = nonDefaultDecks.sort((a, b) => b.name.length - a.name.length)[0].name;
    }
  }

  // Parse notes
  const notes: AnkiNote[] = [];
  const notesResult = db.exec('SELECT id, guid, mid, mod, tags, flds, sfld FROM notes');
  if (notesResult.length && notesResult[0].values.length) {
    for (const row of notesResult[0].values) {
      const tagsStr = (row[4] as string) || '';
      const fldsStr = (row[5] as string) || '';

      notes.push({
        id: row[0] as number,
        guid: row[1] as string,
        mid: row[2] as number,
        mod: row[3] as number,
        tags: tagsStr.trim().split(/\s+/).filter(t => t.length > 0),
        flds: fldsStr.split('\x1f'), // Fields are separated by unit separator
        sfld: row[6] as string,
      });
    }
  }

  // Parse cards
  const cards: AnkiCard[] = [];
  const cardsResult = db.exec('SELECT id, nid, did, ord, type, queue, due, ivl, factor, reps, lapses FROM cards');
  if (cardsResult.length && cardsResult[0].values.length) {
    for (const row of cardsResult[0].values) {
      cards.push({
        id: row[0] as number,
        nid: row[1] as number,
        did: row[2] as number,
        ord: row[3] as number,
        type: row[4] as number,
        queue: row[5] as number,
        due: row[6] as number,
        ivl: row[7] as number,
        factor: row[8] as number,
        reps: row[9] as number,
        lapses: row[10] as number,
      });
    }
  }

  db.close();

  return {
    deckName,
    notes,
    cards,
    models,
    decks,
    media,
    mediaMapping,
  };
}

/**
 * Extract image references from HTML content
 */
function extractImageReferences(html: string): string[] {
  const images: string[] = [];
  // Match <img src="filename"> patterns
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  return images;
}

/**
 * Process cloze deletions - convert {{c1::answer}} to interactive format
 */
export function processClozeText(text: string, showAnswers: boolean = false): string {
  // Match {{c1::answer}} or {{c1::answer::hint}}
  return text.replace(/\{\{c(\d+)::([^}]+?)(?:::([^}]+))?\}\}/g, (_, num, answer, hint) => {
    if (showAnswers) {
      return `<span class="cloze-answer" data-cloze="${num}">${answer}</span>`;
    }
    const hintText = hint ? ` (${hint})` : '';
    return `<span class="cloze-blank" data-cloze="${num}">[...]${hintText}</span>`;
  });
}

/**
 * Strip HTML tags but preserve essential formatting
 */
function stripHtml(html: string): string {
  // Replace common HTML elements
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?(b|strong)>/gi, '**')
    .replace(/<\/?(i|em)>/gi, '*')
    .replace(/<\/?(u)>/gi, '_');

  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
}

/**
 * Convert parsed APKG to our flashcard format
 */
export function convertToFlashcards(parsed: ParsedAPKG): ParsedFlashcard[] {
  const flashcards: ParsedFlashcard[] = [];
  const noteToCards = new Map<number, AnkiCard[]>();

  // Group cards by note
  for (const card of parsed.cards) {
    const existing = noteToCards.get(card.nid) || [];
    existing.push(card);
    noteToCards.set(card.nid, existing);
  }

  for (const note of parsed.notes) {
    const model = parsed.models[note.mid];
    if (!model) continue;

    // Get field names from model
    const fieldNames = model.flds.map(f => f.name.toLowerCase());

    // Map fields to named values
    const fields: Record<string, string> = {};
    fieldNames.forEach((name, idx) => {
      fields[name] = note.flds[idx] || '';
    });

    // Determine front/back based on common field names
    let front = '';
    let back = '';
    let extra = '';

    // Common AnKing/standard field names
    const frontCandidates = ['text', 'front', 'question', 'cloze'];
    const backCandidates = ['extra', 'back', 'answer', 'extra / explanation'];
    const extraCandidates = ['lecture notes', 'missed questions', 'pathoma', 'boards and beyond', 'first aid'];

    // Find front
    for (const candidate of frontCandidates) {
      if (fields[candidate]) {
        front = fields[candidate];
        break;
      }
    }

    // Find back
    for (const candidate of backCandidates) {
      if (fields[candidate]) {
        back = fields[candidate];
        break;
      }
    }

    // If no explicit front/back found, use first two fields
    if (!front && note.flds.length > 0) {
      front = note.flds[0];
    }
    if (!back && note.flds.length > 1) {
      back = note.flds[1];
    }

    // Collect extra content from additional fields
    const extras: string[] = [];
    for (const candidate of extraCandidates) {
      if (fields[candidate] && fields[candidate].trim()) {
        extras.push(fields[candidate]);
      }
    }
    if (extras.length > 0) {
      extra = extras.join('\n\n---\n\n');
    }

    // Extract images from all fields
    const imageFilenames = new Set<string>();
    for (const field of note.flds) {
      for (const img of extractImageReferences(field)) {
        imageFilenames.add(img);
      }
    }

    // Get image data
    const images: { filename: string; data: Uint8Array }[] = [];
    Array.from(imageFilenames).forEach(filename => {
      const data = parsed.media.get(filename);
      if (data) {
        images.push({ filename, data });
      }
    });

    // Check for cloze deletions
    const isCloze = front.includes('{{c');

    if (isCloze) {
      // For cloze cards, create one flashcard per cloze number
      const clozeNumbers = new Set<number>();
      const clozeRegex = /\{\{c(\d+)::/g;
      let match;
      while ((match = clozeRegex.exec(front)) !== null) {
        clozeNumbers.add(parseInt(match[1], 10));
      }

      Array.from(clozeNumbers).forEach(clozeNum => {
        flashcards.push({
          front: stripHtml(processClozeText(front, false)),
          back: stripHtml(processClozeText(front, true)),
          extra: extra ? stripHtml(extra) : undefined,
          tags: note.tags,
          images,
          clozeIndex: clozeNum,
          deckName: parsed.deckName,
          noteId: note.id,
        });
      });
    } else {
      // Standard card
      flashcards.push({
        front: stripHtml(front),
        back: stripHtml(back),
        extra: extra ? stripHtml(extra) : undefined,
        tags: note.tags,
        images,
        deckName: parsed.deckName,
        noteId: note.id,
      });
    }
  }

  return flashcards;
}

/**
 * Get statistics about an APKG file
 */
export function getAPKGStats(parsed: ParsedAPKG) {
  const totalNotes = parsed.notes.length;
  const totalCards = parsed.cards.length;
  const totalMedia = parsed.media.size;
  const uniqueTags = new Set<string>();

  for (const note of parsed.notes) {
    for (const tag of note.tags) {
      uniqueTags.add(tag);
    }
  }

  // Count cloze vs regular cards
  let clozeCount = 0;
  let regularCount = 0;
  for (const note of parsed.notes) {
    if (note.flds.some(f => f.includes('{{c'))) {
      clozeCount++;
    } else {
      regularCount++;
    }
  }

  return {
    deckName: parsed.deckName,
    totalNotes,
    totalCards,
    totalMedia,
    uniqueTags: uniqueTags.size,
    tags: Array.from(uniqueTags).slice(0, 50), // First 50 tags for preview
    clozeCount,
    regularCount,
  };
}
