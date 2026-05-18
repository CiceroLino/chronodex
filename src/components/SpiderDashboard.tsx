import { useEffect, useState } from 'react';
import {
  formatLocalizedDuration,
  getCategoryLabel,
  getMessages,
  type AppLocale,
} from '../i18n';
import { CATEGORY_COLORS, type TimeBlock } from '../types';
import {
  getCategoryTimeShares,
  getSpiderPointRadius,
  polarToCartesian,
} from '../utils/time';

type SpiderDashboardProps = {
  blocks: TimeBlock[];
  locale: AppLocale;
};

const center = 130;
const maxRadius = 94;
const animationDuration = 900;

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3;
}

export function SpiderDashboard({ blocks, locale }: SpiderDashboardProps) {
  const messages = getMessages(locale);
  const shares = getCategoryTimeShares(blocks);
  const maxMinutes = Math.max(...shares.map((share) => share.minutes), 1);
  const [drawProgress, setDrawProgress] = useState(0);
  const animationKey = shares
    .map((share) => `${share.category}:${share.minutes}`)
    .join('|');

  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();

    setDrawProgress(0);

    const tick = (time: number) => {
      const elapsed = Math.min((time - startedAt) / animationDuration, 1);
      setDrawProgress(easeOutCubic(elapsed));

      if (elapsed < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [animationKey]);

  const points = shares
    .map((share, index) => {
      const angle = (index / shares.length) * 360 - 90;
      const radius = getSpiderPointRadius(share.minutes, maxMinutes, drawProgress);
      const point = polarToCartesian(center, center, radius, angle);
      return `${point.x.toFixed(2)},${point.y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <div className="grid gap-5 md:grid-cols-[280px_minmax(0,1fr)]">
      <div className="relative">
        <svg
          viewBox="0 0 260 260"
          className="h-full min-h-64 w-full text-black dark:text-white"
          role="img"
          aria-label={messages.spiderDashboard}
        >
          {[0.25, 0.5, 0.75, 1].map((level) => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={maxRadius * level}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="0.8"
            />
          ))}
          {shares.map((share, index) => {
            const angle = (index / shares.length) * 360 - 90;
            const end = polarToCartesian(center, center, maxRadius, angle);
            const label = polarToCartesian(center, center, maxRadius + 20, angle);

            return (
              <g key={share.category}>
                <line
                  x1={center}
                  y1={center}
                  x2={end.x}
                  y2={end.y}
                  stroke="currentColor"
                  strokeOpacity="0.16"
                  strokeWidth="0.8"
                />
                <circle
                  cx={label.x}
                  cy={label.y}
                  r="4"
                  fill={CATEGORY_COLORS[share.category]}
                  stroke="currentColor"
                  strokeWidth="0.6"
                />
              </g>
            );
          })}
          <polygon
            points={points}
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="space-y-2">
        {shares
          .filter((share) => share.minutes > 0)
          .sort((first, second) => second.minutes - first.minutes)
          .map((share, index) => {
            const animatedPercentage = share.percentage * drawProgress;
            const percentagePrecision = Number.isInteger(share.percentage) ? 0 : 1;

            return (
              <div
                key={share.category}
                className="spider-legend-in rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-[#191919]"
                style={{ animationDelay: `${140 + index * 70}ms` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[share.category] }}
                    />
                    <span className="truncate text-sm font-medium text-black dark:text-white">
                      {getCategoryLabel(share.category, locale)}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-light text-black dark:text-white">
                    {formatLocalizedDuration(share.minutes, locale)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-black transition-[width] duration-100 ease-linear dark:bg-white"
                      style={{ width: `${animatedPercentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-[10px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-neutral-500">
                    {animatedPercentage.toFixed(percentagePrecision)}%
                  </span>
                </div>
              </div>
            );
          })}
        <p className="pt-2 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
          {messages.timeShare}
        </p>
      </div>
    </div>
  );
}
