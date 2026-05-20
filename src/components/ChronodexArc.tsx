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
  blockOpacity: number;
  onSelect: (block: TimeBlock) => void;
  onHover: (block: TimeBlock, position: { x: number; y: number }) => void;
  onLeave: () => void;
};

export function ChronodexArc({
  block,
  isActive,
  isSelected,
  blockOpacity,
  onSelect,
  onHover,
  onLeave,
}: ChronodexArcProps) {
  const ranges = splitBlockRangeByHalfDay(block);
  const fillOpacity = Math.min(
    isSelected ? blockOpacity + 0.24 : block.highlighted ? blockOpacity + 0.16 : isActive ? blockOpacity + 0.12 : blockOpacity,
    0.86,
  );
  const blockStrokeWidth = isSelected ? 1.35 : isActive || block.highlighted ? 1 : 0.55;

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
              fillOpacity={fillOpacity}
              stroke={isSelected || block.highlighted ? 'currentColor' : '#262626'}
              strokeWidth={blockStrokeWidth}
              className="chronodex-block-in chronodex-block-hoverable cursor-pointer outline-none transition-[fill-opacity] duration-150 hover:fill-opacity-60 focus:outline-none"
              style={{ animationDelay: `${index * 80}ms` }}
              role="button"
              tabIndex={0}
              aria-label={`${block.title}, ${block.startTime} até ${block.endTime}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(block);
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onPointerMove={(event) => {
                event.stopPropagation();
                const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();

                if (!bounds) {
                  return;
                }

                onHover(block, {
                  x: event.clientX - bounds.left,
                  y: event.clientY - bounds.top,
                });
              }}
              onPointerLeave={(event) => {
                event.stopPropagation();
                onLeave();
              }}
              onPointerUp={(event) => {
                event.stopPropagation();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  onSelect(block);
                }
              }}
            />
            {isActive && !isSelected ? (
              <path
                d={describeArc(
                  250,
                  250,
                  markerRadius,
                  angles.startAngle,
                  angles.endAngle,
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="pointer-events-none chronodex-active-block-trace"
                pathLength={1}
              />
            ) : null}
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
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <circle cx={startMarker.x} cy={startMarker.y} r="3.6" fill="currentColor" />
                <circle cx={endMarker.x} cy={endMarker.y} r="3.6" fill="currentColor" />
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
