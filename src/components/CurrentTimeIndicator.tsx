import { CHRONODEX_GEOMETRY } from '../chronodexGeometry';
import { minutesToChronodexAngle, polarToCartesian } from '../utils/time';

type CurrentTimeIndicatorProps = {
  now: Date;
};

export function CurrentTimeIndicator({ now }: CurrentTimeIndicatorProps) {
  const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const angle = minutesToChronodexAngle(minutes);
  const isPm = now.getHours() >= 12;
  const radii = isPm
    ? CHRONODEX_GEOMETRY.currentTime.pm
    : CHRONODEX_GEOMETRY.currentTime.am;
  const inner = polarToCartesian(
    CHRONODEX_GEOMETRY.center,
    CHRONODEX_GEOMETRY.center,
    radii.inner,
    angle,
  );
  const outer = polarToCartesian(
    CHRONODEX_GEOMETRY.center,
    CHRONODEX_GEOMETRY.center,
    radii.outer,
    angle,
  );

  return (
    <g>
      <line
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        className="chronodex-current-time chronodex-content-in"
      />
    </g>
  );
}
