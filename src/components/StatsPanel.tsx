import {
  formatLocalizedDuration,
  getCategoryLabel,
  getMessages,
  INTL_LOCALES,
  type AppLocale,
} from '../i18n';
import { getDuration, getTotalPlannedMinutes } from '../utils/time';
import type { TimeBlock } from '../types';

type StatsPanelProps = {
  blocks: TimeBlock[];
  now: Date;
  locale: AppLocale;
  activeBlock: TimeBlock | null;
  activeBlockProgress: number | null;
};

export function StatsPanel({
  blocks,
  now,
  locale,
  activeBlock,
  activeBlockProgress,
}: StatsPanelProps) {
  const messages = getMessages(locale);
  const weekday = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    weekday: 'long',
  }).format(now);

  const time = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);
  const activeBlockDuration = activeBlock
    ? formatLocalizedDuration(getDuration(activeBlock.startTime, activeBlock.endTime), locale)
    : null;

  return (
    <div className="chronodex-content-in pointer-events-none absolute left-1/2 top-1/2 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center dark:bg-[#111111]">
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500">
        {weekday}
      </span>
      {activeBlock && activeBlockProgress !== null ? (
        <>
          <span className="mt-2 text-[28px] font-light leading-none text-black dark:text-white">
            {time}
          </span>
          <span className="mt-3 max-w-40 truncate text-base font-medium leading-tight text-black dark:text-white">
            {activeBlock.title}
          </span>
          <span className="mt-1 max-w-40 truncate text-[10px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-neutral-500">
            {getCategoryLabel(activeBlock.category, locale)}
          </span>
          <span className="mt-2 text-xs text-gray-500 dark:text-neutral-400">
            {activeBlock.startTime} - {activeBlock.endTime}
          </span>
          <div className="mt-3 w-32">
            <div className="mb-1 flex items-center justify-between text-[9px] font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-neutral-500">
              <span>{messages.progress}</span>
              <span>{activeBlockProgress.toFixed(1)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-black transition-[width] duration-1000 ease-linear dark:bg-white"
                style={{ width: `${activeBlockProgress}%` }}
              />
            </div>
          </div>
          {activeBlockDuration ? (
            <span className="mt-2 text-[10px] text-gray-500 dark:text-neutral-500">
              {activeBlockDuration}
            </span>
          ) : null}
        </>
      ) : (
        <>
          <span className="mt-3 text-[34px] font-light leading-none text-black dark:text-white">{time}</span>
          <span className="mt-4 text-xs font-medium text-gray-600 dark:text-neutral-400">
            {formatLocalizedDuration(getTotalPlannedMinutes(blocks), locale)} {messages.planned}
          </span>
          <span className="mt-1 text-xs font-medium text-gray-500 dark:text-neutral-500">
            {blocks.length} {messages.blocks}
          </span>
        </>
      )}
    </div>
  );
}
