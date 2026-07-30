export const CHRONODEX_GEOMETRY = {
  center: 250,
  rings: {
    am: {
      inner: 120,
      outer: 150,
      labelRadius: 108,
      tickInner: 151,
      tickOuter: 158,
    },
    pm: {
      inner: 160,
      outer: 194,
      labelRadius: 209,
      tickInner: 195,
      tickOuter: 205,
    },
  },
  currentTime: {
    am: { inner: 120, outer: 150 },
    pm: { inner: 160, outer: 194 },
  },
  compassProgressRadius: 194,
  compassNodeRadius: 236,
} as const;

export type ChronodexRingPeriod = keyof typeof CHRONODEX_GEOMETRY.rings;

export function describeChronodexRingClip(
  period: ChronodexRingPeriod,
): string {
  const { center, rings } = CHRONODEX_GEOMETRY;
  const { inner, outer } = rings[period];

  return [
    'M', center + outer, center,
    'A', outer, outer, 0, 1, 0, center - outer, center,
    'A', outer, outer, 0, 1, 0, center + outer, center,
    'Z',
    'M', center + inner, center,
    'A', inner, inner, 0, 1, 1, center - inner, center,
    'A', inner, inner, 0, 1, 1, center + inner, center,
    'Z',
  ].join(' ');
}
