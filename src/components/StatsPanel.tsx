import {
  formatLocalizedDuration,
  getMessages,
  INTL_LOCALES,
  type AppLocale,
} from '../i18n';
import { getTotalPlannedMinutes } from '../utils/time';
import type { TimeBlock } from '../types';

type StatsPanelProps = {
  blocks: TimeBlock[];
  now: Date;
  locale: AppLocale;
};

export function StatsPanel({ blocks, now, locale }: StatsPanelProps) {
  const messages = getMessages(locale);
  const weekday = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    weekday: 'long',
  }).format(now);

  const time = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white text-center dark:bg-[#111111]">
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500">
        {weekday}
      </span>
      <span className="mt-3 text-[34px] font-light leading-none text-black dark:text-white">{time}</span>
      <span className="mt-4 text-xs font-medium text-gray-600 dark:text-neutral-400">
        {formatLocalizedDuration(getTotalPlannedMinutes(blocks), locale)} {messages.planned}
      </span>
      <span className="mt-1 text-xs font-medium text-gray-500 dark:text-neutral-500">
        {blocks.length} {messages.blocks}
      </span>
    </div>
  );
}
