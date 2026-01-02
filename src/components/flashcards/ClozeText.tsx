'use client';

import { useMemo } from 'react';

interface ClozeTextProps {
  text: string;
  showAnswers: boolean;
  className?: string;
}

interface ClozeSegment {
  type: 'text' | 'cloze';
  content: string;
  clozeNum?: number;
  hint?: string;
}

/**
 * Renders text with cloze deletions ({{c1::answer}} or {{c1::answer::hint}})
 * Shows blanks when answers are hidden, reveals answers when shown
 */
export function ClozeText({ text, showAnswers, className = '' }: ClozeTextProps) {
  const segments = useMemo(() => {
    const result: ClozeSegment[] = [];
    const clozeRegex = /\{\{c(\d+)::([^}]+?)(?:::([^}]+))?\}\}/g;

    let lastIndex = 0;
    let match;

    while ((match = clozeRegex.exec(text)) !== null) {
      // Add text before this cloze
      if (match.index > lastIndex) {
        result.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      // Add the cloze
      result.push({
        type: 'cloze',
        content: match[2], // The answer
        clozeNum: parseInt(match[1], 10),
        hint: match[3], // Optional hint
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      result.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return result;
  }, [text]);

  // Check if this text has any cloze deletions
  const hasCloze = segments.some(s => s.type === 'cloze');

  if (!hasCloze) {
    // No cloze deletions, render as plain text
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {segments.map((segment, idx) => {
        if (segment.type === 'text') {
          return <span key={idx}>{segment.content}</span>;
        }

        // Cloze segment
        if (showAnswers) {
          return (
            <span
              key={idx}
              className="inline-block px-1.5 py-0.5 mx-0.5 bg-primary/20 text-primary font-medium rounded border border-primary/30"
              title={`Cloze ${segment.clozeNum}`}
            >
              {segment.content}
            </span>
          );
        }

        // Show blank
        return (
          <span
            key={idx}
            className="inline-block px-3 py-0.5 mx-0.5 bg-surface-muted text-content-muted border-b-2 border-dashed border-primary/50 rounded font-mono"
            title={segment.hint ? `Hint: ${segment.hint}` : `Cloze ${segment.clozeNum}`}
          >
            {segment.hint ? (
              <span className="text-xs italic">{segment.hint}</span>
            ) : (
              <span className="text-xs">[...]</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Check if text contains cloze deletions
 */
export function hasClozeContent(text: string): boolean {
  return /\{\{c\d+::/.test(text);
}

/**
 * Strip cloze markup and return plain text with answers visible
 */
export function stripClozeMarkup(text: string): string {
  return text.replace(/\{\{c\d+::([^}]+?)(?:::[^}]+)?\}\}/g, '$1');
}

/**
 * Get all cloze numbers from text
 */
export function getClozeNumbers(text: string): number[] {
  const numbers = new Set<number>();
  const regex = /\{\{c(\d+)::/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    numbers.add(parseInt(match[1], 10));
  }
  return Array.from(numbers).sort((a, b) => a - b);
}
