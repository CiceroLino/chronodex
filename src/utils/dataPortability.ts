import { CATEGORIES, type Reminder, type TimeBlock } from '../types';
import { parseReminders } from './reminders';

export const CHRONODEX_EXPORT_VERSION = 1;

export type ChronodexExportData = {
  app: 'chronodex';
  version: typeof CHRONODEX_EXPORT_VERSION;
  exportedAt: string;
  blocks: TimeBlock[];
  reminders: Reminder[];
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const colorPattern = /^#(?:[\da-f]{3}){1,2}$/i;

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function parseBlocks(value: unknown): TimeBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): TimeBlock[] => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const block = item as Partial<TimeBlock>;
    const category = block.category;
    const hasValidCategory = typeof category === 'string' && CATEGORIES.includes(category);

    if (
      typeof block.title !== 'string' ||
      block.title.trim().length === 0 ||
      typeof block.startTime !== 'string' ||
      !timePattern.test(block.startTime) ||
      typeof block.endTime !== 'string' ||
      !timePattern.test(block.endTime) ||
      typeof block.color !== 'string' ||
      !colorPattern.test(block.color) ||
      !hasValidCategory
    ) {
      return [];
    }

    return [
      {
        id: typeof block.id === 'string' && block.id.trim() ? block.id : createId(),
        title: block.title,
        description: typeof block.description === 'string' ? block.description : '',
        startTime: block.startTime,
        endTime: block.endTime,
        category,
        color: block.color,
        highlighted: block.highlighted === true,
      },
    ];
  });
}

export function createChronodexExportData(
  blocks: TimeBlock[],
  reminders: Reminder[],
  exportedAt = new Date().toISOString(),
): ChronodexExportData {
  return {
    app: 'chronodex',
    version: CHRONODEX_EXPORT_VERSION,
    exportedAt,
    blocks: parseBlocks(blocks),
    reminders: parseReminders(reminders),
  };
}

export function parseChronodexImportData(value: unknown): Pick<ChronodexExportData, 'blocks' | 'reminders'> {
  if (Array.isArray(value)) {
    return {
      blocks: parseBlocks(value),
      reminders: [],
    };
  }

  if (!value || typeof value !== 'object') {
    return { blocks: [], reminders: [] };
  }

  const data = value as Partial<ChronodexExportData>;

  return {
    blocks: parseBlocks(data.blocks),
    reminders: parseReminders(data.reminders),
  };
}
