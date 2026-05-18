export type Category =
  | 'Trabalho'
  | 'Estudo'
  | 'Saúde'
  | 'Casa'
  | 'Descanso'
  | 'Alimentação'
  | 'Projeto pessoal';

export type TimeBlock = {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  category: Category;
  color: string;
};

export const CATEGORIES: Category[] = [
  'Trabalho',
  'Estudo',
  'Saúde',
  'Casa',
  'Descanso',
  'Alimentação',
  'Projeto pessoal',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Trabalho: '#2563eb',
  Estudo: '#7c3aed',
  Saúde: '#059669',
  Casa: '#d97706',
  Descanso: '#0891b2',
  Alimentação: '#dc2626',
  'Projeto pessoal': '#9333ea',
};
