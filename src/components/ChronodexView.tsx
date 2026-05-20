import { type MouseEvent, useState } from 'react';
import {
  formatLocalizedDuration,
  getCategoryLabel,
  getMessages,
  type AppLocale,
} from '../i18n';
import { CATEGORIES, CATEGORY_COLORS, type TimeBlock } from '../types';
import {
  describeAnnularSector,
  getChronodexMinuteFromPoint,
  getChronodexAngleRange,
  getDuration,
  getBlockProgressPercent,
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
  blockOpacity: number;
  onSelectBlock: (block: TimeBlock | null) => void;
  onCreateBlockAtMinute: (minute: number) => void;
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
  blockOpacity,
  onSelectBlock,
  onCreateBlockAtMinute,
}: ChronodexViewProps) {
  const [hoveredBlock, setHoveredBlock] = useState<{
    block: TimeBlock;
    position: { x: number; y: number };
  } | null>(null);
  const currentMinute = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const messages = getMessages(locale);
  const activeBlock = blocks.find((block) => isMinuteInsideBlock(currentMinute, block)) ?? null;
  const activeBlockProgress = activeBlock
    ? getBlockProgressPercent(currentMinute, activeBlock)
    : null;
  const chronodexBlocks = sortBlocksForChronodex(blocks);

  function handleChronodexClick(event: MouseEvent<SVGSVGElement>) {
    const svg = event.currentTarget;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const matrix = svg.getScreenCTM();

    if (!matrix) {
      return;
    }

    const svgPoint = point.matrixTransform(matrix.inverse());
    const minute = getChronodexMinuteFromPoint(
      { x: 250, y: 250 },
      { x: svgPoint.x, y: svgPoint.y },
    );

    if (minute === null) {
      onSelectBlock(null);
      return;
    }

    onCreateBlockAtMinute(minute);
  }

  return (
    <section className="relative flex min-h-[680px] flex-col items-center justify-center gap-4 bg-[#f7f7f7] px-4 pb-28 pt-8 transition-colors dark:bg-[#111111] sm:min-h-[760px] sm:px-6 lg:h-screen lg:min-h-0 lg:overflow-hidden lg:px-10 lg:py-6">
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
            onClick={handleChronodexClick}
          >
            <circle
              cx="250"
              cy="250"
              r="100"
              stroke="currentColor"
              strokeWidth="0.9"
              className="chronodex-line-draw fill-white dark:fill-[#111111]"
              pathLength={1}
            />

            {guideRings.map((ring, ringIndex) => (
              <g key={ring.period}>
                <circle
                  cx="250"
                  cy="250"
                  r={ring.inner}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.55"
                  className="chronodex-line-draw"
                  style={{ animationDelay: `${ringIndex * 120}ms` }}
                  pathLength={1}
                />
                <circle
                  cx="250"
                  cy="250"
                  r={ring.outer}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.55"
                  className="chronodex-line-draw"
                  style={{ animationDelay: `${60 + ringIndex * 120}ms` }}
                  pathLength={1}
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
                      className="chronodex-line-draw"
                      style={{ animationDelay: `${180 + hour * 18 + ringIndex * 80}ms` }}
                      pathLength={1}
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
                      className="chronodex-tick-draw"
                      style={{ animationDelay: `${280 + tick * 7 + ringIndex * 90}ms` }}
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
                      className="chronodex-label-in chronodex-hour-label fill-gray-600 text-[8.5px] font-medium dark:fill-neutral-400"
                      style={{ animationDelay: `${520 + hour * 24 + ringIndex * 80}ms` }}
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
                  blockOpacity={blockOpacity}
                  onSelect={onSelectBlock}
                  onHover={(nextBlock, position) => {
                    setHoveredBlock({ block: nextBlock, position });
                  }}
                  onLeave={() => setHoveredBlock(null)}
                />
              ))}
            </g>

            {[0, 3, 6, 9].map((hour, index) => {
              const point = polarToCartesian(250, 250, 236, minutesToChronodexAngle(hour * 60));
              return (
                <circle
                  key={`node-${hour}`}
                  cx={point.x}
                  cy={point.y}
                  r="9.5"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  className="chronodex-node-in pointer-events-none fill-white dark:fill-[#111111]"
                  style={{ animationDelay: `${680 + index * 70}ms` }}
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

        {selectedBlock ? (
          <div className="modal-panel-in relative z-20 mt-4 w-full overflow-hidden rounded-2xl border border-black bg-white p-4 text-left shadow-[0_14px_38px_rgba(0,0,0,0.10)] dark:border-white/40 dark:bg-[#191919] dark:shadow-[0_14px_38px_rgba(0,0,0,0.35)] xl:absolute xl:left-[calc(100%+2rem)] xl:top-8 xl:mt-0 xl:w-72">
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 h-1 w-full"
              style={{ backgroundColor: selectedBlock.color }}
            />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
                  {getCategoryLabel(selectedBlock.category, locale)}
                </p>
                <h2 className="mt-1 truncate text-sm font-medium text-black dark:text-white">
                  {selectedBlock.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label={messages.closeForm}
                onClick={() => onSelectBlock(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-300 text-gray-700 transition hover:border-black hover:bg-gray-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-white dark:hover:bg-neutral-900"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.8"
                >
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-neutral-800 dark:bg-[#111111]">
                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-neutral-500">
                  {messages.start}
                </p>
                <p className="mt-1 font-medium text-black dark:text-white">
                  {selectedBlock.startTime}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-neutral-800 dark:bg-[#111111]">
                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-neutral-500">
                  {messages.end}
                </p>
                <p className="mt-1 font-medium text-black dark:text-white">
                  {selectedBlock.endTime}
                </p>
              </div>
            </div>

            {selectedBlock.description ? (
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-600 dark:text-neutral-300">
                {selectedBlock.description}
              </p>
            ) : null}

            <p className="mt-4 border-t border-gray-200 pt-3 text-center text-xs font-medium text-gray-600 dark:border-neutral-800 dark:text-neutral-300">
              {formatLocalizedDuration(
                getDuration(selectedBlock.startTime, selectedBlock.endTime),
                locale,
              )}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
