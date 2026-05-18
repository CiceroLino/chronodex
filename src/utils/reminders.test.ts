import { describe, expect, test } from 'vitest';
import type { Reminder, TimeBlock } from '../types';
import {
  getBlockEventKey,
  getDueBlockEvents,
  getDueReminderEvents,
  getReminderEventKey,
  parseReminders,
} from './reminders';

const block = (id: string, startTime: string, endTime: string): TimeBlock => ({
  id,
  title: id,
  description: '',
  startTime,
  endTime,
  category: 'Trabalho',
  color: '#2563eb',
});

const reminder = (id: string, time: string, enabled = true): Reminder => ({
  id,
  title: id,
  description: '',
  time,
  enabled,
});

describe('reminder utilities', () => {
  test('parses valid reminders from stored values', () => {
    const reminders = parseReminders([
      reminder('valid', '09:30'),
      { title: 'missing id', time: '10:00', enabled: true },
      { id: 'bad-time', title: 'Bad', time: '99:99', enabled: true },
    ]);

    expect(reminders).toEqual([reminder('valid', '09:30')]);
  });

  test('returns enabled reminders due on the current minute', () => {
    const due = getDueReminderEvents(
      [reminder('first', '09:30'), reminder('disabled', '09:30', false)],
      new Date('2026-05-18T09:30:15'),
    );

    expect(due).toEqual([reminder('first', '09:30')]);
  });

  test('returns block start and end events due on the current minute', () => {
    const events = getDueBlockEvents(
      [block('work', '09:30', '10:30'), block('study', '08:00', '09:30')],
      new Date('2026-05-18T09:30:01'),
    );

    expect(events).toEqual([
      { kind: 'block-start', block: block('work', '09:30', '10:30') },
      { kind: 'block-end', block: block('study', '08:00', '09:30') },
    ]);
  });

  test('creates stable daily event keys', () => {
    const now = new Date('2026-05-18T09:30:01');

    expect(getReminderEventKey(reminder('first', '09:30'), now))
      .toBe('2026-05-18:reminder:first');
    expect(getBlockEventKey('block-start', block('work', '09:30', '10:30'), now))
      .toBe('2026-05-18:block-start:work');
  });
});
