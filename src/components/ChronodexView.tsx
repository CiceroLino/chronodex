import { type PointerEvent, useState } from 'react';
import {
  formatLocalizedDuration,
  getCategoryLabel,
  getMessages,
  type AppLocale,
} from '../i18n';
import { CATEGORIES, CATEGORY_COLORS, type TimeBlock } from '../types';
import {
  describeAnnularSector,
  describeArc,
  getBlockTimeRangeFromMinuteRange,
  getBlockTimeRangeFromStartMinute,
  getChronodexMinuteFromPoint,
  getChronodexAngleRange,
  getChronodexScopeMetrics,
  type ChronodexMetricScope,
  getDuration,
  getBlockProgressPercent,
  isMinuteInsideBlock,
  getNearestChronodexMinute,
  getRadialDragOffset,
  minutesToChronodexAngle,
  minutesToTime,
  polarToCartesian,
  splitBlockRangeByHalfDay,
  sortBlocksForChronodex,
} from '../utils/time';
import { ChronodexArc } from './ChronodexArc';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { StatsPanel } from './StatsPanel';

type CompassInsight = 'progress' | 'used' | 'empty' | 'remaining';

type ChronodexViewProps = {
  blocks: TimeBlock[];
  now: Date;
  selectedBlock: TimeBlock | null;
  locale: AppLocale;
  blockOpacity: number;
  onSelectBlock: (block: TimeBlock | null) => void;
  onCreateBlockAtRange: (startMinute: number, endMinute: number) => void;
};

const hourIndexes = Array.from({ length: 12 }, (_, index) => index);
const guideRings = [
  { period: 'AM', inner: 120, outer: 150, labelRadius: 108, tickInner: 151, tickOuter: 158 },
  { period: 'PM', inner: 160, outer: 194, labelRadius: 209, tickInner: 195, tickOuter: 205 },
];
const previewBlockColor = '#111111';
const dayMinutes = 1440;
const compassNodeRadius = 236;
const compassNodeMaxDragOffset = 34;
const compassNodeScopeOffset = 18;
const compassInsightByHour: Array<{ hour: number; mode: CompassInsight }> = [
  { hour: 0, mode: 'progress' },
  { hour: 3, mode: 'used' },
  { hour: 6, mode: 'empty' },
  { hour: 9, mode: 'remaining' },
];

function getCompassSector(hour: number): ChronodexMetricScope {
  return {
    start: hour * 60,
    end: (hour + 3) * 60,
  };
}

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
  onCreateBlockAtRange,
}: ChronodexViewProps) {
  const [hoveredBlock, setHoveredBlock] = useState<{
    block: TimeBlock;
    position: { x: number; y: number };
  } | null>(null);
  const [hoveredMinute, setHoveredMinute] = useState<{
    minute: number;
    position: { x: number; y: number };
  } | null>(null);
  const [activeInsight, setActiveInsight] = useState<CompassInsight | null>(null);
  const [draggedInsight, setDraggedInsight] = useState<{
    mode: CompassInsight;
    hour: number;
    offset: number;
  } | null>(null);
  const [selectionDraft, setSelectionDraft] = useState<{
    startMinute: number;
    endMinute: number;
    position: { x: number; y: number };
  } | null>(null);
  const currentMinute = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const messages = getMessages(locale);
  const activeBlock = blocks.find((block) => isMinuteInsideBlock(currentMinute, block)) ?? null;
  const activeBlockProgress = activeBlock
    ? getBlockProgressPercent(currentMinute, activeBlock)
    : null;
  const isSectorScope = (draggedInsight?.offset ?? 0) >= compassNodeScopeOffset;
  const metricScope = isSectorScope && draggedInsight
    ? getCompassSector(draggedInsight.hour)
    : 'day';
  const metricBaseMinutes = metricScope === 'day'
    ? dayMinutes
    : metricScope.end - metricScope.start;
  const dayMetrics = getChronodexScopeMetrics(blocks, currentMinute, metricScope);
  const elapsedBase = Math.max(dayMetrics.elapsedMinutes, 1);
  const scopeLabel = metricScope === 'day'
    ? 'hoje'
    : `${minutesToTime(metricScope.start)}-${minutesToTime(metricScope.end)}`;
  const compassInsights: Record<CompassInsight, {
    label: string;
    value: string;
    detail: string;
    ratio: number;
    tone: string;
  }> = {
    progress: {
      label: isSectorScope ? 'Setor passado' : 'Dia passado',
      value: formatLocalizedDuration(dayMetrics.elapsedMinutes, locale),
      detail: `${Math.round((dayMetrics.elapsedMinutes / metricBaseMinutes) * 100)}% de ${scopeLabel}`,
      ratio: dayMetrics.elapsedMinutes / metricBaseMinutes,
      tone: '#111111',
    },
    used: {
      label: 'Aproveitado',
      value: formatLocalizedDuration(dayMetrics.elapsedPlannedMinutes, locale),
      detail: `${Math.round((dayMetrics.elapsedPlannedMinutes / elapsedBase) * 100)}% do tempo passado em blocos · ${scopeLabel}`,
      ratio: dayMetrics.elapsedPlannedMinutes / elapsedBase,
      tone: '#2563eb',
    },
    empty: {
      label: 'Vazio passado',
      value: formatLocalizedDuration(dayMetrics.elapsedEmptyMinutes, locale),
      detail: `${Math.round((dayMetrics.elapsedEmptyMinutes / elapsedBase) * 100)}% do tempo passado sem bloco · ${scopeLabel}`,
      ratio: dayMetrics.elapsedEmptyMinutes / elapsedBase,
      tone: '#737373',
    },
    remaining: {
      label: 'Restante',
      value: formatLocalizedDuration(dayMetrics.remainingMinutes, locale),
      detail: `${formatLocalizedDuration(dayMetrics.remainingPlannedMinutes, locale)} planejado · ${formatLocalizedDuration(dayMetrics.remainingFreeMinutes, locale)} livre · ${scopeLabel}`,
      ratio: dayMetrics.remainingMinutes / metricBaseMinutes,
      tone: '#0f766e',
    },
  };
  const currentInsight = activeInsight ? compassInsights[activeInsight] : null;
  const chronodexBlocks = sortBlocksForChronodex(blocks);
  const previewTimeRange = selectionDraft
    ? getBlockTimeRangeFromMinuteRange(selectionDraft.startMinute, selectionDraft.endMinute)
    : hoveredMinute
    ? getBlockTimeRangeFromStartMinute(hoveredMinute.minute)
    : null;
  const previewPosition = selectionDraft?.position ?? hoveredMinute?.position ?? null;
  const previewBlock = previewTimeRange
    ? {
        id: 'hover-preview',
        title: 'Preview',
        description: '',
        startTime: previewTimeRange.startTime,
        endTime: previewTimeRange.endTime,
        category: 'Trabalho' as const,
        color: previewBlockColor,
      }
    : null;
  const previewRanges = previewBlock ? splitBlockRangeByHalfDay(previewBlock) : [];

  function getMinuteFromPointerEvent(
    event: PointerEvent<SVGSVGElement>,
  ) {
    const svg = event.currentTarget;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const matrix = svg.getScreenCTM();

    if (!matrix) {
      return null;
    }

    const svgPoint = point.matrixTransform(matrix.inverse());
    const minute = getChronodexMinuteFromPoint({ x: 250, y: 250 }, svgPoint);

    return {
      minute,
      svgPoint,
    };
  }

  function getPointFromCompassPointerEvent(
    event: PointerEvent<SVGCircleElement>,
  ) {
    const svg = event.currentTarget.ownerSVGElement;

    if (!svg) {
      return null;
    }

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const matrix = svg.getScreenCTM();

    if (!matrix) {
      return null;
    }

    return point.matrixTransform(matrix.inverse());
  }

  function handleChronodexPointerMove(event: PointerEvent<SVGSVGElement>) {
    const result = getMinuteFromPointerEvent(event);

    if (!result?.minute && result?.minute !== 0) {
      if (!selectionDraft) {
        setHoveredMinute(null);
      }
      return;
    }

    const minute = result.minute;
    setHoveredBlock(null);

    if (selectionDraft) {
      setSelectionDraft((current) => current
        ? {
            ...current,
            endMinute: getNearestChronodexMinute(current.endMinute, minute),
            position: { x: result.svgPoint.x, y: result.svgPoint.y },
          }
        : current);
      return;
    }

    setHoveredMinute({
      minute,
      position: { x: result.svgPoint.x, y: result.svgPoint.y },
    });
  }

  function handleChronodexPointerDown(event: PointerEvent<SVGSVGElement>) {
    const result = getMinuteFromPointerEvent(event);

    if (!result || result.minute === null) {
      onSelectBlock(null);
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    setHoveredBlock(null);
    setHoveredMinute(null);
    setSelectionDraft({
      startMinute: result.minute,
      endMinute: result.minute,
      position: { x: result.svgPoint.x, y: result.svgPoint.y },
    });
  }

  function handleChronodexPointerUp(event: PointerEvent<SVGSVGElement>) {
    if (!selectionDraft) {
      return;
    }

    const result = getMinuteFromPointerEvent(event);
    const endMinute = result?.minute === null || result?.minute === undefined
      ? selectionDraft.endMinute
      : getNearestChronodexMinute(selectionDraft.endMinute, result.minute);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    onCreateBlockAtRange(selectionDraft.startMinute, endMinute);
    setSelectionDraft(null);
    setHoveredMinute(null);
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
            onPointerDown={handleChronodexPointerDown}
            onPointerMove={handleChronodexPointerMove}
            onPointerUp={handleChronodexPointerUp}
            onPointerCancel={() => {
              setSelectionDraft(null);
              setDraggedInsight(null);
            }}
            onPointerLeave={() => {
              setHoveredBlock(null);
              if (!draggedInsight) {
                setActiveInsight(null);
              }
              if (!selectionDraft) {
                setHoveredMinute(null);
              }
            }}
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
                  r={ring.period === 'PM' && draggedInsight ? ring.outer + 12 : ring.outer}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={ring.period === 'PM' && draggedInsight ? 0.95 : 0.55}
                  className="chronodex-line-draw transition-[r,stroke-width] duration-200"
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
              {previewRanges.map((range, index) => {
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
                  <g key={`hover-preview-${index}`} className="pointer-events-none">
                    <path
                      d={describeAnnularSector(
                        250,
                        250,
                        radii.inner,
                        radii.outer,
                        angles.startAngle,
                        angles.endAngle,
                      )}
                      fill="currentColor"
                      className="chronodex-hover-preview-fill"
                    />
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
                      strokeLinecap="round"
                      pathLength={1}
                      className="chronodex-hover-preview-trace"
                    />
                    <rect
                      x={startMarker.x - 3.5}
                      y={startMarker.y - 3.5}
                      width="7"
                      height="7"
                      rx="1.3"
                      fill="currentColor"
                      className="chronodex-hover-preview-handle"
                      transform={`rotate(${angles.startAngle + 45} ${startMarker.x} ${startMarker.y})`}
                    />
                    <rect
                      x={endMarker.x - 3.5}
                      y={endMarker.y - 3.5}
                      width="7"
                      height="7"
                      rx="1.3"
                      fill="currentColor"
                      className="chronodex-hover-preview-handle"
                      transform={`rotate(${angles.endAngle + 45} ${endMarker.x} ${endMarker.y})`}
                    />
                  </g>
                );
              })}
              {chronodexBlocks.map((block) => (
                <ChronodexArc
                  key={block.id}
                  block={block}
                  isActive={activeBlock?.id === block.id}
                  isSelected={selectedBlock?.id === block.id}
                  blockOpacity={blockOpacity}
                  onSelect={onSelectBlock}
                  onHover={(nextBlock, position) => {
                    setHoveredMinute(null);
                    setHoveredBlock({ block: nextBlock, position });
                  }}
                  onLeave={() => setHoveredBlock(null)}
                />
              ))}
            </g>

            {currentInsight ? (
              <g className="pointer-events-none chronodex-compass-sweep">
                <circle
                  cx="250"
                  cy="250"
                  r="226"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.12"
                />
                <path
                  d={describeArc(
                    250,
                    250,
                    226,
                    -90,
                    -90 + currentInsight.ratio * (isSectorScope ? 90 : 360),
                  )}
                  fill="none"
                  stroke={currentInsight.tone}
                  strokeWidth="5"
                  strokeLinecap="round"
                  pathLength={1}
                  className="chronodex-compass-progress"
                />
              </g>
            ) : null}

            {compassInsightByHour.map(({ hour, mode }, index) => {
              const basePoint = polarToCartesian(
                250,
                250,
                compassNodeRadius,
                minutesToChronodexAngle(hour * 60),
              );
              const dragOffset = draggedInsight?.mode === mode ? draggedInsight.offset : 0;
              const point = polarToCartesian(
                250,
                250,
                compassNodeRadius - dragOffset,
                minutesToChronodexAngle(hour * 60),
              );
              const insight = compassInsights[mode];
              const isActiveInsight = activeInsight === mode;
              return (
                <g key={`node-${hour}`}>
                  {dragOffset > 0 ? (
                    <line
                      x1={basePoint.x}
                      y1={basePoint.y}
                      x2={point.x}
                      y2={point.y}
                      stroke="currentColor"
                      strokeWidth="0.7"
                      opacity="0.38"
                      strokeLinecap="round"
                      className="pointer-events-none"
                    />
                  ) : null}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isActiveInsight ? 10.5 : 9.5}
                    stroke="currentColor"
                    strokeWidth={isActiveInsight ? 1.55 : 0.9}
                    className="chronodex-node-in fill-white transition-[r,stroke-width] duration-150 dark:fill-[#111111]"
                    style={{ animationDelay: `${680 + index * 70}ms` }}
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="22"
                    fill="transparent"
                    className="cursor-pointer outline-none"
                    role="button"
                    tabIndex={0}
                    aria-label={insight.label}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      event.currentTarget.setPointerCapture(event.pointerId);
                      setActiveInsight(mode);
                      setDraggedInsight({ mode, hour, offset: 0 });
                    }}
                    onPointerMove={(event) => {
                      if (draggedInsight?.mode !== mode) {
                        return;
                      }

                      const svgPoint = getPointFromCompassPointerEvent(event);

                      if (!svgPoint) {
                        return;
                      }

                      setDraggedInsight({
                        mode,
                        hour,
                        offset: getRadialDragOffset(
                          basePoint,
                          { x: 250, y: 250 },
                          svgPoint,
                          compassNodeMaxDragOffset,
                        ),
                      });
                    }}
                    onPointerUp={(event) => {
                      event.stopPropagation();
                      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                        event.currentTarget.releasePointerCapture(event.pointerId);
                      }
                      setDraggedInsight(null);
                    }}
                    onPointerCancel={() => setDraggedInsight(null)}
                    onPointerEnter={() => setActiveInsight(mode)}
                    onPointerLeave={() => {
                      if (draggedInsight?.mode !== mode) {
                        setActiveInsight(null);
                      }
                    }}
                    onFocus={() => setActiveInsight(mode)}
                    onBlur={() => setActiveInsight(null)}
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveInsight(mode);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setActiveInsight(mode);
                      }
                    }}
                  />
                </g>
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

          {currentInsight ? (
            <div className="pointer-events-none absolute left-1/2 top-8 z-10 -translate-x-1/2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-center shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:border-neutral-800 dark:bg-[#191919]">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
                {currentInsight.label}
              </p>
              <p className="mt-1 text-lg font-light leading-none text-black dark:text-white">
                {currentInsight.value}
              </p>
              <p className="mt-2 text-[11px] font-medium text-gray-500 dark:text-neutral-400">
                {currentInsight.detail}
              </p>
            </div>
          ) : null}

          {previewPosition && previewTimeRange ? (
            <div
              className="pointer-events-none absolute z-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-600 shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300"
              style={{
                left: `${previewPosition.x}px`,
                top: `${previewPosition.y}px`,
                transform: 'translate(14px, -50%)',
              }}
            >
              {previewTimeRange.startTime} - {previewTimeRange.endTime}
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
