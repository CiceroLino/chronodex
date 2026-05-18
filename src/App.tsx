import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChronodexView } from './components/ChronodexView';
import { SpiderDashboard } from './components/SpiderDashboard';
import { TimeBlockForm } from './components/TimeBlockForm';
import { TimeBlockList } from './components/TimeBlockList';
import {
  getLocaleFromStorage,
  getMessages,
  INTL_LOCALES,
  LOCALE_LABELS,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type AppLocale,
} from './i18n';
import { CATEGORY_COLORS, CATEGORIES, type TimeBlock } from './types';
import {
  detectOverlaps,
  getBlockProgressPercent,
  getTotalPlannedMinutes,
  isMinuteInsideBlock,
  timeToMinutes,
} from './utils/time';

type EditableBlock = Omit<TimeBlock, 'id'>;

const STORAGE_KEY = 'chronodex-time-blocks-v2';
const THEME_STORAGE_KEY = 'chronodex-theme';

type Theme = 'light' | 'dark';

const sampleBlocksByLocale: Record<AppLocale, TimeBlock[]> = {
  'pt-BR': [
    {
      id: 'sample-1',
      title: 'Ritual matinal',
      description: 'Café, revisão do dia e preparação mental.',
      startTime: '06:30',
      endTime: '07:30',
      category: 'Saúde',
      color: CATEGORY_COLORS.Saúde,
      highlighted: true,
    },
    {
      id: 'sample-2',
      title: 'Trabalho profundo',
      description: 'Bloco sem reuniões para tarefas de maior impacto.',
      startTime: '08:30',
      endTime: '11:30',
      category: 'Trabalho',
      color: CATEGORY_COLORS.Trabalho,
    },
    {
      id: 'sample-3',
      title: 'Almoço',
      startTime: '12:00',
      endTime: '13:00',
      category: 'Alimentação',
      color: CATEGORY_COLORS.Alimentação,
    },
    {
      id: 'sample-4',
      title: 'Estudo guiado',
      startTime: '15:00',
      endTime: '16:30',
      category: 'Estudo',
      color: CATEGORY_COLORS.Estudo,
      highlighted: true,
    },
    {
      id: 'sample-5',
      title: 'Projeto pessoal',
      startTime: '20:30',
      endTime: '22:30',
      category: 'Projeto pessoal',
      color: CATEGORY_COLORS['Projeto pessoal'],
    },
  ],
  es: [
    {
      id: 'sample-1',
      title: 'Ritual matinal',
      description: 'Café, revisión del día y preparación mental.',
      startTime: '06:30',
      endTime: '07:30',
      category: 'Saúde',
      color: CATEGORY_COLORS.Saúde,
      highlighted: true,
    },
    {
      id: 'sample-2',
      title: 'Trabajo profundo',
      description: 'Bloque sin reuniones para tareas de mayor impacto.',
      startTime: '08:30',
      endTime: '11:30',
      category: 'Trabalho',
      color: CATEGORY_COLORS.Trabalho,
    },
    {
      id: 'sample-3',
      title: 'Almuerzo',
      startTime: '12:00',
      endTime: '13:00',
      category: 'Alimentação',
      color: CATEGORY_COLORS.Alimentação,
    },
    {
      id: 'sample-4',
      title: 'Estudio guiado',
      startTime: '15:00',
      endTime: '16:30',
      category: 'Estudo',
      color: CATEGORY_COLORS.Estudo,
      highlighted: true,
    },
    {
      id: 'sample-5',
      title: 'Proyecto personal',
      startTime: '20:30',
      endTime: '22:30',
      category: 'Projeto pessoal',
      color: CATEGORY_COLORS['Projeto pessoal'],
    },
  ],
  en: [
    {
      id: 'sample-1',
      title: 'Morning ritual',
      description: 'Coffee, day review, and mental preparation.',
      startTime: '06:30',
      endTime: '07:30',
      category: 'Saúde',
      color: CATEGORY_COLORS.Saúde,
      highlighted: true,
    },
    {
      id: 'sample-2',
      title: 'Deep work',
      description: 'Meeting-free block for high-impact tasks.',
      startTime: '08:30',
      endTime: '11:30',
      category: 'Trabalho',
      color: CATEGORY_COLORS.Trabalho,
    },
    {
      id: 'sample-3',
      title: 'Lunch',
      startTime: '12:00',
      endTime: '13:00',
      category: 'Alimentação',
      color: CATEGORY_COLORS.Alimentação,
    },
    {
      id: 'sample-4',
      title: 'Guided study',
      startTime: '15:00',
      endTime: '16:30',
      category: 'Estudo',
      color: CATEGORY_COLORS.Estudo,
      highlighted: true,
    },
    {
      id: 'sample-5',
      title: 'Personal project',
      startTime: '20:30',
      endTime: '22:30',
      category: 'Projeto pessoal',
      color: CATEGORY_COLORS['Projeto pessoal'],
    },
  ],
  ja: [
    {
      id: 'sample-1',
      title: '朝のルーティン',
      description: 'コーヒー、日次レビュー、心の準備。',
      startTime: '06:30',
      endTime: '07:30',
      category: 'Saúde',
      color: CATEGORY_COLORS.Saúde,
      highlighted: true,
    },
    {
      id: 'sample-2',
      title: '深い作業',
      description: '重要な作業のための会議なしブロック。',
      startTime: '08:30',
      endTime: '11:30',
      category: 'Trabalho',
      color: CATEGORY_COLORS.Trabalho,
    },
    {
      id: 'sample-3',
      title: '昼食',
      startTime: '12:00',
      endTime: '13:00',
      category: 'Alimentação',
      color: CATEGORY_COLORS.Alimentação,
    },
    {
      id: 'sample-4',
      title: 'ガイド学習',
      startTime: '15:00',
      endTime: '16:30',
      category: 'Estudo',
      color: CATEGORY_COLORS.Estudo,
      highlighted: true,
    },
    {
      id: 'sample-5',
      title: '個人プロジェクト',
      startTime: '20:30',
      endTime: '22:30',
      category: 'Projeto pessoal',
      color: CATEGORY_COLORS['Projeto pessoal'],
    },
  ],
};

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredBlocks(): TimeBlock[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return parseBlocks(parsed);
  } catch {
    return [];
  }
}

function parseBlocks(value: unknown): TimeBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): TimeBlock[] => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const block = item as Partial<TimeBlock>;
    const category = block.category;
    const hasValidCategory =
      typeof category === 'string' && CATEGORIES.includes(category);

    if (
      typeof block.title !== 'string' ||
      typeof block.startTime !== 'string' ||
      typeof block.endTime !== 'string' ||
      typeof block.color !== 'string' ||
      !hasValidCategory
    ) {
      return [];
    }

    return [
      {
        id: typeof block.id === 'string' ? block.id : createId(),
        title: block.title,
        description: typeof block.description === 'string' ? block.description : '',
        startTime: block.startTime,
        endTime: block.endTime,
        category,
        color: block.color,
        highlighted: block.highlighted === true,
      },
    ];
  });
}

function sortBlocks(blocks: TimeBlock[]): TimeBlock[] {
  return [...blocks].sort(
    (first, second) => timeToMinutes(first.startTime) - timeToMinutes(second.startTime),
  );
}

function readStoredTheme(): Theme {
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

function readStoredLocale(): AppLocale {
  return getLocaleFromStorage(window.localStorage);
}

function App() {
  const [blocks, setBlocks] = useState<TimeBlock[]>(() => readStoredBlocks());
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isMobileBlocksOpen, setIsMobileBlocksOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());
  const [locale, setLocale] = useState<AppLocale>(() => readStoredLocale());
  const importInputRef = useRef<HTMLInputElement>(null);
  const messages = getMessages(locale);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = INTL_LOCALES[locale];
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  const sortedBlocks = useMemo(() => sortBlocks(blocks), [blocks]);
  const overlapIds = useMemo(() => detectOverlaps(blocks), [blocks]);
  const currentMinute = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const activeBlock = blocks.find((block) => isMinuteInsideBlock(currentMinute, block)) ?? null;
  const activeBlockId = activeBlock?.id ?? null;
  const activeBlockProgress = activeBlock
    ? getBlockProgressPercent(currentMinute, activeBlock)
    : null;
  const totalMinutes = getTotalPlannedMinutes(blocks);
  const canOpenDashboard = blocks.length > 3;

  function saveBlock(form: EditableBlock) {
    if (!form.title) {
      setError(messages.emptyTitleError);
      return;
    }

    if (form.startTime === form.endTime) {
      setError(messages.equalTimeError);
      return;
    }

    setError(null);

    if (editingBlock) {
      const updatedBlock = { ...form, id: editingBlock.id };
      setBlocks((current) =>
        current.map((block) => (block.id === editingBlock.id ? updatedBlock : block)),
      );
      setEditingBlock(null);
      setSelectedBlock(updatedBlock);
      setIsBlockDialogOpen(false);
      return;
    }

    const newBlock = { ...form, id: createId() };
    setBlocks((current) => [...current, newBlock]);
    setSelectedBlock(newBlock);
    setIsBlockDialogOpen(false);
  }

  function deleteBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id));

    if (editingBlock?.id === id) {
      setEditingBlock(null);
    }

    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
    }
  }

  function openNewBlockDialog() {
    setEditingBlock(null);
    setError(null);
    setIsBlockDialogOpen(true);
  }

  function loadExample() {
    setBlocks(sampleBlocksByLocale[locale].map((block) => ({ ...block, id: createId() })));
    setEditingBlock(null);
    setSelectedBlock(null);
    setError(null);
    setIsActionsOpen(false);
  }

  function clearDay() {
    setBlocks([]);
    setEditingBlock(null);
    setSelectedBlock(null);
    setError(null);
    setIsActionsOpen(false);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(blocks, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'chronodex-blocos.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setIsActionsOpen(false);
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const parsedBlocks = parseBlocks(JSON.parse(content));

      if (parsedBlocks.length === 0) {
        setError(messages.invalidImportError);
        return;
      }

      setBlocks(parsedBlocks);
      setEditingBlock(null);
      setSelectedBlock(null);
      setError(null);
      setIsActionsOpen(false);
    } catch {
      setError(messages.importFailureError);
    } finally {
      event.target.value = '';
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7] text-black transition-colors dark:bg-[#111111] dark:text-white lg:h-screen lg:overflow-hidden">
      <div
        className={[
          'grid min-h-screen lg:h-screen lg:min-h-0',
          isSidebarCollapsed
            ? 'lg:grid-cols-[0px_minmax(0,1fr)]'
            : 'lg:grid-cols-[390px_minmax(0,1fr)]',
        ].join(' ')}
      >
        <section
          className={[
            'hidden border-b border-gray-200 bg-white transition-colors dark:border-neutral-800 dark:bg-[#151515] lg:block lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r',
            isSidebarCollapsed
              ? 'lg:overflow-hidden lg:border-r-0 lg:px-0 lg:py-0'
              : 'lg:px-7 lg:py-7',
          ].join(' ')}
        >
          <div className={isSidebarCollapsed ? 'lg:hidden' : ''}>
          <header className="mb-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gray-500 dark:text-neutral-500">
                {messages.dailyPlanning}
              </p>
              <h1 className="mt-3 text-3xl font-light tracking-normal text-black dark:text-white">
                Chronodex
              </h1>
              <p className="mt-3 text-sm font-normal leading-6 text-gray-500 dark:text-neutral-400">
                {new Intl.DateTimeFormat(INTL_LOCALES[locale], {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                }).format(now)}
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-[#191919]">
                <span className="block text-lg font-light text-black dark:text-white">{blocks.length}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
                  {messages.blocks}
                </span>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-[#191919]">
                <span className="block text-lg font-light text-black dark:text-white">
                  {Math.floor(totalMinutes / 60)}h
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
                  {messages.planned}
                </span>
              </div>
            </div>
          </header>

          <section className="border-t border-gray-200 pt-6 dark:border-neutral-800">
            <div className="mb-5">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-neutral-500">
                {messages.dayBlocks}
              </h2>
            </div>

            <TimeBlockList
              blocks={sortedBlocks}
              overlapIds={overlapIds}
              activeBlockId={activeBlockId}
              activeBlockProgress={activeBlockProgress}
              locale={locale}
              onEdit={(block) => {
                setEditingBlock(block);
                setSelectedBlock(block);
                setError(null);
                setIsBlockDialogOpen(true);
              }}
              onDelete={deleteBlock}
            />
          </section>

          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            onChange={importJson}
            className="hidden"
          />
          </div>
        </section>

        <div
          className={[
            'fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 gap-2 rounded-2xl border border-gray-200 bg-white/95 p-2 transition-[left] dark:border-neutral-800 dark:bg-[#151515]/95',
            isSidebarCollapsed ? 'lg:left-6' : 'lg:left-[410px]',
            'lg:bottom-auto lg:top-6 lg:max-w-none lg:translate-x-0 lg:border-0 lg:bg-transparent lg:p-0 lg:dark:bg-transparent',
          ].join(' ')}
        >
          <button
            type="button"
            aria-label={
              isSidebarCollapsed ? messages.expandSidebar : messages.collapseSidebar
            }
            title={isSidebarCollapsed ? messages.expandSidebar : messages.collapseSidebar}
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            className="hidden h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300 dark:hover:bg-neutral-900 lg:flex"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            >
              {isSidebarCollapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
          <button
            type="button"
            aria-label={messages.openDayBlocks}
            title={messages.openDayBlocks}
            onClick={() => setIsMobileBlocksOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300 dark:hover:bg-neutral-900 lg:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            >
              <path d="M8 6h13" />
              <path d="M8 12h13" />
              <path d="M8 18h13" />
              <path d="M3 6h.01" />
              <path d="M3 12h.01" />
              <path d="M3 18h.01" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={messages.addBlock}
            onClick={openNewBlockDialog}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={messages.spiderDashboard}
            title={
              canOpenDashboard ? messages.spiderDashboard : messages.requiredBlocksForDashboard
            }
            disabled={!canOpenDashboard}
            onClick={() => setIsDashboardOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            >
              <path d="M12 3l8 6-3 10H7L4 9l8-6Z" />
              <path d="M12 3v16" />
              <path d="M4 9l13 10" />
              <path d="M20 9L7 19" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={messages.actions}
            onClick={() => setIsActionsOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="currentColor"
            >
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={theme === 'dark' ? messages.themeLight : messages.themeDark}
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            {theme === 'dark' ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4.93 4.93l1.41 1.41" />
                <path d="M17.66 17.66l1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M4.93 19.07l1.41-1.41" />
                <path d="M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M20 14.5A7.5 7.5 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
              </svg>
            )}
          </button>
          <select
            aria-label="Language"
            value={locale}
            onChange={(event) => setLocale(event.target.value as AppLocale)}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 outline-none transition hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            {SUPPORTED_LOCALES.map((nextLocale) => (
              <option key={nextLocale} value={nextLocale}>
                {LOCALE_LABELS[nextLocale]}
              </option>
            ))}
          </select>
        </div>

        <a
          href="https://github.com/CiceroLino/chronodex"
          target="_blank"
          rel="noreferrer"
          aria-label="Open GitHub repository"
          className="fixed right-4 top-4 z-40 flex h-12 w-12 items-center justify-center rounded-xl border border-black bg-black text-white ring-4 ring-black/8 transition hover:bg-gray-800 dark:border-white dark:bg-white dark:text-black dark:ring-white/10 dark:hover:bg-neutral-200 lg:right-6 lg:top-6"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49v-1.74c-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.05 0-1.11.39-2.02 1.03-2.74-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.04A9.3 9.3 0 0 1 12 6.95c.85 0 1.7.12 2.5.34 1.9-1.32 2.74-1.04 2.74-1.04.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.74 0 3.92-2.34 4.78-4.57 5.04.36.32.68.95.68 1.92v2.78c0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
          </svg>
        </a>

        {isActionsOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4">
            <button
              type="button"
              aria-label={messages.closeActions}
              className="absolute inset-0 cursor-default"
              onClick={() => setIsActionsOpen(false)}
            />
            <section className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-black dark:text-white">
                    {messages.actions}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {messages.actionsDescription}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={messages.closeActions}
                  onClick={() => setIsActionsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={loadExample}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  {messages.loadExample}
                </button>
                <button
                  type="button"
                  onClick={exportJson}
                  disabled={blocks.length === 0}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  {messages.exportJson}
                </button>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  {messages.importJson}
                </button>
                <button
                  type="button"
                  onClick={clearDay}
                  disabled={blocks.length === 0}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-red-700 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-40 dark:border-neutral-800 dark:bg-[#191919] dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  {messages.clearDay}
                </button>
              </div>
            </section>
          </div>
        ) : null}

        <div
          className={[
            'fixed inset-0 z-50 lg:hidden',
            isMobileBlocksOpen ? 'pointer-events-auto' : 'pointer-events-none',
          ].join(' ')}
          aria-hidden={!isMobileBlocksOpen}
        >
            <button
              type="button"
              aria-label={messages.closeForm}
              className={[
                'absolute inset-0 bg-black/18 transition-opacity duration-200',
                isMobileBlocksOpen ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
              onClick={() => setIsMobileBlocksOpen(false)}
            />
            <aside
              className={[
                'absolute left-0 top-0 h-full w-[min(88vw,390px)] overflow-y-auto border-r border-gray-200 bg-white px-6 py-7 pb-28 transition-transform duration-300 ease-out dark:border-neutral-800 dark:bg-[#151515]',
                isMobileBlocksOpen ? 'translate-x-0' : '-translate-x-full',
              ].join(' ')}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gray-500 dark:text-neutral-500">
                    {messages.dailyPlanning}
                  </p>
                  <h2 className="mt-2 text-2xl font-light text-black dark:text-white">
                    Chronodex
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label={messages.closeForm}
                  onClick={() => setIsMobileBlocksOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
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
              <div className="mb-6 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-[#191919]">
                  <span className="block text-lg font-light text-black dark:text-white">
                    {blocks.length}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
                    {messages.blocks}
                  </span>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-[#191919]">
                  <span className="block text-lg font-light text-black dark:text-white">
                    {Math.floor(totalMinutes / 60)}h
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-neutral-500">
                    {messages.planned}
                  </span>
                </div>
              </div>
              <div className="mb-5 border-t border-gray-200 pt-6 dark:border-neutral-800">
                <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-neutral-500">
                  {messages.dayBlocks}
                </h2>
              </div>
              <TimeBlockList
                blocks={sortedBlocks}
                overlapIds={overlapIds}
                activeBlockId={activeBlockId}
                activeBlockProgress={activeBlockProgress}
                locale={locale}
                onEdit={(block) => {
                  setIsMobileBlocksOpen(false);
                  setEditingBlock(block);
                  setSelectedBlock(block);
                  setError(null);
                  setIsBlockDialogOpen(true);
                }}
                onDelete={deleteBlock}
              />
            </aside>
          </div>

        {isBlockDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4 py-6">
            <button
              type="button"
              aria-label={messages.closeForm}
              className="absolute inset-0 cursor-default"
              onClick={() => {
                setIsBlockDialogOpen(false);
                setEditingBlock(null);
                setError(null);
              }}
            />
            <section className="relative max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-black dark:text-white">
                    {editingBlock ? messages.editBlock : messages.addBlock}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {messages.blockFormDescription}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={messages.closeForm}
                  onClick={() => {
                    setIsBlockDialogOpen(false);
                    setEditingBlock(null);
                    setError(null);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <path d="M6 6l12 12" />
                    <path d="M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <TimeBlockForm
                editingBlock={editingBlock}
                error={error}
                locale={locale}
                onSubmit={saveBlock}
                onCancelEdit={() => {
                  setIsBlockDialogOpen(false);
                  setEditingBlock(null);
                  setError(null);
                }}
              />
            </section>
          </div>
        ) : null}

        {isDashboardOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4 py-6">
            <button
              type="button"
              aria-label={messages.closeDashboard}
              className="absolute inset-0 cursor-default"
              onClick={() => setIsDashboardOpen(false)}
            />
            <section className="relative max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-black dark:text-white">
                    {messages.spiderDashboard}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {messages.spiderDashboardDescription}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={messages.closeDashboard}
                  onClick={() => setIsDashboardOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
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
              <SpiderDashboard blocks={blocks} locale={locale} />
            </section>
          </div>
        ) : null}

        <ChronodexView
          blocks={sortedBlocks}
          now={now}
          selectedBlock={selectedBlock}
          locale={locale}
          onSelectBlock={setSelectedBlock}
        />
      </div>
    </main>
  );
}

export default App;
