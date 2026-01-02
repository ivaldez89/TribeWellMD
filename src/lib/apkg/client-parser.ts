'use client';

import JSZip from 'jszip';

export interface AnkiNote {
  id: number;
  guid: string;
  mid: number;
  mod: number;
  tags: string[];
  flds: string[];
  sfld: string;
}

export interface AnkiModel {
  id: number;
  name: string;
  flds: { name: string; ord: number }[];
}

export interface ParsedAPKGClient {
  deckName: string;
  notes: AnkiNote[];
  models: Record<number, AnkiModel>;
  media: Map<string, Blob>;
  mediaMapping: Record<string, string>;
}

export interface ParsedFlashcardClient {
  front: string;
  back: string;
  extra?: string;
  tags: string[];
  imageFilenames: string[];
  clozeIndex?: number;
  deckName: string;
  noteId: number;
}

export interface APKGStats {
  deckName: string;
  totalNotes: number;
  totalCards: number;
  totalMedia: number;
  uniqueTags: number;
  tags: string[];
  clozeCount: number;
  regularCount: number;
}

/**
 * Load sql.js dynamically in the browser
 */
async function loadSqlJs() {
  // Dynamic import for client-side only
  const initSqlJs = (await import('sql.js')).default;

  return await initSqlJs({
    locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
  });
}

/**
 * Parse an APKG file client-side (no server upload needed)
 */
export async function parseAPKGClient(
  file: File,
  onProgress?: (message: string, percent: number) => void
): Promise<ParsedAPKGClient> {
  onProgress?.('Loading SQL.js...', 5);
  const SQL = await loadSqlJs();

  onProgress?.('Reading file...', 10);
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.('Extracting archive...', 20);
  const zip = await JSZip.loadAsync(arrayBuffer);

  // Find the SQLite database
  let dbFile: JSZip.JSZipObject | null = null;
  for (const filename of Object.keys(zip.files)) {
    if (filename === 'collection.anki2' || filename === 'collection.anki21') {
      dbFile = zip.files[filename];
      break;
    }
  }

  if (!dbFile) {
    throw new Error('No Anki database found in APKG file');
  }

  onProgress?.('Loading database...', 30);
  const dbBuffer = await dbFile.async('arraybuffer');
  const db = new SQL.Database(new Uint8Array(dbBuffer));

  // Extract media mapping
  let mediaMapping: Record<string, string> = {};
  const mediaFile = zip.files['media'];
  if (mediaFile) {
    try {
      const mediaJson = await mediaFile.async('string');
      mediaMapping = JSON.parse(mediaJson);
    } catch {
      console.warn('Failed to parse media mapping');
    }
  }

  onProgress?.('Extracting media files...', 40);
  const media = new Map<string, Blob>();
  const mediaEntries = Object.entries(mediaMapping);

  for (let i = 0; i < mediaEntries.length; i++) {
    const [index, filename] = mediaEntries[i];
    const mediaFileEntry = zip.files[index];

    if (mediaFileEntry && !mediaFileEntry.dir) {
      try {
        const data = await mediaFileEntry.async('blob');
        media.set(filename, data);
      } catch {
        // Skip failed media files
      }
    }

    if (i % 100 === 0) {
      const mediaPercent = 40 + (i / mediaEntries.length) * 20;
      onProgress?.(`Extracting media (${i}/${mediaEntries.length})...`, mediaPercent);
    }
  }

  onProgress?.('Parsing collection data...', 65);

  const models: Record<number, AnkiModel> = {};
  let deckName = 'Imported Deck';

  // Check which schema version we're dealing with
  // Anki 2.1.28+ uses a different schema with separate tables
  const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  const tableNames = tablesResult.length
    ? tablesResult[0].values.map(row => row[0] as string)
    : [];

  console.log('Available tables:', tableNames);

  const hasNotetypes = tableNames.includes('notetypes');
  const hasDecksTable = tableNames.includes('decks');
  const hasColTable = tableNames.includes('col');

  if (hasNotetypes) {
    // New Anki 2.1.28+ schema with separate notetypes table
    console.log('Using new Anki 2.1.28+ schema');

    try {
      const notetypesResult = db.exec('SELECT id, name, config FROM notetypes');
      if (notetypesResult.length && notetypesResult[0].values.length) {
        for (const row of notetypesResult[0].values) {
          const id = row[0] as number;
          const name = row[1] as string;

          // Get fields for this notetype
          const fieldsResult = db.exec(`SELECT name, ord FROM fields WHERE ntid = ${id} ORDER BY ord`);
          const flds: { name: string; ord: number }[] = [];
          if (fieldsResult.length && fieldsResult[0].values.length) {
            for (const fieldRow of fieldsResult[0].values) {
              flds.push({
                name: fieldRow[0] as string,
                ord: fieldRow[1] as number,
              });
            }
          }

          models[id] = { id, name, flds };
        }
      }
    } catch (e) {
      console.warn('Failed to parse notetypes:', e);
    }

    // Get deck name from decks table
    if (hasDecksTable) {
      try {
        const decksResult = db.exec('SELECT id, name FROM decks');
        if (decksResult.length && decksResult[0].values.length) {
          const deckNames = decksResult[0].values
            .map(row => row[1] as string)
            .filter(name => name && name !== 'Default');
          if (deckNames.length > 0) {
            deckName = deckNames.sort((a, b) => b.length - a.length)[0];
          }
        }
      } catch (e) {
        console.warn('Failed to parse decks table:', e);
      }
    }
  } else if (hasColTable) {
    // Old Anki schema with models/decks stored in col table
    console.log('Using old Anki schema (col table)');

    const colResult = db.exec('SELECT models, decks FROM col LIMIT 1');
    if (colResult.length && colResult[0].values.length) {
      const modelsJson = colResult[0].values[0][0] as string;
      const decksJson = colResult[0].values[0][1] as string;

      try {
        const modelsData = JSON.parse(modelsJson);
        for (const [id, model] of Object.entries(modelsData)) {
          const m = model as { name?: string; flds?: { name: string; ord: number }[] };
          models[Number(id)] = {
            id: Number(id),
            name: m.name || 'Unknown',
            flds: m.flds || [],
          };
        }
      } catch {
        console.warn('Failed to parse models from col');
      }

      try {
        const decksData = JSON.parse(decksJson);
        const deckValues = Object.values(decksData) as { name?: string }[];
        const nonDefaultDecks = deckValues.filter(d => d.name && d.name !== 'Default');
        if (nonDefaultDecks.length > 0) {
          deckName = nonDefaultDecks.sort((a, b) =>
            (b.name?.length || 0) - (a.name?.length || 0)
          )[0].name || 'Imported Deck';
        }
      } catch {
        console.warn('Failed to parse decks from col');
      }
    }
  }

  // Log model info for debugging
  console.log('Found models:', Object.keys(models).length, models);

  onProgress?.('Parsing notes...', 75);

  // Parse notes
  const notes: AnkiNote[] = [];

  // First check the notes table structure
  const notesSchemaResult = db.exec("PRAGMA table_info(notes)");
  console.log('Notes table schema:', notesSchemaResult.length ? notesSchemaResult[0].values : 'not found');

  // Count notes first
  const countResult = db.exec('SELECT COUNT(*) FROM notes');
  const noteCount = countResult.length ? countResult[0].values[0][0] : 0;
  console.log('Total notes in database:', noteCount);

  // The notes table may have different column names in different Anki versions
  // Standard columns: id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data
  const notesResult = db.exec('SELECT id, guid, mid, mod, tags, flds, sfld FROM notes');
  console.log('Notes query returned:', notesResult.length ? notesResult[0].values.length : 0, 'rows');

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
        flds: fldsStr.split('\x1f'),
        sfld: row[6] as string,
      });
    }
  }

  console.log('Parsed notes:', notes.length);
  if (notes.length > 0) {
    console.log('Sample note mid:', notes[0].mid, 'model exists:', !!models[notes[0].mid]);
  }

  db.close();
  onProgress?.('Done parsing!', 100);

  return {
    deckName,
    notes,
    models,
    media,
    mediaMapping,
  };
}

/**
 * Extract image references from HTML content
 */
function extractImageReferences(html: string): string[] {
  const images: string[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[1]);
  }
  return images;
}

/**
 * Process cloze deletions
 */
function processClozeText(text: string, showAnswers: boolean): string {
  return text.replace(/\{\{c(\d+)::([^}]+?)(?:::([^}]+))?\}\}/g, (_, num, answer, hint) => {
    if (showAnswers) {
      return `<span class="cloze-answer" data-cloze="${num}">${answer}</span>`;
    }
    const hintText = hint ? ` (${hint})` : '';
    return `<span class="cloze-blank" data-cloze="${num}">[...]${hintText}</span>`;
  });
}

/**
 * Strip HTML tags
 */
function stripHtml(html: string): string {
  let text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?(b|strong)>/gi, '**')
    .replace(/<\/?(i|em)>/gi, '*')
    .replace(/<\/?(u)>/gi, '_');

  text = text.replace(/<[^>]+>/g, '');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return text.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Convert parsed APKG to flashcards
 */
export function convertToFlashcardsClient(
  parsed: ParsedAPKGClient,
  onProgress?: (message: string, percent: number) => void
): ParsedFlashcardClient[] {
  const flashcards: ParsedFlashcardClient[] = [];

  for (let i = 0; i < parsed.notes.length; i++) {
    const note = parsed.notes[i];
    const model = parsed.models[note.mid];
    if (!model) continue;

    const fieldNames = model.flds.map(f => f.name.toLowerCase());
    const fields: Record<string, string> = {};
    fieldNames.forEach((name, idx) => {
      fields[name] = note.flds[idx] || '';
    });

    let front = '';
    let back = '';
    let extra = '';

    const frontCandidates = ['text', 'front', 'question', 'cloze'];
    const backCandidates = ['extra', 'back', 'answer', 'extra / explanation'];
    const extraCandidates = ['lecture notes', 'missed questions', 'pathoma', 'boards and beyond', 'first aid'];

    for (const candidate of frontCandidates) {
      if (fields[candidate]) {
        front = fields[candidate];
        break;
      }
    }

    for (const candidate of backCandidates) {
      if (fields[candidate]) {
        back = fields[candidate];
        break;
      }
    }

    if (!front && note.flds.length > 0) front = note.flds[0];
    if (!back && note.flds.length > 1) back = note.flds[1];

    const extras: string[] = [];
    for (const candidate of extraCandidates) {
      if (fields[candidate]?.trim()) {
        extras.push(fields[candidate]);
      }
    }
    if (extras.length > 0) extra = extras.join('\n\n---\n\n');

    // Collect image filenames
    const imageFilenames = new Set<string>();
    for (const field of note.flds) {
      for (const img of extractImageReferences(field)) {
        imageFilenames.add(img);
      }
    }

    const isCloze = front.includes('{{c');

    if (isCloze) {
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
          imageFilenames: Array.from(imageFilenames),
          clozeIndex: clozeNum,
          deckName: parsed.deckName,
          noteId: note.id,
        });
      });
    } else {
      flashcards.push({
        front: stripHtml(front),
        back: stripHtml(back),
        extra: extra ? stripHtml(extra) : undefined,
        tags: note.tags,
        imageFilenames: Array.from(imageFilenames),
        deckName: parsed.deckName,
        noteId: note.id,
      });
    }

    if (i % 1000 === 0 && onProgress) {
      onProgress(`Processing cards (${i}/${parsed.notes.length})...`, (i / parsed.notes.length) * 100);
    }
  }

  return flashcards;
}

/**
 * Get statistics about the parsed APKG
 */
export function getAPKGStatsClient(parsed: ParsedAPKGClient, flashcards: ParsedFlashcardClient[]): APKGStats {
  const uniqueTags = new Set<string>();
  let clozeCount = 0;
  let regularCount = 0;

  for (const card of flashcards) {
    for (const tag of card.tags) {
      uniqueTags.add(tag);
    }
    if (card.clozeIndex !== undefined) {
      clozeCount++;
    } else {
      regularCount++;
    }
  }

  return {
    deckName: parsed.deckName,
    totalNotes: parsed.notes.length,
    totalCards: flashcards.length,
    totalMedia: parsed.media.size,
    uniqueTags: uniqueTags.size,
    tags: Array.from(uniqueTags).slice(0, 50),
    clozeCount,
    regularCount,
  };
}
