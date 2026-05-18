import { describe, expect, test } from 'vitest';
import {
  describeAnnularSector,
  describeArc,
  detectOverlaps,
  getBlockProgressPercent,
  getDuration,
  getChronodexAngleRange,
  minutesToAngle,
  minutesToChronodexAngle,
  minutesToTime,
  splitBlockRange,
  splitBlockRangeByHalfDay,
  sortBlocksForChronodex,
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

  test('maps chronodex minutes as a twelve-hour cycle with noon and midnight at the top', () => {
    expect(minutesToChronodexAngle(0)).toBe(-90);
    expect(minutesToChronodexAngle(180)).toBe(0);
    expect(minutesToChronodexAngle(360)).toBe(90);
    expect(minutesToChronodexAngle(540)).toBe(180);
    expect(minutesToChronodexAngle(720)).toBe(-90);
    expect(minutesToChronodexAngle(900)).toBe(0);
  });

  test('returns short chronodex angle ranges across the twelve o clock point', () => {
    expect(getChronodexAngleRange(-26, 26)).toEqual({
      startAngle: 257,
      endAngle: 283,
    });
    expect(getChronodexAngleRange(1380, 1440)).toEqual({
      startAngle: 240,
      endAngle: 270,
    });
  });

  test('splits ranges that cross midnight into two renderable segments', () => {
    expect(splitBlockRange(block('night', '22:00', '01:00'))).toEqual([
      { start: 1320, end: 1440 },
      { start: 0, end: 60 },
    ]);
  });

  test('splits blocks into AM and PM chronodex rings', () => {
    expect(splitBlockRangeByHalfDay(block('mixed', '11:00', '13:30'))).toEqual([
      { start: 660, end: 720, period: 'am' },
      { start: 720, end: 810, period: 'pm' },
    ]);
    expect(splitBlockRangeByHalfDay(block('night', '23:00', '01:00'))).toEqual([
      { start: 1380, end: 1440, period: 'pm' },
      { start: 0, end: 60, period: 'am' },
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

  test('calculates progress percentage for an active block', () => {
    expect(getBlockProgressPercent(timeToMinutes('09:30'), block('work', '09:00', '10:00')))
      .toBe(50);
    expect(getBlockProgressPercent(timeToMinutes('09:00'), block('work', '09:00', '10:00')))
      .toBe(0);
    expect(getBlockProgressPercent(timeToMinutes('09:59'), block('work', '09:00', '10:00')))
      .toBe(98);
  });

  test('calculates progress percentage for active blocks across midnight', () => {
    const nightBlock = block('night', '23:00', '01:00');

    expect(getBlockProgressPercent(timeToMinutes('23:30'), nightBlock)).toBe(25);
    expect(getBlockProgressPercent(timeToMinutes('00:00'), nightBlock)).toBe(50);
    expect(getBlockProgressPercent(timeToMinutes('00:30'), nightBlock)).toBe(75);
  });

  test('sorts highlighted chronodex blocks after regular blocks for rendering', () => {
    const regular = block('regular', '09:00', '10:00');
    const highlighted = { ...block('highlighted', '09:30', '10:30'), highlighted: true };

    expect(sortBlocksForChronodex([highlighted, regular])).toEqual([
      regular,
      highlighted,
    ]);
  });

  test('returns an SVG path for an arc segment', () => {
    const path = describeArc(250, 250, 170, 0, 90);

    expect(path).toMatch(/^M /);
    expect(path).toContain(' A 170 170 0 0 1 ');
  });

  test('returns a closed SVG path for an annular sector', () => {
    const path = describeAnnularSector(250, 250, 160, 194, -90, -60);

    expect(path).toMatch(/^M /);
    expect(path).toContain(' A 194 194 0 0 1 ');
    expect(path).toContain(' L ');
    expect(path).toContain(' A 160 160 0 0 0 ');
    expect(path.endsWith(' Z')).toBe(true);
  });
});
