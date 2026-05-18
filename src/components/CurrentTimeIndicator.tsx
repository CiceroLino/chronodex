import { minutesToChronodexAngle, polarToCartesian } from '../utils/time';

type CurrentTimeIndicatorProps = {
  now: Date;
};

export function CurrentTimeIndicator({ now }: CurrentTimeIndicatorProps) {
  const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const angle = minutesToChronodexAngle(minutes);
  const isPm = now.getHours() >= 12;
  const innerRadius = isPm ? 160 : 120;
  const outerRadius = isPm ? 194 : 150;
  const inner = polarToCartesian(250, 250, innerRadius, angle);
  const outer = polarToCartesian(250, 250, outerRadius, angle);
  const cap = polarToCartesian(250, 250, outerRadius + 4, angle);

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
