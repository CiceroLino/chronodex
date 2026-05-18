import { minutesToAngle, polarToCartesian } from '../utils/time';

type CurrentTimeIndicatorProps = {
  now: Date;
};

export function CurrentTimeIndicator({ now }: CurrentTimeIndicatorProps) {
  const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const angle = minutesToAngle(minutes);
  const inner = polarToCartesian(250, 250, 44, angle);
  const outer = polarToCartesian(250, 250, 203, angle);
  const cap = polarToCartesian(250, 250, 211, angle);

  return (
    <g>
      <line
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx={cap.x} cy={cap.y} r="4.5" fill="#0f172a" />
      <circle cx="250" cy="250" r="5" fill="#0f172a" />
    </g>
  );
}
