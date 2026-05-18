import { useState } from 'react';
import {
  formatLocalizedDuration,
  getCategoryLabel,
  getMessages,
  INTL_LOCALES,
  type AppLocale,
} from '../i18n';
import { CATEGORIES, CATEGORY_COLORS, type TimeBlock } from '../types';
import {
  describeAnnularSector,
  getChronodexAngleRange,
  getDuration,
  getBlockProgressPercent,
  getTotalPlannedMinutes,
  isMinuteInsideBlock,
  minutesToChronodexAngle,
  polarToCartesian,
  sortBlocksForChronodex,
} from '../utils/time';
import { ChronodexArc } from './ChronodexArc';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { StatsPanel } from './StatsPanel';

type ChronodexViewProps = {
  blocks: TimeBlock[];
  now: Date;
  selectedBlock: TimeBlock | null;
  locale: AppLocale;
  onSelectBlock: (block: TimeBlock | null) => void;
};

const hourIndexes = Array.from({ length: 12 }, (_, index) => index);
const guideRings = [
  { period: 'AM', inner: 120, outer: 150, labelRadius: 108, tickInner: 151, tickOuter: 158 },
  { period: 'PM', inner: 160, outer: 194, labelRadius: 209, tickInner: 195, tickOuter: 205 },
];

function formatHourLabel(hour: number, period: string): string {
  if (hour === 0) {
    return `12${period.toLowerCase()}`;
  }

  return `${hour}${period.toLowerCase()}`;
}

export function ChronodexView({
  blocks,
  now,
  selectedBlock,
  locale,
  onSelectBlock,
}: ChronodexViewProps) {
  const [hoveredBlock, setHoveredBlock] = useState<{
    block: TimeBlock;
    position: { x: number; y: number };
  } | null>(null);
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const messages = getMessages(locale);
  const activeBlock = blocks.find((block) => isMinuteInsideBlock(currentMinute, block)) ?? null;
  const activeBlockProgress = activeBlock
    ? getBlockProgressPercent(currentMinute, activeBlock)
    : null;
  const chronodexBlocks = sortBlocksForChronodex(blocks);
  const footerCards = [
    {
      label: messages.hoursPlanned,
      value: formatLocalizedDuration(getTotalPlannedMinutes(blocks), locale),
    },
    {
      label: messages.totalBlocks,
      value: String(blocks.length),
    },
    {
      label: messages.activeBlock,
      value: activeBlock?.title ?? messages.free,
    },
    {
      label: messages.timeNow,
      value: new Intl.DateTimeFormat(INTL_LOCALES[locale], {
        hour: '2-digit',
        minute: '2-digit',
      }).format(now),
    },
  ];

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f7f7] px-6 py-6 transition-colors dark:bg-[#111111] lg:h-screen lg:min-h-0 lg:overflow-hidden lg:px-10">
      <aside className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
        {CATEGORIES.map((category) => (
          <div
            key={category}
            className="pointer-events-auto group relative flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-neutral-800 dark:bg-[#191919]"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[category] }}
            />
            <span className="absolute right-9 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-medium text-gray-600 group-hover:block dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300">
              {getCategoryLabel(category, locale)}
            </span>
          </div>
        ))}
      </aside>
      <div className="relative w-full max-w-[680px] lg:w-[min(760px,calc(100vh-176px))] lg:max-w-none">
        <div className="relative mx-auto aspect-square w-full">
          <svg
            viewBox="0 0 500 500"
            className="h-full w-full overflow-visible text-black dark:text-neutral-100"
            role="img"
            aria-label="Chronodex radial de vinte e quatro horas"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onSelectBlock(null);
              }
            }}
          >
            <circle
              cx="250"
              cy="250"
              r="100"
              stroke="currentColor"
              strokeWidth="0.9"
              className="fill-white dark:fill-[#111111]"
            />

            {guideRings.map((ring) => (
              <g key={ring.period}>
                <circle
                  cx="250"
                  cy="250"
                  r={ring.inner}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.55"
                />
                <circle
                  cx="250"
                  cy="250"
                  r={ring.outer}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.55"
                />
                {hourIndexes.map((hour) => {
                  const start = hour * 60 - 26;
                  const end = hour * 60 + 26;
                  const angles = getChronodexAngleRange(start, end);

                  return (
                    <path
                      key={`${ring.period}-arm-${hour}`}
                      d={describeAnnularSector(
                        250,
                        250,
                        ring.inner,
                        ring.outer,
                        angles.startAngle,
                        angles.endAngle,
                      )}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.62"
                    />
                  );
                })}

                {Array.from({ length: 48 }, (_, tick) => {
                  const angle = minutesToChronodexAngle(tick * 15);
                  const isHour = tick % 4 === 0;
                  const inner = polarToCartesian(
                    250,
                    250,
                    isHour ? ring.inner : ring.tickInner,
                    angle,
                  );
                  const outer = polarToCartesian(250, 250, ring.tickOuter, angle);

                  return (
                    <line
                      key={`${ring.period}-tick-${tick}`}
                      x1={inner.x}
                      y1={inner.y}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="currentColor"
                      strokeWidth={isHour ? 0.62 : 0.34}
                      strokeLinecap="round"
                    />
                  );
                })}

                {hourIndexes.map((hour) => {
                  const point = polarToCartesian(
                    250,
                    250,
                    ring.labelRadius,
                    minutesToChronodexAngle(hour * 60),
                  );

                  return (
                    <text
                      key={`${ring.period}-label-${hour}`}
                      x={point.x}
                      y={point.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-gray-600 text-[8.5px] font-medium dark:fill-neutral-400"
                    >
                      {formatHourLabel(hour, ring.period)}
                    </text>
                  );
                })}
              </g>
            ))}

            <g>
              {chronodexBlocks.map((block) => (
                <ChronodexArc
                  key={block.id}
                  block={block}
                  isActive={activeBlock?.id === block.id}
                  isSelected={selectedBlock?.id === block.id}
                  onSelect={onSelectBlock}
                  onHover={(nextBlock, position) => {
                    setHoveredBlock({ block: nextBlock, position });
                  }}
                  onLeave={() => setHoveredBlock(null)}
                />
              ))}
            </g>

            {[0, 3, 6, 9].map((hour) => {
              const point = polarToCartesian(250, 250, 236, minutesToChronodexAngle(hour * 60));
              return (
                <circle
                  key={`node-${hour}`}
                  cx={point.x}
                  cy={point.y}
                  r="9.5"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  className="pointer-events-none fill-white dark:fill-[#111111]"
                />
              );
            })}

            <CurrentTimeIndicator now={now} />
          </svg>

          <StatsPanel
            blocks={blocks}
            now={now}
            locale={locale}
            activeBlock={activeBlock}
            activeBlockProgress={activeBlockProgress}
          />

          {hoveredBlock ? (
            <div
              className="pointer-events-none absolute z-10 max-w-64 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-xs text-gray-600 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300"
              style={{
                left: `${hoveredBlock.position.x}px`,
                top: `${hoveredBlock.position.y}px`,
                transform: 'translate(14px, -50%)',
              }}
            >
              <p className="text-sm font-medium text-black dark:text-white">{hoveredBlock.block.title}</p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-neutral-500">
                {hoveredBlock.block.startTime} - {hoveredBlock.block.endTime}
              </p>
              {hoveredBlock.block.description ? (
                <p className="mt-2 leading-5 text-gray-600 dark:text-neutral-300">
                  {hoveredBlock.block.description}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {selectedBlock ? (
        <div className="w-full max-w-[760px] border-t border-gray-200 pt-3 text-center dark:border-neutral-800">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-neutral-500">
            {getCategoryLabel(selectedBlock.category, locale)}
          </p>
          <p className="mt-2 text-sm font-medium text-black dark:text-white">{selectedBlock.title}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
            {selectedBlock.startTime} - {selectedBlock.endTime} ·{' '}
            {formatLocalizedDuration(
              getDuration(selectedBlock.startTime, selectedBlock.endTime),
              locale,
            )}
          </p>
        </div>
      ) : null}

      <div className="grid w-full max-w-[900px] grid-cols-2 gap-2 lg:grid-cols-4">
        {footerCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-[#191919]">
            <p className="truncate text-sm font-light text-black dark:text-white">{card.value}</p>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
              {card.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
