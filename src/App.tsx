import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChronodexView } from './components/ChronodexView';
import { NoticeRail } from './components/NoticeRail';
import { ReminderForm } from './components/ReminderForm';
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
import { CATEGORY_COLORS, CATEGORIES, type Notice, type Reminder, type TimeBlock } from './types';
import {
  getBlockEventKey,
  getDueBlockEvents,
  getDueReminderEvents,
  getReminderEventKey,
  parseReminders,
} from './utils/reminders';
import {
  detectOverlaps,
  getBlockProgressPercent,
  getTotalPlannedMinutes,
  isMinuteInsideBlock,
  timeToMinutes,
} from './utils/time';

type EditableBlock = Omit<TimeBlock, 'id'>;

const STORAGE_KEY = 'chronodex-time-blocks-v2';
const REMINDERS_STORAGE_KEY = 'chronodex-reminders-v1';
const THEME_STORAGE_KEY = 'chronodex-theme';
const BLOCK_OPACITY_STORAGE_KEY = 'chronodex-block-opacity';

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

function readStoredReminders(): Reminder[] {
  const stored = window.localStorage.getItem(REMINDERS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return parseReminders(JSON.parse(stored));
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

function readStoredBlockOpacity(): number {
  const stored = Number(window.localStorage.getItem(BLOCK_OPACITY_STORAGE_KEY));

  if (Number.isFinite(stored) && stored >= 0.2 && stored <= 0.8) {
    return stored;
  }

  return 0.34;
}

function App() {
  const [blocks, setBlocks] = useState<TimeBlock[]>(() => readStoredBlocks());
  const [reminders, setReminders] = useState<Reminder[]>(() => readStoredReminders());
  const [notices, setNotices] = useState<Notice[]>([]);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [blockPendingDelete, setBlockPendingDelete] = useState<TimeBlock | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionsError, setActionsError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isRemindersManagerOpen, setIsRemindersManagerOpen] = useState(false);
  const [isMobileBlocksOpen, setIsMobileBlocksOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isVisualSettingsOpen, setIsVisualSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());
  const [locale, setLocale] = useState<AppLocale>(() => readStoredLocale());
  const [blockOpacity, setBlockOpacity] = useState(() => readStoredBlockOpacity());
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | 'unsupported'
  >(() => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission));
  const importInputRef = useRef<HTMLInputElement>(null);
  const firedEventsRef = useRef(new Set<string>());
  const messages = getMessages(locale);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    window.localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

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

  useEffect(() => {
    window.localStorage.setItem(BLOCK_OPACITY_STORAGE_KEY, String(blockOpacity));
  }, [blockOpacity]);

  function showDesktopNotification(title: string, description?: string, tag?: string) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return;
    }

    new Notification(title, {
      body: description,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag,
    });
  }

  useEffect(() => {
    const currentTime = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
      hour: '2-digit',
      minute: '2-digit',
    }).format(now);

    function pushNotice(notice: Omit<Notice, 'id' | 'createdAt'>) {
      setNotices((current) => [
        {
          ...notice,
          id: createId(),
          createdAt: Date.now(),
        },
        ...current,
      ].slice(0, 8));

      showDesktopNotification(
        notice.title,
        notice.description,
        `chronodex-${notice.kind}-${notice.time}`,
      );
    }

    getDueReminderEvents(reminders, now).forEach((reminder) => {
      const key = getReminderEventKey(reminder, now);

      if (firedEventsRef.current.has(key)) {
        return;
      }

      firedEventsRef.current.add(key);
      pushNotice({
        kind: 'reminder',
        title: `${messages.reminderDue}: ${reminder.title}`,
        description: reminder.description,
        time: currentTime,
      });
    });

    getDueBlockEvents(blocks, now).forEach((event) => {
      const key = getBlockEventKey(event.kind, event.block, now);

      if (firedEventsRef.current.has(key)) {
        return;
      }

      firedEventsRef.current.add(key);
      pushNotice({
        kind: event.kind,
        title: event.kind === 'block-start' ? messages.blockStarted : messages.blockEnded,
        description: event.block.title,
        time: currentTime,
      });
    });
  }, [blocks, locale, messages, now, notificationPermission, reminders]);

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

    setBlockPendingDelete(null);
  }

  function requestDeleteBlock(id: string) {
    const block = blocks.find((currentBlock) => currentBlock.id === id);

    if (!block) {
      return;
    }

    setBlockPendingDelete(block);
  }

  function cancelDeleteBlock() {
    setBlockPendingDelete(null);
  }

  function addReminder(reminder: Omit<Reminder, 'id'>) {
    setReminders((current) => [...current, { ...reminder, id: createId() }]);
    setIsReminderDialogOpen(false);
  }

  function removeReminder(id: string) {
    setReminders((current) => current.filter((reminder) => reminder.id !== id));
  }

  async function enableNotifications() {
    if (typeof Notification === 'undefined') {
      setActionsError(messages.notificationsUnavailable);
      setNotificationPermission('unsupported');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      setActionsError(null);
      showDesktopNotification(
        messages.notificationsEnabled,
        messages.notificationsEnabledDescription,
        'chronodex-notifications-enabled',
      );
      setNotices((current) => [
        {
          id: createId(),
          kind: 'reminder' as const,
          title: messages.notificationsEnabled,
          description: messages.notificationsEnabledDescription,
          time: new Intl.DateTimeFormat(INTL_LOCALES[locale], {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date()),
          createdAt: Date.now(),
        },
        ...current,
      ].slice(0, 8));
      return;
    }

    if (permission === 'denied') {
      setActionsError(messages.notificationsBlocked);
    }
  }

  function scheduleTestNotification() {
    const scheduledTime = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    setNotices((current) => [
      {
        id: createId(),
        kind: 'reminder' as const,
        title: messages.testNotificationScheduled,
        time: scheduledTime,
        createdAt: Date.now(),
      },
      ...current,
    ].slice(0, 8));

    window.setTimeout(() => {
      const firedTime = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date());

      showDesktopNotification(
        messages.testNotificationTitle,
        messages.notificationsEnabledDescription,
        `chronodex-test-${Date.now()}`,
      );
      setNotices((current) => [
        {
          id: createId(),
          kind: 'reminder' as const,
          title: messages.testNotificationTitle,
          description: messages.notificationsEnabledDescription,
          time: firedTime,
          createdAt: Date.now(),
        },
        ...current,
      ].slice(0, 8));
    }, 5000);
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
    setBlockPendingDelete(null);
    setError(null);
    setIsActionsOpen(false);
  }

  function clearDay() {
    setBlocks([]);
    setEditingBlock(null);
    setSelectedBlock(null);
    setBlockPendingDelete(null);
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
              onDelete={requestDeleteBlock}
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
            aria-label={messages.addReminder}
            title={messages.addReminder}
            onClick={() => setIsReminderDialogOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-black bg-white text-gray-800 transition hover:bg-black hover:text-white dark:border-white dark:bg-[#191919] dark:text-neutral-200 dark:hover:bg-white dark:hover:text-black"
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
              <path d="M12 6v6l4 2" />
              <circle cx="12" cy="12" r="8" />
              <path d="M18 4l2 2" />
              <path d="M6 4L4 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label={messages.openReminders}
            title={messages.openReminders}
            onClick={() => setIsRemindersManagerOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300 dark:hover:bg-neutral-900"
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
              <path d="M7 8h10" />
              <path d="M7 12h7" />
              <path d="M7 16h5" />
              <path d="M5 4h14v16H5z" />
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
            onClick={() => {
              setActionsError(null);
              setIsActionsOpen(true);
            }}
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
            aria-label={messages.visualSettings}
            title={messages.visualSettings}
            onClick={() => setIsVisualSettingsOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-black bg-white text-black transition hover:bg-black hover:text-white dark:border-white dark:bg-[#191919] dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            >
              <path d="M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z" />
              <path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-1.98-.36 1.8 1.8 0 0 0-1.08 1.65V21.3a2.1 2.1 0 0 1-4.2 0v-.06a1.8 1.8 0 0 0-1.08-1.65 1.8 1.8 0 0 0-1.98.36l-.04.04a2.1 2.1 0 0 1-2.97-2.97l.04-.04A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.08H2.9a2.1 2.1 0 0 1 0-4.2h.06A1.8 1.8 0 0 0 4.6 8.64a1.8 1.8 0 0 0-.36-1.98L4.2 6.62a2.1 2.1 0 0 1 2.97-2.97l.04.04a1.8 1.8 0 0 0 1.98.36 1.8 1.8 0 0 0 1.08-1.65V2.34a2.1 2.1 0 0 1 4.2 0v.06a1.8 1.8 0 0 0 1.08 1.65 1.8 1.8 0 0 0 1.98-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 1.98 1.8 1.8 0 0 0 1.65 1.08h.06a2.1 2.1 0 0 1 0 4.2h-.06A1.8 1.8 0 0 0 19.4 15Z" />
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
          <div className="relative">
            <button
              type="button"
              aria-label="Language"
              aria-expanded={isLocaleOpen}
              onClick={() => setIsLocaleOpen((current) => !current)}
              className="flex h-11 min-w-16 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              <span>{LOCALE_LABELS[locale]}</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={[
                  'h-3.5 w-3.5 transition-transform',
                  isLocaleOpen ? 'rotate-180' : '',
                ].join(' ')}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {isLocaleOpen ? (
              <div className="modal-panel-in absolute bottom-14 right-0 z-50 w-36 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 dark:border-neutral-800 dark:bg-[#191919] lg:bottom-auto lg:top-12">
                {SUPPORTED_LOCALES.map((nextLocale) => {
                  const isSelected = nextLocale === locale;

                  return (
                    <button
                      key={nextLocale}
                      type="button"
                      onClick={() => {
                        setLocale(nextLocale);
                        setIsLocaleOpen(false);
                      }}
                      className={[
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition',
                        isSelected
                          ? 'bg-black text-white dark:bg-white dark:text-black'
                          : 'text-gray-600 hover:bg-gray-50 dark:text-neutral-300 dark:hover:bg-neutral-900',
                      ].join(' ')}
                    >
                      <span>{LOCALE_LABELS[nextLocale]}</span>
                      {isSelected ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="fixed right-4 top-4 z-40 flex gap-2 lg:right-6 lg:top-6">
          <button
            type="button"
            aria-label={messages.help}
            title={messages.help}
            onClick={() => setIsHelpOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-black bg-black text-sm font-semibold text-white ring-4 ring-black/8 transition hover:bg-gray-800 dark:border-white dark:bg-white dark:text-black dark:ring-white/10 dark:hover:bg-neutral-200"
          >
            ?
          </button>
          <a
            href="https://github.com/CiceroLino/chronodex"
            target="_blank"
            rel="noreferrer"
            aria-label="Open GitHub repository"
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-black bg-black text-white ring-4 ring-black/8 transition hover:bg-gray-800 dark:border-white dark:bg-white dark:text-black dark:ring-white/10 dark:hover:bg-neutral-200"
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
        </div>

        {isActionsOpen ? (
          <div className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4">
            <button
              type="button"
              aria-label={messages.closeActions}
              className="absolute inset-0 cursor-default"
              onClick={() => setIsActionsOpen(false)}
            />
            <section className="modal-panel-in relative max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
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
                  onClick={enableNotifications}
                  disabled={notificationPermission === 'granted'}
                  className="rounded-xl border border-black bg-black px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  {notificationPermission === 'granted'
                    ? messages.notificationsEnabled
                    : messages.enableNotifications}
                </button>
                <button
                  type="button"
                  onClick={scheduleTestNotification}
                  disabled={notificationPermission !== 'granted'}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  {messages.testNotification}
                </button>
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

              {actionsError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                  {actionsError}
                </div>
              ) : null}

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
                onDelete={requestDeleteBlock}
              />
            </aside>
          </div>

        {isReminderDialogOpen ? (
          <div className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4 py-6">
            <button
              type="button"
              aria-label={messages.closeForm}
              className="absolute inset-0 cursor-default"
              onClick={() => setIsReminderDialogOpen(false)}
            />
            <section className="modal-panel-in relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-black dark:text-white">
                    {messages.addReminder}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {messages.reminderTime}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={messages.closeForm}
                  onClick={() => setIsReminderDialogOpen(false)}
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
              <ReminderForm locale={locale} onSubmit={addReminder} />
            </section>
          </div>
        ) : null}

        {isRemindersManagerOpen ? (
          <div className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4 py-6">
            <button
              type="button"
              aria-label={messages.closeForm}
              className="absolute inset-0 cursor-default"
              onClick={() => setIsRemindersManagerOpen(false)}
            />
            <section className="modal-panel-in relative max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-black dark:text-white">
                    {messages.reminders}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {messages.openReminders}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={messages.closeForm}
                  onClick={() => setIsRemindersManagerOpen(false)}
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

              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 dark:border-neutral-800 dark:text-neutral-500">
                    {messages.noReminders}
                  </p>
                ) : (
                  reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 dark:border-neutral-800 dark:bg-[#191919]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-neutral-500">
                          {reminder.time}
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-black dark:text-white">
                          {reminder.title}
                        </p>
                        {reminder.description ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600 dark:text-neutral-300">
                            {reminder.description}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        aria-label={messages.removeReminder}
                        onClick={() => removeReminder(reminder.id)}
                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:border-red-200 hover:bg-red-50 dark:border-neutral-800 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        {messages.delete}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}

        {isBlockDialogOpen ? (
          <div className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4 py-6">
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
            <section className="modal-panel-in relative max-h-full w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
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

        {blockPendingDelete ? (
          <div className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4 py-6">
            <button
              type="button"
              aria-label={messages.keepBlock}
              className="absolute inset-0 cursor-default"
              onClick={cancelDeleteBlock}
            />
            <section className="modal-panel-in relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
              <div className="mb-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-red-600 dark:text-red-400">
                  {messages.delete}
                </p>
                <h2 className="mt-2 text-base font-medium text-black dark:text-white">
                  {messages.confirmDeleteTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-neutral-400">
                  {messages.confirmDeleteDescription}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-neutral-800 dark:bg-[#111111]">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 h-10 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: blockPendingDelete.color }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-black dark:text-white">
                      {blockPendingDelete.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                      {blockPendingDelete.startTime} - {blockPendingDelete.endTime}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={cancelDeleteBlock}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-900"
                >
                  {messages.keepBlock}
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(blockPendingDelete.id)}
                  className="rounded-xl border border-red-700 bg-red-700 px-4 py-3 text-sm font-medium text-white transition hover:border-red-800 hover:bg-red-800 dark:border-red-500 dark:bg-red-500 dark:hover:border-red-400 dark:hover:bg-red-400"
                >
                  {messages.confirmDeleteAction}
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {isDashboardOpen ? (
          <div className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4 py-6">
            <button
              type="button"
              aria-label={messages.closeDashboard}
              className="absolute inset-0 cursor-default"
              onClick={() => setIsDashboardOpen(false)}
            />
            <section className="modal-panel-in relative max-h-full w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
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

        {isVisualSettingsOpen ? (
          <div className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4 py-6">
            <button
              type="button"
              aria-label={messages.closeForm}
              className="absolute inset-0 cursor-default"
              onClick={() => setIsVisualSettingsOpen(false)}
            />
            <section className="modal-panel-in relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 dark:border-neutral-800 dark:bg-[#171717]">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-medium text-black dark:text-white">
                    {messages.visualSettings}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                    {messages.visualSettingsDescription}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={messages.closeForm}
                  onClick={() => setIsVisualSettingsOpen(false)}
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

              <label className="block">
                <span className="flex items-center justify-between gap-4 text-xs font-medium text-gray-600 dark:text-neutral-400">
                  <span>{messages.blockOpacity}</span>
                  <span className="text-black dark:text-white">
                    {Math.round(blockOpacity * 100)}%
                  </span>
                </span>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.02"
                  value={blockOpacity}
                  onChange={(event) => setBlockOpacity(Number(event.target.value))}
                  className="mt-4 w-full accent-black dark:accent-white"
                />
              </label>
            </section>
          </div>
        ) : null}

        {isHelpOpen ? (
          <div className="modal-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/18 px-4 py-6">
            <button
              type="button"
              aria-label={messages.closeForm}
              className="absolute inset-0 cursor-default"
              onClick={() => setIsHelpOpen(false)}
            />
            <section className="modal-panel-in relative w-full max-w-md overflow-hidden rounded-2xl border border-black bg-white p-5 shadow-[0_14px_38px_rgba(0,0,0,0.10)] dark:border-white/40 dark:bg-[#171717] dark:shadow-[0_14px_38px_rgba(0,0,0,0.35)]">
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-1 w-full bg-black dark:bg-white"
              />
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-500">
                    {messages.help}
                  </p>
                  <h2 className="mt-2 text-base font-medium text-black dark:text-white">
                    {messages.helpTitle}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-neutral-400">
                    {messages.helpDescription}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={messages.closeForm}
                  onClick={() => setIsHelpOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900"
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

              <div className="space-y-5 border-t border-gray-200 pt-5 dark:border-neutral-800">
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-black dark:text-white">
                    {messages.helpHowItWorks}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-neutral-300">
                    {messages.helpHowItWorksDescription}
                  </p>
                </section>
                <section className="border-t border-gray-200 pt-5 dark:border-neutral-800">
                  <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-black dark:text-white">
                    {messages.helpStorage}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-neutral-300">
                    {messages.helpStorageDescription}
                  </p>
                </section>
              </div>
            </section>
          </div>
        ) : null}

        <ChronodexView
          blocks={sortedBlocks}
          now={now}
          selectedBlock={selectedBlock}
          locale={locale}
          blockOpacity={blockOpacity}
          onSelectBlock={setSelectedBlock}
        />
        <NoticeRail
          notices={notices}
          locale={locale}
          onDismiss={(id) =>
            setNotices((current) => current.filter((notice) => notice.id !== id))
          }
        />
      </div>
    </main>
  );
}

export default App;
