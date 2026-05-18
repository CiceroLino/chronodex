import { minutesToChronodexAngle, polarToCartesian } from '../utils/time';

type CurrentTimeIndicatorProps = {
  now: Date;
};

export function CurrentTimeIndicator({ now }: CurrentTimeIndicatorProps) {
  const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const angle = minutesToChronodexAngle(minutes);
  const inner = polarToCartesian(250, 250, 112, angle);
  const outer = polarToCartesian(250, 250, 166, angle);
  const cap = polarToCartesian(250, 250, 171, angle);

  return (
    <g>
      <line
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke="#111111"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <circle cx={cap.x} cy={cap.y} r="3.4" fill="#111111" />
    </g>
  );
}
