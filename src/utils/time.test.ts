import { describe, expect, test } from 'vitest';
import {
  describeArc,
  detectOverlaps,
  getDuration,
  minutesToAngle,
  minutesToTime,
  splitBlockRange,
  timeToMinutes,
} from './time';
import type { TimeBlock } from '../types';

const block = (id: string, startTime: string, endTime: string): TimeBlock => ({
  id,
  title: id,
  description: '',
  startTime,
  endTime,
  category: 'Trabalho',
  color: '#2563eb',
});

describe('time utilities', () => {
  test('converts HH:mm values to minutes and back', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('13:45')).toBe(825);
    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(825)).toBe('13:45');
    expect(minutesToTime(1440)).toBe('00:00');
  });

  test('calculates duration across midnight', () => {
    expect(getDuration('09:00', '11:30')).toBe(150);
    expect(getDuration('22:00', '01:00')).toBe(180);
  });

  test('maps minutes to a clockwise angle with midnight at the top', () => {
    expect(minutesToAngle(0)).toBe(-90);
    expect(minutesToAngle(360)).toBe(0);
    expect(minutesToAngle(720)).toBe(90);
    expect(minutesToAngle(1080)).toBe(180);
  });

  test('splits ranges that cross midnight into two renderable segments', () => {
    expect(splitBlockRange(block('night', '22:00', '01:00'))).toEqual([
      { start: 1320, end: 1440 },
      { start: 0, end: 60 },
    ]);
  });

  test('detects overlaps, including blocks that cross midnight', () => {
    const overlaps = detectOverlaps([
      block('work', '09:00', '12:00'),
      block('meeting', '11:00', '13:00'),
      block('sleep', '22:00', '01:00'),
      block('reading', '00:30', '02:00'),
    ]);

    expect(overlaps).toEqual(new Set(['work', 'meeting', 'sleep', 'reading']));
  });

  test('returns an SVG path for an arc segment', () => {
    const path = describeArc(250, 250, 170, 0, 90);

    expect(path).toMatch(/^M /);
    expect(path).toContain(' A 170 170 0 0 1 ');
  });
});
