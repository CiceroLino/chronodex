import { describe, expect, test } from 'vitest';
import {
  CHRONODEX_GEOMETRY,
  describeChronodexRingClip,
} from './chronodexGeometry';

describe('Chronodex geometry', () => {
  test('keeps the compass progress on the PM perimeter', () => {
    expect(CHRONODEX_GEOMETRY.compassProgressRadius).toBe(
      CHRONODEX_GEOMETRY.rings.pm.outer,
    );
    expect(CHRONODEX_GEOMETRY.compassProgressRadius).toBeLessThanOrEqual(
      CHRONODEX_GEOMETRY.rings.pm.tickOuter,
    );
  });

  test('keeps each time indicator inside its period ring', () => {
    expect(CHRONODEX_GEOMETRY.currentTime.am).toEqual({
      inner: CHRONODEX_GEOMETRY.rings.am.inner,
      outer: CHRONODEX_GEOMETRY.rings.am.outer,
    });
    expect(CHRONODEX_GEOMETRY.currentTime.pm).toEqual({
      inner: CHRONODEX_GEOMETRY.rings.pm.inner,
      outer: CHRONODEX_GEOMETRY.rings.pm.outer,
    });
  });

  test('describes both boundaries of an annular ring clip', () => {
    const clip = describeChronodexRingClip('am');

    expect(clip.match(/A 150 150/g)).toHaveLength(2);
    expect(clip.match(/A 120 120/g)).toHaveLength(2);
    expect(clip).toMatch(/Z M 370 250/);
  });
});
