import type { TimeBlock } from '../types';
import {
  describeAnnularSector,
  describeArc,
  getChronodexAngleRange,
  minutesToChronodexAngle,
  polarToCartesian,
  splitBlockRangeByHalfDay,
} from '../utils/time';

type ChronodexArcProps = {
  block: TimeBlock;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (block: TimeBlock) => void;
  onHover: (block: TimeBlock, position: { x: number; y: number }) => void;
  onLeave: () => void;
};

export function ChronodexArc({
  block,
  isActive,
  isSelected,
  onSelect,
  onHover,
  onLeave,
}: ChronodexArcProps) {
  const ranges = splitBlockRangeByHalfDay(block);

  return (
    <g>
      {ranges.map((range, index) => {
        const radii = range.period === 'am'
          ? { inner: 120, outer: 150 }
          : { inner: 160, outer: 194 };
        const angles = getChronodexAngleRange(range.start, range.end);
        const markerRadius = radii.outer;
        const startMarker = polarToCartesian(
          250,
          250,
          markerRadius,
          minutesToChronodexAngle(range.start),
        );
        const endMarker = polarToCartesian(
          250,
          250,
          markerRadius,
          minutesToChronodexAngle(range.end),
        );

        return (
          <g key={`${block.id}-${index}`}>
            <path
              d={describeAnnularSector(
                250,
                250,
                radii.inner,
                radii.outer,
                angles.startAngle,
                angles.endAngle,
              )}
              fill={block.color}
              stroke={isSelected || block.highlighted ? '#111111' : '#262626'}
              strokeWidth={isSelected || isActive || block.highlighted ? 1 : 0.55}
              opacity={block.highlighted ? 0.74 : isActive ? 0.7 : 0.52}
              className="cursor-pointer transition-opacity duration-150 hover:opacity-75"
              role="button"
              tabIndex={0}
              aria-label={`${block.title}, ${block.startTime} até ${block.endTime}`}
              onClick={() => onSelect(block)}
              onPointerMove={(event) => {
                const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();

                if (!bounds) {
                  return;
                }

                onHover(block, {
                  x: event.clientX - bounds.left,
                  y: event.clientY - bounds.top,
                });
              }}
              onPointerLeave={onLeave}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  onSelect(block);
                }
              }}
            />
            {block.highlighted ? (
              <g className="pointer-events-none">
                <path
                  d={describeArc(
                    250,
                    250,
                    markerRadius,
                    angles.startAngle,
                    angles.endAngle,
                  )}
                  fill="none"
                  stroke="#111111"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx={startMarker.x} cy={startMarker.y} r="3.6" fill="#111111" />
                <circle cx={endMarker.x} cy={endMarker.y} r="3.6" fill="#111111" />
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
