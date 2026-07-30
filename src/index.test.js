import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');
const reminderForm = readFileSync(join(process.cwd(), 'src/components/ReminderForm.tsx'), 'utf8');
const timeBlockForm = readFileSync(join(process.cwd(), 'src/components/TimeBlockForm.tsx'), 'utf8');
const timeInput = readFileSync(join(process.cwd(), 'src/components/TimeInput.tsx'), 'utf8');

describe('global styles', () => {
  test('replaces native time picker indicators with a theme-aware clock icon', () => {
    expect(css).toContain('.time-input-trigger');
    expect(css).toMatch(/\.time-input::-webkit-calendar-picker-indicator\s*\{[^}]*opacity:\s*0/s);
    expect(css).toMatch(/\.dark\s+\.time-input-trigger\s*\{[^}]*background-color:\s*#fff/s);
  });

  test('uses the custom time input styling on reminder and block time fields', () => {
    expect(timeInput).toContain('time-input-shell');
    expect(timeInput).toContain('time-input');
    expect(timeInput).toContain('time-input-trigger');
    expect(reminderForm).toContain('<TimeInput');
    expect(timeBlockForm).toContain('<TimeInput');
  });

  test('keeps Chronodex entrance motion on its final geometry', () => {
    const lineEntrance = css.slice(
      css.indexOf('@keyframes chronodex-line-draw'),
      css.indexOf('@keyframes chronodex-tick-draw'),
    );
    const tickEntrance = css.slice(
      css.indexOf('@keyframes chronodex-tick-draw'),
      css.indexOf('@keyframes chronodex-label-in'),
    );

    expect(lineEntrance).not.toContain('stroke-dashoffset');
    expect(lineEntrance).not.toContain('stroke-dasharray');
    expect(tickEntrance).not.toContain('transform:');
    expect(css).not.toContain('transform: scale(0.985)');
  });

  test('provides a static Chronodex state for reduced motion', () => {
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.chronodex-line-draw/,
    );
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none\s*!important/,
    );
    expect(css).toMatch(
      /\*::after\s*\{\s*transition:\s*none\s*!important/,
    );
  });
});
