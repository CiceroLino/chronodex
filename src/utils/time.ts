import { CATEGORIES, type Category, type TimeBlock } from '../types';

export type MinuteRange = {
  start: number;
  end: number;
};

export type ChronodexPeriod = 'am' | 'pm';

export type ChronodexRange = MinuteRange & {
  period: ChronodexPeriod;
};

export type Point = {
  x: number;
  y: number;
};

export type CategoryTimeShare = {
  category: Category;
  minutes: number;
  percentage: number;
};

export type ChronodexDayMetrics = {
  elapsedMinutes: number;
  elapsedPlannedMinutes: number;
  elapsedEmptyMinutes: number;
  remainingMinutes: number;
  remainingPlannedMinutes: number;
  remainingFreeMinutes: number;
};

export type ChronodexMetricScope = 'day' | MinuteRange;

const DAY_MINUTES = 1440;
const HALF_DAY_MINUTES = 720;
const SNAP_INTERVAL_MINUTES = 30;
const AM_RING = { inner: 120, outer: 150 };
const PM_RING = { inner: 160, outer: 194 };

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const normalized = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function getDuration(startTime: string, endTime: string): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end > start) {
    return end - start;
  }

  return DAY_MINUTES - start + end;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}min`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

export function minutesToAngle(minutes: number): number {
  return (minutes / DAY_MINUTES) * 360 - 90;
}

export function minutesToChronodexAngle(minutes: number): number {
  const normalized = ((minutes % HALF_DAY_MINUTES) + HALF_DAY_MINUTES) % HALF_DAY_MINUTES;
  return (normalized / HALF_DAY_MINUTES) * 360 - 90;
}

export function getChronodexMinuteFromPoint(center: Point, point: Point): number | null {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const radius = Math.sqrt(dx ** 2 + dy ** 2);
  const periodOffset = radius >= AM_RING.inner && radius <= AM_RING.outer
    ? 0
    : radius >= PM_RING.inner && radius <= PM_RING.outer
      ? HALF_DAY_MINUTES
      : null;

  if (periodOffset === null) {
    return null;
  }

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const rawHalfDayMinutes = (((angle + 90 + 360) % 360) / 360) * HALF_DAY_MINUTES;
  const snappedHalfDayMinutes =
    Math.round(rawHalfDayMinutes / SNAP_INTERVAL_MINUTES) * SNAP_INTERVAL_MINUTES;
  const boundedHalfDayMinutes =
    snappedHalfDayMinutes === HALF_DAY_MINUTES
      ? HALF_DAY_MINUTES - SNAP_INTERVAL_MINUTES
      : snappedHalfDayMinutes;

  return periodOffset + boundedHalfDayMinutes;
}

export function getNearestChronodexMinute(referenceMinute: number, minute: number): number {
  const candidates = [minute, minute - DAY_MINUTES, minute + DAY_MINUTES];
  const isTwelveOClockPoint =
    ((minute % HALF_DAY_MINUTES) + HALF_DAY_MINUTES) % HALF_DAY_MINUTES === 0;

  if (isTwelveOClockPoint) {
    candidates.push(minute - HALF_DAY_MINUTES, minute + HALF_DAY_MINUTES);
  }

  return candidates.reduce((nearest, candidate) => {
    const nearestDistance = Math.abs(nearest - referenceMinute);
    const candidateDistance = Math.abs(candidate - referenceMinute);

    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}

export function getBlockTimeRangeFromStartMinute(startMinute: number): {
  startTime: string;
  endTime: string;
} {
  return getBlockTimeRangeFromMinuteRange(startMinute, startMinute);
}

export function getBlockTimeRangeFromMinuteRange(startMinute: number, endMinute: number): {
  startTime: string;
  endTime: string;
} {
  const start = Math.min(startMinute, endMinute);
  const selectedEnd = Math.max(startMinute, endMinute);
  const crossesMidnight = selectedEnd - start > HALF_DAY_MINUTES;
  const end = selectedEnd === start
    ? start + SNAP_INTERVAL_MINUTES
    : crossesMidnight
      ? start
      : selectedEnd;

  return {
    startTime: minutesToTime(crossesMidnight ? selectedEnd : start),
    endTime: minutesToTime(end),
  };
}

export function getChronodexAngleRange(startMinutes: number, endMinutes: number) {
  const startAngle = minutesToChronodexAngle(startMinutes);
  const span = ((endMinutes - startMinutes) / HALF_DAY_MINUTES) * 360;

  return {
    startAngle,
    endAngle: startAngle + span,
  };
}

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export function getRadialDragOffset(
  origin: Point,
  center: Point,
  point: Point,
  maxOffset: number,
): number {
  const inwardX = center.x - origin.x;
  const inwardY = center.y - origin.y;
  const length = Math.sqrt(inwardX ** 2 + inwardY ** 2);

  if (length === 0) {
    return 0;
  }

  const unitX = inwardX / length;
  const unitY = inwardY / length;
  const dragX = point.x - origin.x;
  const dragY = point.y - origin.y;
  const offset = dragX * unitX + dragY * unitY;

  return Math.min(Math.max(Math.round(offset), 0), maxOffset);
}

export function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(centerX, centerY, radius, startAngle);
  const end = polarToCartesian(centerX, centerY, radius, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? '1' : '0';

  return [
    'M',
    start.x.toFixed(3),
    start.y.toFixed(3),
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    1,
    end.x.toFixed(3),
    end.y.toFixed(3),
  ].join(' ');
}

export function describeAnnularSector(
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const outerEnd = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? '1' : '0';

  return [
    'M',
    outerStart.x.toFixed(3),
    outerStart.y.toFixed(3),
    'A',
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    1,
    outerEnd.x.toFixed(3),
    outerEnd.y.toFixed(3),
    'L',
    innerEnd.x.toFixed(3),
    innerEnd.y.toFixed(3),
    'A',
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    0,
    innerStart.x.toFixed(3),
    innerStart.y.toFixed(3),
    'Z',
  ].join(' ');
}

export function splitBlockRange(block: TimeBlock): MinuteRange[] {
  const start = timeToMinutes(block.startTime);
  const end = timeToMinutes(block.endTime);

  if (end > start) {
    return [{ start, end }];
  }

  return [
    { start, end: DAY_MINUTES },
    { start: 0, end },
  ];
}

export function splitBlockRangeByHalfDay(block: TimeBlock): ChronodexRange[] {
  return splitBlockRange(block).flatMap((range) => {
    const slices: ChronodexRange[] = [];

    for (let start = range.start; start < range.end; ) {
      const nextBoundary =
        start < HALF_DAY_MINUTES ? HALF_DAY_MINUTES : DAY_MINUTES;
      const end = Math.min(range.end, nextBoundary);

      slices.push({
        start,
        end,
        period: start < HALF_DAY_MINUTES ? 'am' : 'pm',
      });

      start = end;
    }

    return slices;
  });
}

export function isChronodexBlockBoundaryMinute(minute: number, block: TimeBlock): boolean {
  return splitBlockRangeByHalfDay(block).some((range) => {
    const periodOffset = range.period === 'am' ? 0 : HALF_DAY_MINUTES;
    const rangeStart = periodOffset + (((range.start % HALF_DAY_MINUTES) + HALF_DAY_MINUTES) % HALF_DAY_MINUTES);
    const rangeEnd = periodOffset + (((range.end % HALF_DAY_MINUTES) + HALF_DAY_MINUTES) % HALF_DAY_MINUTES);

    return minute === rangeStart || minute === rangeEnd;
  });
}

export function detectOverlaps(blocks: TimeBlock[]): Set<string> {
  const overlaps = new Set<string>();
  const ranges = blocks.flatMap((block) =>
    splitBlockRange(block).map((range) => ({ ...range, id: block.id })),
  );

  for (let i = 0; i < ranges.length; i += 1) {
    for (let j = i + 1; j < ranges.length; j += 1) {
      const first = ranges[i];
      const second = ranges[j];
      const hasOverlap = first.start < second.end && second.start < first.end;

      if (hasOverlap) {
        overlaps.add(first.id);
        overlaps.add(second.id);
      }
    }
  }

  return overlaps;
}

export function isMinuteInsideBlock(minute: number, block: TimeBlock): boolean {
  return splitBlockRange(block).some(
    (range) => minute >= range.start && minute < range.end,
  );
}

export function getBlockProgressPercent(minute: number, block: TimeBlock): number {
  if (!isMinuteInsideBlock(minute, block)) {
    return 0;
  }

  const start = timeToMinutes(block.startTime);
  const end = timeToMinutes(block.endTime);
  const adjustedMinute = end <= start && minute < start ? minute + DAY_MINUTES : minute;
  const elapsed = adjustedMinute - start;

  return Number(((elapsed / getDuration(block.startTime, block.endTime)) * 100).toFixed(1));
}

export function getTotalPlannedMinutes(blocks: TimeBlock[]): number {
  return blocks.reduce(
    (total, block) => total + getDuration(block.startTime, block.endTime),
    0,
  );
}

export function getCategoryTimeShares(blocks: TimeBlock[]): CategoryTimeShare[] {
  return CATEGORIES.map((category) => {
    const minutes = blocks
      .filter((block) => block.category === category)
      .reduce((total, block) => total + getDuration(block.startTime, block.endTime), 0);

    return {
      category,
      minutes,
      percentage: Number(((minutes / DAY_MINUTES) * 100).toFixed(1)),
    };
  });
}

function getMergedDuration(ranges: MinuteRange[]): number {
  const sortedRanges = [...ranges].sort((first, second) => first.start - second.start);
  const mergedRanges = sortedRanges.reduce<MinuteRange[]>((merged, range) => {
    const previous = merged.at(-1);

    if (!previous || range.start > previous.end) {
      merged.push({ ...range });
      return merged;
    }

    previous.end = Math.max(previous.end, range.end);
    return merged;
  }, []);

  return mergedRanges.reduce((total, range) => total + range.end - range.start, 0);
}

function getPlannedMinutesBetween(blocks: TimeBlock[], startMinute: number, endMinute: number): number {
  const clippedRanges = blocks.flatMap((block) =>
    splitBlockRange(block)
      .map((range) => ({
        start: Math.max(range.start, startMinute),
        end: Math.min(range.end, endMinute),
      }))
      .filter((range) => range.end > range.start),
  );

  return getMergedDuration(clippedRanges);
}

export function getChronodexDayMetrics(
  blocks: TimeBlock[],
  currentMinute: number,
): ChronodexDayMetrics {
  return getChronodexScopeMetrics(blocks, currentMinute, 'day');
}

export function getChronodexScopeMetrics(
  blocks: TimeBlock[],
  currentMinute: number,
  scope: ChronodexMetricScope,
): ChronodexDayMetrics {
  const scopeStart = scope === 'day' ? 0 : scope.start;
  const scopeEnd = scope === 'day' ? DAY_MINUTES : scope.end;
  const scopedCurrentMinute = Math.min(Math.max(currentMinute, scopeStart), scopeEnd);
  const elapsedMinutes = scopedCurrentMinute - scopeStart;
  const remainingMinutes = scopeEnd - scopedCurrentMinute;
  const elapsedPlannedMinutes = getPlannedMinutesBetween(blocks, scopeStart, scopedCurrentMinute);
  const remainingPlannedMinutes = getPlannedMinutesBetween(blocks, scopedCurrentMinute, scopeEnd);

  return {
    elapsedMinutes,
    elapsedPlannedMinutes,
    elapsedEmptyMinutes: elapsedMinutes - elapsedPlannedMinutes,
    remainingMinutes,
    remainingPlannedMinutes,
    remainingFreeMinutes: remainingMinutes - remainingPlannedMinutes,
  };
}

export function getSpiderPointRadius(
  minutes: number,
  maxMinutes: number,
  progress: number,
): number {
  const boundedProgress = Math.min(Math.max(progress, 0), 1);
  const finalRadius = minutes === 0 ? 10 : 20 + (minutes / maxMinutes) * 74;

  return Number((finalRadius * boundedProgress).toFixed(2));
}

export function sortBlocksForChronodex(blocks: TimeBlock[]): TimeBlock[] {
  return [...blocks].sort((first, second) => {
    if (first.highlighted === second.highlighted) {
      return timeToMinutes(first.startTime) - timeToMinutes(second.startTime);
    }

    return first.highlighted ? 1 : -1;
  });
}
