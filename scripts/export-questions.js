#!/usr/bin/env node
/**
 * Export Questions from Supabase to Local JSON
 *
 * Usage: node scripts/export-questions.js
 *
 * This script exports all questions from the Supabase 'questions' table
 * to a local JSON file for easier editing and backup.
 */

const fs = require('fs');
const path = require('path');

// Supabase configuration (from .env.local)
const SUPABASE_URL = 'https://hhqmshbprwgnjnvibntp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocW1zaGJwcndnbmpudmlibnRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjM1NTU0MCwiZXhwIjoyMDgxOTMxNTQwfQ.0b_2c3zVrHYYEjWtGIXbixzJgA7AUb947PTklyThzMk';

async function exportQuestions() {
  console.log('Exporting questions from Supabase...\n');

  try {
    // Fetch all questions from Supabase REST API
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?select=*&order=batch,question_id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
    }

    const questions = await response.json();

    console.log(`Found ${questions.length} questions\n`);

    // Group by batch for summary
    const batches = {};
    questions.forEach(q => {
      batches[q.batch] = (batches[q.batch] || 0) + 1;
    });

    console.log('Questions by Batch:');
    Object.entries(batches).sort().forEach(([batch, count]) => {
      console.log(`  ${batch}: ${count}`);
    });
    console.log('');

    // Create output directory if needed
    const outputDir = path.join(__dirname, '..', 'src', 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write JSON file
    const outputPath = path.join(outputDir, 'questions.json');
    fs.writeFileSync(
      outputPath,
      JSON.stringify(questions, null, 2),
      'utf8'
    );

    console.log(`Exported to: ${outputPath}`);
    console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);

    // Also create a CSV export for spreadsheet editing
    const csvPath = path.join(outputDir, 'questions.csv');
    const csvHeader = 'id,question_id,concept_id,batch,system,stem,options,correct_answer,explanation,cognitive_error,status\n';
    const csvRows = questions.map(q => {
      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      return [
        escapeCsv(q.id),
        escapeCsv(q.question_id),
        escapeCsv(q.concept_id),
        escapeCsv(q.batch),
        escapeCsv(q.system),
        escapeCsv(q.stem),
        escapeCsv(q.options),
        escapeCsv(q.correct_answer),
        escapeCsv(q.explanation),
        escapeCsv(q.cognitive_error),
        escapeCsv(q.status)
      ].join(',');
    }).join('\n');

    fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf8');
    console.log(`CSV export: ${csvPath}`);
    console.log(`CSV size: ${(fs.statSync(csvPath).size / 1024).toFixed(1)} KB`);

    console.log('\nDone!');

  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

exportQuestions();
