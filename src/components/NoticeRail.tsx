import { getMessages, type AppLocale } from '../i18n';
import type { Notice } from '../types';

type NoticeRailProps = {
  notices: Notice[];
  locale: AppLocale;
  onDismiss: (id: string) => void;
};

const noticeTone: Record<Notice['kind'], string> = {
  reminder: 'bg-black dark:bg-white',
  'block-start': 'bg-emerald-600 dark:bg-emerald-400',
  'block-end': 'bg-gray-500 dark:bg-neutral-400',
};

export function NoticeRail({ notices, locale, onDismiss }: NoticeRailProps) {
  const messages = getMessages(locale);
  const visibleNotices = notices.slice(0, 4);

  if (visibleNotices.length === 0) {
    return null;
  }

  return (
    <aside className="fixed bottom-20 right-4 z-40 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2 lg:bottom-6 lg:right-6">
      <p className="self-end rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-500">
        {messages.notices}
      </p>
      {visibleNotices.map((notice) => (
        <div
          key={notice.id}
          className="modal-panel-in overflow-hidden rounded-2xl border border-gray-200 bg-white text-left dark:border-neutral-800 dark:bg-[#191919]"
        >
          <div className="flex items-start gap-3 p-3">
            <span
              aria-hidden="true"
              className={`mt-1 h-10 w-1 shrink-0 rounded-full ${noticeTone[notice.kind]}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-neutral-500">
                {notice.time}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-black dark:text-white">
                {notice.title}
              </p>
              {notice.description ? (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600 dark:text-neutral-300">
                  {notice.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              aria-label={messages.dismissNotice}
              onClick={() => onDismiss(notice.id)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
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
        </div>
      ))}
    </aside>
  );
}
