import { CATEGORIES, type Category } from './types';

export const SUPPORTED_LOCALES = ['pt-BR', 'es', 'en', 'ja'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_STORAGE_KEY = 'chronodex-locale';

export const INTL_LOCALES: Record<AppLocale, string> = {
  'pt-BR': 'pt-BR',
  es: 'es-ES',
  en: 'en-US',
  ja: 'ja-JP',
};

export const LOCALE_LABELS: Record<AppLocale, string> = {
  'pt-BR': 'PT',
  es: 'ES',
  en: 'EN',
  ja: '日本語',
};

type Messages = {
  actions: string;
  actionsDescription: string;
  activeBlock: string;
  addBlock: string;
  addReminder: string;
  blockCount: string;
  blockEnded: string;
  blockOpacity: string;
  blockStarted: string;
  blockFormDescription: string;
  blocks: string;
  cancelEdit: string;
  category: string;
  clearDay: string;
  closeActions: string;
  closeDashboard: string;
  closeForm: string;
  collapseSidebar: string;
  collapseDayBlocks: string;
  color: string;
  confirmDeleteAction: string;
  confirmDeleteDescription: string;
  confirmDeleteTitle: string;
  dailyPlanning: string;
  dayBlocks: string;
  delete: string;
  description: string;
  dismissNotice: string;
  editBlock: string;
  enableNotifications: string;
  end: string;
  equalTimeError: string;
  exportJson: string;
  expandSidebar: string;
  expandDayBlocks: string;
  openDayBlocks: string;
  openReminders: string;
  highlightedBlock: string;
  highlightedBlockDescription: string;
  help: string;
  helpDescription: string;
  helpHowItWorks: string;
  helpHowItWorksDescription: string;
  helpStorage: string;
  helpStorageDescription: string;
  helpTitle: string;
  hoursPlanned: string;
  importJson: string;
  invalidImportError: string;
  keepBlock: string;
  loadExample: string;
  noBlocks: string;
  noReminders: string;
  notices: string;
  notificationsBlocked: string;
  notificationsEnabled: string;
  notificationsEnabledDescription: string;
  notificationsUnavailable: string;
  optional: string;
  planned: string;
  progress: string;
  requiredBlocksForDashboard: string;
  reminderDue: string;
  reminders: string;
  reminderTime: string;
  reminderTitlePlaceholder: string;
  removeReminder: string;
  saveChange: string;
  spiderDashboard: string;
  spiderDashboardDescription: string;
  timeShare: string;
  start: string;
  themeDark: string;
  themeLight: string;
  testNotification: string;
  testNotificationScheduled: string;
  testNotificationTitle: string;
  timeNow: string;
  title: string;
  titlePlaceholder: string;
  totalBlocks: string;
  visualSettings: string;
  visualSettingsDescription: string;
  emptyTitleError: string;
  free: string;
  overlapDetected: string;
  importFailureError: string;
};

export const MESSAGES: Record<AppLocale, Messages> = {
  'pt-BR': {
    actions: 'Ações do dia',
    actionsDescription: 'Importação, exportação e estado inicial.',
    activeBlock: 'bloco atual',
    addBlock: 'Adicionar bloco',
    addReminder: 'Adicionar lembrete',
    blockCount: 'blocos',
    blockEnded: 'Bloco finalizado',
    blockOpacity: 'Opacidade dos blocos',
    blockStarted: 'Bloco iniciado',
    blockFormDescription: 'Defina horário, cor e marcação temporal.',
    blocks: 'blocos',
    cancelEdit: 'Cancelar edição',
    category: 'Categoria',
    clearDay: 'Limpar dia',
    closeActions: 'Fechar ações',
    closeDashboard: 'Fechar dashboard',
    closeForm: 'Fechar formulário',
    collapseSidebar: 'Recolher painel lateral',
    collapseDayBlocks: 'Recolher blocos do dia',
    color: 'Cor',
    confirmDeleteAction: 'Excluir bloco',
    confirmDeleteDescription: 'Esta ação remove o bloco do dia e não pode ser desfeita.',
    confirmDeleteTitle: 'Excluir este bloco?',
    dailyPlanning: 'Planejamento diário',
    dayBlocks: 'Blocos do dia',
    delete: 'Excluir',
    description: 'Descrição',
    dismissNotice: 'Dispensar aviso',
    editBlock: 'Editar bloco',
    enableNotifications: 'Ativar notificações',
    end: 'Fim',
    equalTimeError: 'O horário inicial não pode ser igual ao horário final.',
    exportJson: 'Exportar JSON',
    expandSidebar: 'Expandir painel lateral',
    expandDayBlocks: 'Expandir blocos do dia',
    openDayBlocks: 'Abrir blocos do dia',
    openReminders: 'Administrar lembretes',
    highlightedBlock: 'Destacar bloco',
    highlightedBlockDescription: 'Renderiza por cima de sobreposições e marca no painel.',
    help: 'Ajuda',
    helpDescription: 'Como o Chronodex funciona e onde seus dados ficam salvos.',
    helpHowItWorks: 'Como funciona',
    helpHowItWorksDescription: 'Crie blocos de tempo, escolha uma categoria e veja cada atividade encaixada no anel AM/PM. O dashboard mostra a distribuição das 24 horas por categoria.',
    helpStorage: 'Armazenamento local',
    helpStorageDescription: 'Todas as informações são salvas no localStorage, a memória do seu próprio navegador. Elas não são enviadas para servidor e podem sumir se você limpar os dados do navegador.',
    helpTitle: 'Sobre este Chronodex',
    hoursPlanned: 'horas planejadas',
    importJson: 'Importar JSON',
    invalidImportError: 'O arquivo não contém blocos válidos.',
    keepBlock: 'Manter bloco',
    loadExample: 'Carregar exemplo',
    noBlocks: 'Nenhum bloco planejado ainda.',
    noReminders: 'Nenhum lembrete criado ainda.',
    notices: 'avisos',
    notificationsBlocked: 'As notificações estão bloqueadas no navegador.',
    notificationsEnabled: 'Notificações ativadas.',
    notificationsEnabledDescription: 'Você receberá avisos na área de trabalho enquanto esta guia estiver aberta.',
    notificationsUnavailable: 'Este navegador não suporta notificações.',
    optional: 'Opcional',
    planned: 'planejadas',
    progress: 'progresso',
    requiredBlocksForDashboard: 'Adicione pelo menos 4 blocos para abrir o dashboard.',
    reminderDue: 'Lembrete',
    reminders: 'Lembretes',
    reminderTime: 'Horário do lembrete',
    reminderTitlePlaceholder: 'Ex.: Beber água',
    removeReminder: 'Remover lembrete',
    saveChange: 'Salvar alteração',
    spiderDashboard: 'Spider dashboard',
    spiderDashboardDescription: 'Distribuição de tempo por categoria nas 24 horas.',
    timeShare: 'participação do dia',
    start: 'Início',
    themeDark: 'Ativar tema escuro',
    themeLight: 'Ativar tema claro',
    testNotification: 'Testar em 5 segundos',
    testNotificationScheduled: 'Notificação teste agendada para daqui a 5 segundos.',
    testNotificationTitle: 'Notificação teste',
    timeNow: 'hora atual',
    title: 'Título',
    titlePlaceholder: 'Ex.: Revisar planejamento',
    totalBlocks: 'total de blocos',
    visualSettings: 'Aparência do Chronodex',
    visualSettingsDescription: 'Ajuste como os blocos aparecem sobre as linhas técnicas.',
    emptyTitleError: 'Informe um título para o bloco.',
    free: 'livre',
    overlapDetected: 'Sobreposição detectada neste horário.',
    importFailureError: 'Não foi possível importar este JSON.',
  },
  es: {
    actions: 'Acciones del día',
    actionsDescription: 'Importación, exportación y estado inicial.',
    activeBlock: 'bloque actual',
    addBlock: 'Añadir bloque',
    addReminder: 'Añadir recordatorio',
    blockCount: 'bloques',
    blockEnded: 'Bloque finalizado',
    blockOpacity: 'Opacidad de los bloques',
    blockStarted: 'Bloque iniciado',
    blockFormDescription: 'Define horario, color y marca temporal.',
    blocks: 'bloques',
    cancelEdit: 'Cancelar edición',
    category: 'Categoría',
    clearDay: 'Limpiar día',
    closeActions: 'Cerrar acciones',
    closeDashboard: 'Cerrar dashboard',
    closeForm: 'Cerrar formulario',
    collapseSidebar: 'Contraer panel lateral',
    collapseDayBlocks: 'Contraer bloques del día',
    color: 'Color',
    confirmDeleteAction: 'Eliminar bloque',
    confirmDeleteDescription: 'Esta acción quita el bloque del día y no se puede deshacer.',
    confirmDeleteTitle: '¿Eliminar este bloque?',
    dailyPlanning: 'Planificación diaria',
    dayBlocks: 'Bloques del día',
    delete: 'Eliminar',
    description: 'Descripción',
    dismissNotice: 'Descartar aviso',
    editBlock: 'Editar bloque',
    enableNotifications: 'Activar notificaciones',
    end: 'Fin',
    equalTimeError: 'La hora inicial no puede ser igual a la hora final.',
    exportJson: 'Exportar JSON',
    expandSidebar: 'Expandir panel lateral',
    expandDayBlocks: 'Expandir bloques del día',
    openDayBlocks: 'Abrir bloques del día',
    openReminders: 'Administrar recordatorios',
    highlightedBlock: 'Destacar bloque',
    highlightedBlockDescription: 'Se renderiza encima de solapamientos y se marca en el panel.',
    help: 'Ayuda',
    helpDescription: 'Cómo funciona Chronodex y dónde se guardan tus datos.',
    helpHowItWorks: 'Cómo funciona',
    helpHowItWorksDescription: 'Crea bloques de tiempo, elige una categoría y ve cada actividad encajada en el anillo AM/PM. El dashboard muestra la distribución de las 24 horas por categoría.',
    helpStorage: 'Almacenamiento local',
    helpStorageDescription: 'Toda la información se guarda en localStorage, la memoria de tu propio navegador. No se envía a ningún servidor y puede desaparecer si limpias los datos del navegador.',
    helpTitle: 'Acerca de este Chronodex',
    hoursPlanned: 'horas planificadas',
    importJson: 'Importar JSON',
    invalidImportError: 'El archivo no contiene bloques válidos.',
    keepBlock: 'Mantener bloque',
    loadExample: 'Cargar ejemplo',
    noBlocks: 'Aún no hay bloques planificados.',
    noReminders: 'Aún no hay recordatorios.',
    notices: 'avisos',
    notificationsBlocked: 'Las notificaciones están bloqueadas en el navegador.',
    notificationsEnabled: 'Notificaciones activadas.',
    notificationsEnabledDescription: 'Recibirás avisos en el escritorio mientras esta pestaña esté abierta.',
    notificationsUnavailable: 'Este navegador no soporta notificaciones.',
    optional: 'Opcional',
    planned: 'planificadas',
    progress: 'progreso',
    requiredBlocksForDashboard: 'Añade al menos 4 bloques para abrir el dashboard.',
    reminderDue: 'Recordatorio',
    reminders: 'Recordatorios',
    reminderTime: 'Hora del recordatorio',
    reminderTitlePlaceholder: 'Ej.: Beber agua',
    removeReminder: 'Eliminar recordatorio',
    saveChange: 'Guardar cambio',
    spiderDashboard: 'Spider dashboard',
    spiderDashboardDescription: 'Distribución de tiempo por categoría en las 24 horas.',
    timeShare: 'participación del día',
    start: 'Inicio',
    themeDark: 'Activar tema oscuro',
    themeLight: 'Activar tema claro',
    testNotification: 'Probar en 5 segundos',
    testNotificationScheduled: 'Notificación de prueba programada para dentro de 5 segundos.',
    testNotificationTitle: 'Notificación de prueba',
    timeNow: 'hora actual',
    title: 'Título',
    titlePlaceholder: 'Ej.: Revisar planificación',
    totalBlocks: 'total de bloques',
    visualSettings: 'Apariencia de Chronodex',
    visualSettingsDescription: 'Ajusta cómo aparecen los bloques sobre las líneas técnicas.',
    emptyTitleError: 'Ingresa un título para el bloque.',
    free: 'libre',
    overlapDetected: 'Solapamiento detectado en este horario.',
    importFailureError: 'No fue posible importar este JSON.',
  },
  en: {
    actions: 'Day actions',
    actionsDescription: 'Import, export, and initial state.',
    activeBlock: 'current block',
    addBlock: 'Add block',
    addReminder: 'Add reminder',
    blockCount: 'blocks',
    blockEnded: 'Block ended',
    blockOpacity: 'Block opacity',
    blockStarted: 'Block started',
    blockFormDescription: 'Set time, color, and temporal marking.',
    blocks: 'blocks',
    cancelEdit: 'Cancel edit',
    category: 'Category',
    clearDay: 'Clear day',
    closeActions: 'Close actions',
    closeDashboard: 'Close dashboard',
    closeForm: 'Close form',
    collapseSidebar: 'Collapse sidebar',
    collapseDayBlocks: 'Collapse day blocks',
    color: 'Color',
    confirmDeleteAction: 'Delete block',
    confirmDeleteDescription: 'This removes the block from the day and cannot be undone.',
    confirmDeleteTitle: 'Delete this block?',
    dailyPlanning: 'Daily planning',
    dayBlocks: 'Day blocks',
    delete: 'Delete',
    description: 'Description',
    dismissNotice: 'Dismiss notice',
    editBlock: 'Edit block',
    enableNotifications: 'Enable notifications',
    end: 'End',
    equalTimeError: 'Start time cannot be the same as end time.',
    exportJson: 'Export JSON',
    expandSidebar: 'Expand sidebar',
    expandDayBlocks: 'Expand day blocks',
    openDayBlocks: 'Open day blocks',
    openReminders: 'Manage reminders',
    highlightedBlock: 'Highlight block',
    highlightedBlockDescription: 'Renders above overlaps and marks it in the panel.',
    help: 'Help',
    helpDescription: 'How Chronodex works and where your data is stored.',
    helpHowItWorks: 'How it works',
    helpHowItWorksDescription: 'Create time blocks, choose a category, and see each activity fitted into the AM/PM ring. The dashboard shows the 24-hour distribution by category.',
    helpStorage: 'Local storage',
    helpStorageDescription: 'All information is saved in localStorage, the memory of your own browser. It is not sent to a server and may disappear if you clear browser data.',
    helpTitle: 'About this Chronodex',
    hoursPlanned: 'planned hours',
    importJson: 'Import JSON',
    invalidImportError: 'The file does not contain valid blocks.',
    keepBlock: 'Keep block',
    loadExample: 'Load example',
    noBlocks: 'No blocks planned yet.',
    noReminders: 'No reminders yet.',
    notices: 'notices',
    notificationsBlocked: 'Notifications are blocked in the browser.',
    notificationsEnabled: 'Notifications enabled.',
    notificationsEnabledDescription: 'You will receive desktop alerts while this tab is open.',
    notificationsUnavailable: 'This browser does not support notifications.',
    optional: 'Optional',
    planned: 'planned',
    progress: 'progress',
    requiredBlocksForDashboard: 'Add at least 4 blocks to open the dashboard.',
    reminderDue: 'Reminder',
    reminders: 'Reminders',
    reminderTime: 'Reminder time',
    reminderTitlePlaceholder: 'E.g. Drink water',
    removeReminder: 'Remove reminder',
    saveChange: 'Save change',
    spiderDashboard: 'Spider dashboard',
    spiderDashboardDescription: 'Time distribution by category across the 24-hour day.',
    timeShare: 'day share',
    start: 'Start',
    themeDark: 'Enable dark theme',
    themeLight: 'Enable light theme',
    testNotification: 'Test in 5 seconds',
    testNotificationScheduled: 'Test notification scheduled for 5 seconds from now.',
    testNotificationTitle: 'Test notification',
    timeNow: 'current time',
    title: 'Title',
    titlePlaceholder: 'E.g. Review planning',
    totalBlocks: 'total blocks',
    visualSettings: 'Chronodex appearance',
    visualSettingsDescription: 'Adjust how blocks appear over the technical lines.',
    emptyTitleError: 'Enter a title for the block.',
    free: 'free',
    overlapDetected: 'Overlap detected at this time.',
    importFailureError: 'Could not import this JSON.',
  },
  ja: {
    actions: '日の操作',
    actionsDescription: 'インポート、エクスポート、初期状態。',
    activeBlock: '現在のブロック',
    addBlock: 'ブロックを追加',
    addReminder: 'リマインダーを追加',
    blockCount: 'ブロック',
    blockEnded: 'ブロック終了',
    blockOpacity: 'ブロックの不透明度',
    blockStarted: 'ブロック開始',
    blockFormDescription: '時刻、色、時間マークを設定します。',
    blocks: 'ブロック',
    cancelEdit: '編集をキャンセル',
    category: 'カテゴリ',
    clearDay: '日をクリア',
    closeActions: '操作を閉じる',
    closeDashboard: 'ダッシュボードを閉じる',
    closeForm: 'フォームを閉じる',
    collapseSidebar: 'サイドバーを折りたたむ',
    collapseDayBlocks: '今日のブロックを折りたたむ',
    color: '色',
    confirmDeleteAction: 'ブロックを削除',
    confirmDeleteDescription: 'この日のブロックを削除します。この操作は元に戻せません。',
    confirmDeleteTitle: 'このブロックを削除しますか？',
    dailyPlanning: '日次計画',
    dayBlocks: '今日のブロック',
    delete: '削除',
    description: '説明',
    dismissNotice: '通知を閉じる',
    editBlock: 'ブロックを編集',
    enableNotifications: '通知を有効化',
    end: '終了',
    equalTimeError: '開始時刻と終了時刻は同じにできません。',
    exportJson: 'JSONを書き出す',
    expandSidebar: 'サイドバーを展開',
    expandDayBlocks: '今日のブロックを展開',
    openDayBlocks: '今日のブロックを開く',
    openReminders: 'リマインダーを管理',
    highlightedBlock: 'ブロックを強調',
    highlightedBlockDescription: '重なりの上に表示し、パネルに印を付けます。',
    help: 'ヘルプ',
    helpDescription: 'Chronodexの仕組みとデータの保存場所。',
    helpHowItWorks: '仕組み',
    helpHowItWorksDescription: '時間ブロックを作成し、カテゴリを選ぶと、各活動がAM/PMリングに配置されます。ダッシュボードでは24時間のカテゴリ別配分を確認できます。',
    helpStorage: 'ローカル保存',
    helpStorageDescription: 'すべての情報はlocalStorage、つまり自分のブラウザ内のメモリに保存されます。サーバーには送信されず、ブラウザデータを削除すると消える場合があります。',
    helpTitle: 'このChronodexについて',
    hoursPlanned: '計画時間',
    importJson: 'JSONを読み込む',
    invalidImportError: '有効なブロックが含まれていません。',
    keepBlock: 'ブロックを残す',
    loadExample: '例を読み込む',
    noBlocks: '計画されたブロックはまだありません。',
    noReminders: 'リマインダーはまだありません。',
    notices: '通知',
    notificationsBlocked: 'ブラウザで通知がブロックされています。',
    notificationsEnabled: '通知が有効になりました。',
    notificationsEnabledDescription: 'このタブを開いている間、デスクトップ通知を受け取れます。',
    notificationsUnavailable: 'このブラウザは通知をサポートしていません。',
    optional: '任意',
    planned: '計画済み',
    progress: '進捗',
    requiredBlocksForDashboard: 'ダッシュボードを開くには4つ以上のブロックを追加してください。',
    reminderDue: 'リマインダー',
    reminders: 'リマインダー',
    reminderTime: 'リマインダー時刻',
    reminderTitlePlaceholder: '例: 水を飲む',
    removeReminder: 'リマインダーを削除',
    saveChange: '変更を保存',
    spiderDashboard: 'スパイダーダッシュボード',
    spiderDashboardDescription: '24時間におけるカテゴリ別の時間配分。',
    timeShare: '日の割合',
    start: '開始',
    themeDark: 'ダークテーマを有効化',
    themeLight: 'ライトテーマを有効化',
    testNotification: '5秒後にテスト',
    testNotificationScheduled: 'テスト通知を5秒後に予約しました。',
    testNotificationTitle: 'テスト通知',
    timeNow: '現在時刻',
    title: 'タイトル',
    titlePlaceholder: '例: 計画を見直す',
    totalBlocks: 'ブロック合計',
    visualSettings: 'Chronodexの表示',
    visualSettingsDescription: '技術的な線の上に表示されるブロックの見え方を調整します。',
    emptyTitleError: 'ブロックのタイトルを入力してください。',
    free: '空き',
    overlapDetected: 'この時間に重なりがあります。',
    importFailureError: 'このJSONを読み込めませんでした。',
  },
};

export const CATEGORY_LABELS: Record<AppLocale, Record<Category, string>> = {
  'pt-BR': {
    Trabalho: 'Trabalho',
    Estudo: 'Estudo',
    Saúde: 'Saúde',
    Casa: 'Casa',
    Descanso: 'Descanso',
    Alimentação: 'Alimentação',
    'Projeto pessoal': 'Projeto pessoal',
  },
  es: {
    Trabalho: 'Trabajo',
    Estudo: 'Estudio',
    Saúde: 'Salud',
    Casa: 'Casa',
    Descanso: 'Descanso',
    Alimentação: 'Alimentación',
    'Projeto pessoal': 'Proyecto personal',
  },
  en: {
    Trabalho: 'Work',
    Estudo: 'Study',
    Saúde: 'Health',
    Casa: 'Home',
    Descanso: 'Rest',
    Alimentação: 'Meals',
    'Projeto pessoal': 'Personal project',
  },
  ja: {
    Trabalho: '仕事',
    Estudo: '学習',
    Saúde: '健康',
    Casa: '家事',
    Descanso: '休息',
    Alimentação: '食事',
    'Projeto pessoal': '個人プロジェクト',
  },
};

export function isAppLocale(value: string | null): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

export function getMessages(locale: AppLocale): Messages {
  return MESSAGES[locale];
}

export function getCategoryLabel(category: Category, locale: AppLocale): string {
  return CATEGORY_LABELS[locale][category];
}

export function formatLocalizedDuration(minutes: number, locale: AppLocale): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale === 'ja') {
    if (hours === 0) {
      return `${mins}分`;
    }

    if (mins === 0) {
      return `${hours}時間`;
    }

    return `${hours}時間 ${mins}分`;
  }

  if (locale === 'en') {
    if (hours === 0) {
      return `${mins} min`;
    }

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins} min`;
  }

  if (hours === 0) {
    return `${mins}min`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}min`;
}

export function getLocaleFromStorage(storage: Storage): AppLocale {
  const storedLocale = storage.getItem(LOCALE_STORAGE_KEY);
  return isAppLocale(storedLocale) ? storedLocale : 'pt-BR';
}
