import type { TimeBlock } from '../types';
import { describeArc, minutesToAngle, splitBlockRange } from '../utils/time';

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
  const strokeWidth = isActive || isSelected ? 34 : 28;

  return (
    <g>
      {ranges.map((range, index) => (
        <path
          key={`${block.id}-${index}`}
          d={describeArc(250, 250, 170, minutesToAngle(range.start), minutesToAngle(range.end))}
          fill="none"
          stroke={block.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={isActive ? 0.92 : 0.72}
          className="transition-all duration-200 hover:opacity-100"
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
