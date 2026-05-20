import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8');
const reminderForm = readFileSync(join(process.cwd(), 'src/components/ReminderForm.tsx'), 'utf8');
const timeBlockForm = readFileSync(join(process.cwd(), 'src/components/TimeBlockForm.tsx'), 'utf8');

describe('global styles', () => {
  test('replaces native time picker indicators with a theme-aware clock icon', () => {
    expect(css).toContain('.time-input-shell::after');
    expect(css).toMatch(/\.time-input::-webkit-calendar-picker-indicator\s*\{[^}]*opacity:\s*0/s);
    expect(css).toMatch(/\.dark\s+\.time-input-shell::after\s*\{[^}]*background-color:\s*#fff/s);
  });

  test('uses the custom time input styling on reminder and block time fields', () => {
    expect(reminderForm).toContain('time-input-shell');
    expect(reminderForm).toContain('time-input');
    expect(timeBlockForm).toContain('time-input-shell');
    expect(timeBlockForm).toContain('time-input');
  });
});
