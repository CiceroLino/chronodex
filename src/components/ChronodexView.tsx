import type { TimeBlock } from '../types';
import {
  describeAnnularSector,
  formatDuration,
  getDuration,
  getTotalPlannedMinutes,
  isMinuteInsideBlock,
  minutesToChronodexAngle,
  polarToCartesian,
} from '../utils/time';
import { ChronodexArc } from './ChronodexArc';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { StatsPanel } from './StatsPanel';

type ChronodexViewProps = {
  blocks: TimeBlock[];
  now: Date;
  selectedBlock: TimeBlock | null;
  onSelectBlock: (block: TimeBlock | null) => void;
};

const labelHours = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

function formatHourLabel(hour: number): string {
  if (hour === 12) {
    return '12pm';
  }

  if (hour < 12) {
    return `${hour}am`;
  }

  return `${hour - 12}pm`;
}

export function ChronodexView({
  blocks,
  now,
  selectedBlock,
  onSelectBlock,
}: ChronodexViewProps) {
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const activeBlock = blocks.find((block) => isMinuteInsideBlock(currentMinute, block)) ?? null;
  const footerCards = [
    {
      label: 'horas planejadas',
      value: formatDuration(getTotalPlannedMinutes(blocks)),
    },
    {
      label: 'total de blocos',
      value: String(blocks.length),
    },
    {
      label: 'bloco atual',
      value: activeBlock?.title ?? 'livre',
    },
    {
      label: 'hora atual',
      value: new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(now),
    },
  ];

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#f7f7f7] px-8 py-10 lg:px-14">
      <div className="relative w-full max-w-[820px]">
        <div className="relative mx-auto aspect-square w-full">
          <svg
            viewBox="0 0 500 500"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label="Chronodex radial de vinte e quatro horas"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onSelectBlock(null);
              }
            }}
          >
            <circle cx="250" cy="250" r="106" fill="#ffffff" stroke="#111111" strokeWidth="0.9" />
            <circle cx="250" cy="250" r="124" fill="none" stroke="#111111" strokeWidth="0.55" />
            <circle cx="250" cy="250" r="160" fill="none" stroke="#111111" strokeWidth="0.55" />

            {Array.from({ length: 24 }, (_, index) => {
              const start = index * 60 - 28;
              const end = index * 60 + 28;

              return (
                <path
                  key={`outer-arm-${index}`}
                  d={describeAnnularSector(
                    250,
                    250,
                    index % 3 === 0 ? 164 : 172,
                    index % 3 === 0 ? 224 : 214,
                    minutesToChronodexAngle(start),
                    minutesToChronodexAngle(end),
                  )}
                  fill="none"
                  stroke="#111111"
                  strokeWidth="0.72"
                />
              );
            })}

            {Array.from({ length: 96 }, (_, tick) => {
              const angle = minutesToChronodexAngle(tick * 15);
              const isHour = tick % 4 === 0;
              const inner = polarToCartesian(250, 250, isHour ? 162 : 166, angle);
              const outer = polarToCartesian(250, 250, isHour ? 181 : 175, angle);

              return (
                <line
                  key={`tick-${tick}`}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#111111"
                  strokeWidth={isHour ? 0.72 : 0.38}
                  strokeLinecap="round"
                />
              );
            })}

            {labelHours.map((hour) => {
              const point = polarToCartesian(
                250,
                250,
                244,
                minutesToChronodexAngle(hour * 60),
              );
              return (
                <text
                  key={hour}
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-600 text-[10px] font-medium"
                >
                  {formatHourLabel(hour)}
                </text>
              );
            })}

            <g>
              {blocks.map((block) => (
                <ChronodexArc
                  key={block.id}
                  block={block}
                  isActive={activeBlock?.id === block.id}
                  isSelected={selectedBlock?.id === block.id}
                  onSelect={onSelectBlock}
                />
              ))}
            </g>

            {[0, 3, 6, 9].map((hour) => {
              const point = polarToCartesian(250, 250, 226, minutesToChronodexAngle(hour * 60));
              return (
                <circle
                  key={`node-${hour}`}
                  cx={point.x}
                  cy={point.y}
                  r="9.5"
                  fill="#ffffff"
                  stroke="#111111"
                  strokeWidth="0.9"
                />
              );
            })}

            <CurrentTimeIndicator now={now} />
          </svg>

          <StatsPanel blocks={blocks} now={now} />
        </div>
      </div>

      {selectedBlock ? (
        <div className="w-full max-w-[820px] border-t border-gray-200 pt-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
            {selectedBlock.category}
          </p>
          <p className="mt-2 text-sm font-medium text-black">{selectedBlock.title}</p>
          <p className="mt-1 text-xs text-gray-500">
            {selectedBlock.startTime} - {selectedBlock.endTime} ·{' '}
            {formatDuration(getDuration(selectedBlock.startTime, selectedBlock.endTime))}
          </p>
        </div>
      ) : null}

      <div className="grid w-full max-w-[980px] grid-cols-2 gap-3 lg:grid-cols-4">
        {footerCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
            <p className="truncate text-sm font-light text-black">{card.value}</p>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
              {card.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
