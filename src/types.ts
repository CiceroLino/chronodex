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
  highlighted?: boolean;
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
  Trabalho: '#8fb2d8',
  Estudo: '#b8a7d8',
  Saúde: '#a9cdb6',
  Casa: '#d8c486',
  Descanso: '#9dc8c6',
  Alimentação: '#d9a095',
  'Projeto pessoal': '#c7a5bd',
};
