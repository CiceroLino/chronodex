import type { TimeBlock } from '../types';
import {
  describeAnnularSector,
  minutesToChronodexAngle,
  splitBlockRange,
} from '../utils/time';

type ChronodexArcProps = {
  block: TimeBlock;
  isActive: boolean;
  isSelected: boolean;
  onSelect: (block: TimeBlock) => void;
};

export function ChronodexArc({
  block,
  isActive,
  isSelected,
  onSelect,
}: ChronodexArcProps) {
  const ranges = splitBlockRange(block);

  return (
    <g>
      {ranges.map((range, index) => (
        <path
          key={`${block.id}-${index}`}
          d={describeAnnularSector(
            250,
            250,
            126,
            158,
            minutesToChronodexAngle(range.start),
            minutesToChronodexAngle(range.end),
          )}
          fill={block.color}
          stroke={isSelected ? '#111111' : '#262626'}
          strokeWidth={isSelected || isActive ? 1.2 : 0.65}
          opacity={isActive ? 0.72 : 0.58}
          className="cursor-pointer transition-opacity duration-150 hover:opacity-80"
          role="button"
          tabIndex={0}
          aria-label={`${block.title}, ${block.startTime} até ${block.endTime}`}
          onClick={() => onSelect(block)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              onSelect(block);
            }
          }}
        />
      ))}
    </g>
  );
}
