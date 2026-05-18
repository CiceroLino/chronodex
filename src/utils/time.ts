import type { TimeBlock } from '../types';

export type MinuteRange = {
  start: number;
  end: number;
};

const DAY_MINUTES = 1440;

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
  const shifted = ((minutes - 720) % DAY_MINUTES) + DAY_MINUTES;
  return minutesToAngle(shifted % DAY_MINUTES);
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

export function getTotalPlannedMinutes(blocks: TimeBlock[]): number {
  return blocks.reduce(
    (total, block) => total + getDuration(block.startTime, block.endTime),
    0,
  );
}
