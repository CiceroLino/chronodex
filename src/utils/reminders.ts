import type { NoticeKind, Reminder, TimeBlock } from '../types';
import { timeToMinutes } from './time';

export type BlockEvent = {
  kind: Extract<NoticeKind, 'block-start' | 'block-end'>;
  block: TimeBlock;
};

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function getMinuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseReminders(value: unknown): Reminder[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): Reminder[] => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const reminder = item as Partial<Reminder>;

    if (
      typeof reminder.id !== 'string' ||
      typeof reminder.title !== 'string' ||
      typeof reminder.time !== 'string' ||
      !timePattern.test(reminder.time)
    ) {
      return [];
    }

    return [
      {
        id: reminder.id,
        title: reminder.title,
        description: typeof reminder.description === 'string' ? reminder.description : '',
        time: reminder.time,
        enabled: reminder.enabled !== false,
      },
    ];
  });
}

export function getDueReminderEvents(reminders: Reminder[], now: Date): Reminder[] {
  const currentMinute = getMinuteOfDay(now);

  return reminders.filter(
    (reminder) => reminder.enabled && timeToMinutes(reminder.time) === currentMinute,
  );
}

export function getDueBlockEvents(blocks: TimeBlock[], now: Date): BlockEvent[] {
  const currentMinute = getMinuteOfDay(now);
  const events: BlockEvent[] = [];

  blocks.forEach((block) => {
    if (timeToMinutes(block.startTime) === currentMinute) {
      events.push({ kind: 'block-start', block });
    }

    if (timeToMinutes(block.endTime) === currentMinute) {
      events.push({ kind: 'block-end', block });
    }
  });

  return events;
}

export function getReminderEventKey(reminder: Reminder, now: Date): string {
  return `${getDateKey(now)}:reminder:${reminder.id}`;
}

export function getBlockEventKey(
  kind: BlockEvent['kind'],
  block: TimeBlock,
  now: Date,
): string {
  return `${getDateKey(now)}:${kind}:${block.id}`;
}
