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
  blockCount: string;
  blockFormDescription: string;
  blocks: string;
  cancelEdit: string;
  category: string;
  clearDay: string;
  closeActions: string;
  closeDashboard: string;
  closeForm: string;
  collapseSidebar: string;
  color: string;
  dailyPlanning: string;
  dayBlocks: string;
  delete: string;
  description: string;
  editBlock: string;
  end: string;
  equalTimeError: string;
  exportJson: string;
  expandSidebar: string;
  highlightedBlock: string;
  highlightedBlockDescription: string;
  hoursPlanned: string;
  importJson: string;
  invalidImportError: string;
  loadExample: string;
  noBlocks: string;
  optional: string;
  planned: string;
  progress: string;
  requiredBlocksForDashboard: string;
  saveChange: string;
  spiderDashboard: string;
  spiderDashboardDescription: string;
  timeShare: string;
  start: string;
  themeDark: string;
  themeLight: string;
  timeNow: string;
  title: string;
  titlePlaceholder: string;
  totalBlocks: string;
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
    blockCount: 'blocos',
    blockFormDescription: 'Defina horário, cor e marcação temporal.',
    blocks: 'blocos',
    cancelEdit: 'Cancelar edição',
    category: 'Categoria',
    clearDay: 'Limpar dia',
    closeActions: 'Fechar ações',
    closeDashboard: 'Fechar dashboard',
    closeForm: 'Fechar formulário',
    collapseSidebar: 'Recolher painel lateral',
    color: 'Cor',
    dailyPlanning: 'Planejamento diário',
    dayBlocks: 'Blocos do dia',
    delete: 'Excluir',
    description: 'Descrição',
    editBlock: 'Editar bloco',
    end: 'Fim',
    equalTimeError: 'O horário inicial não pode ser igual ao horário final.',
    exportJson: 'Exportar JSON',
    expandSidebar: 'Expandir painel lateral',
    highlightedBlock: 'Destacar bloco',
    highlightedBlockDescription: 'Renderiza por cima de sobreposições e marca no painel.',
    hoursPlanned: 'horas planejadas',
    importJson: 'Importar JSON',
    invalidImportError: 'O arquivo não contém blocos válidos.',
    loadExample: 'Carregar exemplo',
    noBlocks: 'Nenhum bloco planejado ainda.',
    optional: 'Opcional',
    planned: 'planejadas',
    progress: 'progresso',
    requiredBlocksForDashboard: 'Adicione pelo menos 4 blocos para abrir o dashboard.',
    saveChange: 'Salvar alteração',
    spiderDashboard: 'Spider dashboard',
    spiderDashboardDescription: 'Distribuição de tempo por categoria nas 24 horas.',
    timeShare: 'participação do dia',
    start: 'Início',
    themeDark: 'Ativar tema escuro',
    themeLight: 'Ativar tema claro',
    timeNow: 'hora atual',
    title: 'Título',
    titlePlaceholder: 'Ex.: Revisar planejamento',
    totalBlocks: 'total de blocos',
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
    blockCount: 'bloques',
    blockFormDescription: 'Define horario, color y marca temporal.',
    blocks: 'bloques',
    cancelEdit: 'Cancelar edición',
    category: 'Categoría',
    clearDay: 'Limpiar día',
    closeActions: 'Cerrar acciones',
    closeDashboard: 'Cerrar dashboard',
    closeForm: 'Cerrar formulario',
    collapseSidebar: 'Contraer panel lateral',
    color: 'Color',
    dailyPlanning: 'Planificación diaria',
    dayBlocks: 'Bloques del día',
    delete: 'Eliminar',
    description: 'Descripción',
    editBlock: 'Editar bloque',
    end: 'Fin',
    equalTimeError: 'La hora inicial no puede ser igual a la hora final.',
    exportJson: 'Exportar JSON',
    expandSidebar: 'Expandir panel lateral',
    highlightedBlock: 'Destacar bloque',
    highlightedBlockDescription: 'Se renderiza encima de solapamientos y se marca en el panel.',
    hoursPlanned: 'horas planificadas',
    importJson: 'Importar JSON',
    invalidImportError: 'El archivo no contiene bloques válidos.',
    loadExample: 'Cargar ejemplo',
    noBlocks: 'Aún no hay bloques planificados.',
    optional: 'Opcional',
    planned: 'planificadas',
    progress: 'progreso',
    requiredBlocksForDashboard: 'Añade al menos 4 bloques para abrir el dashboard.',
    saveChange: 'Guardar cambio',
    spiderDashboard: 'Spider dashboard',
    spiderDashboardDescription: 'Distribución de tiempo por categoría en las 24 horas.',
    timeShare: 'participación del día',
    start: 'Inicio',
    themeDark: 'Activar tema oscuro',
    themeLight: 'Activar tema claro',
    timeNow: 'hora actual',
    title: 'Título',
    titlePlaceholder: 'Ej.: Revisar planificación',
    totalBlocks: 'total de bloques',
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
    blockCount: 'blocks',
    blockFormDescription: 'Set time, color, and temporal marking.',
    blocks: 'blocks',
    cancelEdit: 'Cancel edit',
    category: 'Category',
    clearDay: 'Clear day',
    closeActions: 'Close actions',
    closeDashboard: 'Close dashboard',
    closeForm: 'Close form',
    collapseSidebar: 'Collapse sidebar',
    color: 'Color',
    dailyPlanning: 'Daily planning',
    dayBlocks: 'Day blocks',
    delete: 'Delete',
    description: 'Description',
    editBlock: 'Edit block',
    end: 'End',
    equalTimeError: 'Start time cannot be the same as end time.',
    exportJson: 'Export JSON',
    expandSidebar: 'Expand sidebar',
    highlightedBlock: 'Highlight block',
    highlightedBlockDescription: 'Renders above overlaps and marks it in the panel.',
    hoursPlanned: 'planned hours',
    importJson: 'Import JSON',
    invalidImportError: 'The file does not contain valid blocks.',
    loadExample: 'Load example',
    noBlocks: 'No blocks planned yet.',
    optional: 'Optional',
    planned: 'planned',
    progress: 'progress',
    requiredBlocksForDashboard: 'Add at least 4 blocks to open the dashboard.',
    saveChange: 'Save change',
    spiderDashboard: 'Spider dashboard',
    spiderDashboardDescription: 'Time distribution by category across the 24-hour day.',
    timeShare: 'day share',
    start: 'Start',
    themeDark: 'Enable dark theme',
    themeLight: 'Enable light theme',
    timeNow: 'current time',
    title: 'Title',
    titlePlaceholder: 'E.g. Review planning',
    totalBlocks: 'total blocks',
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
    blockCount: 'ブロック',
    blockFormDescription: '時刻、色、時間マークを設定します。',
    blocks: 'ブロック',
    cancelEdit: '編集をキャンセル',
    category: 'カテゴリ',
    clearDay: '日をクリア',
    closeActions: '操作を閉じる',
    closeDashboard: 'ダッシュボードを閉じる',
    closeForm: 'フォームを閉じる',
    collapseSidebar: 'サイドバーを折りたたむ',
    color: '色',
    dailyPlanning: '日次計画',
    dayBlocks: '今日のブロック',
    delete: '削除',
    description: '説明',
    editBlock: 'ブロックを編集',
    end: '終了',
    equalTimeError: '開始時刻と終了時刻は同じにできません。',
    exportJson: 'JSONを書き出す',
    expandSidebar: 'サイドバーを展開',
    highlightedBlock: 'ブロックを強調',
    highlightedBlockDescription: '重なりの上に表示し、パネルに印を付けます。',
    hoursPlanned: '計画時間',
    importJson: 'JSONを読み込む',
    invalidImportError: '有効なブロックが含まれていません。',
    loadExample: '例を読み込む',
    noBlocks: '計画されたブロックはまだありません。',
    optional: '任意',
    planned: '計画済み',
    progress: '進捗',
    requiredBlocksForDashboard: 'ダッシュボードを開くには4つ以上のブロックを追加してください。',
    saveChange: '変更を保存',
    spiderDashboard: 'スパイダーダッシュボード',
    spiderDashboardDescription: '24時間におけるカテゴリ別の時間配分。',
    timeShare: '日の割合',
    start: '開始',
    themeDark: 'ダークテーマを有効化',
    themeLight: 'ライトテーマを有効化',
    timeNow: '現在時刻',
    title: 'タイトル',
    titlePlaceholder: '例: 計画を見直す',
    totalBlocks: 'ブロック合計',
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
