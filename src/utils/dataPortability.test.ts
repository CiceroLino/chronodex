import { describe, expect, test } from 'vitest';
import { CATEGORY_COLORS, type Reminder, type TimeBlock } from '../types';
import {
  createChronodexExportData,
  parseBlocks,
  parseChronodexImportData,
} from './dataPortability';

const block: TimeBlock = {
  id: 'block-1',
  title: 'Deep work',
  description: 'Focus time',
  startTime: '09:00',
  endTime: '10:30',
  category: 'Trabalho',
  color: CATEGORY_COLORS.Trabalho,
  highlighted: true,
};

const reminder: Reminder = {
  id: 'reminder-1',
  title: 'Stand up',
  description: 'Team sync',
  time: '09:15',
  enabled: true,
};

describe('data portability', () => {
  test('exports and imports the same block and reminder payload', () => {
    const exported = createChronodexExportData([block], [reminder], '2026-06-17T00:00:00.000Z');
    const imported = parseChronodexImportData(JSON.parse(JSON.stringify(exported)));

    expect(exported).toEqual({
      app: 'chronodex',
      version: 1,
      exportedAt: '2026-06-17T00:00:00.000Z',
      blocks: [block],
      reminders: [reminder],
    });
    expect(imported).toEqual({ blocks: [block], reminders: [reminder] });
  });

  test('keeps compatibility with legacy block-array exports', () => {
    expect(parseChronodexImportData([block])).toEqual({ blocks: [block], reminders: [] });
  });

  test('rejects malformed blocks instead of re-exporting low-quality JSON', () => {
    expect(
      parseBlocks([
        { ...block, startTime: '25:00' },
        { ...block, color: 'blue' },
        { ...block, title: '' },
      ]),
    ).toEqual([]);
  });
});
