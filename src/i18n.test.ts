import { describe, expect, test } from 'vitest';
import {
  formatLocalizedDuration,
  getCategoryLabel,
  getMessages,
  isAppLocale,
} from './i18n';

describe('i18n', () => {
  test('detects supported locales', () => {
    expect(isAppLocale('pt-BR')).toBe(true);
    expect(isAppLocale('es')).toBe(true);
    expect(isAppLocale('en')).toBe(true);
    expect(isAppLocale('ja')).toBe(true);
    expect(isAppLocale('fr')).toBe(false);
  });

  test('returns translated messages and category labels', () => {
    expect(getMessages('en').addBlock).toBe('Add block');
    expect(getMessages('ja').dayBlocks).toBe('今日のブロック');
    expect(getCategoryLabel('Trabalho', 'es')).toBe('Trabajo');
    expect(getCategoryLabel('Projeto pessoal', 'ja')).toBe('個人プロジェクト');
  });

  test('formats duration per locale', () => {
    expect(formatLocalizedDuration(90, 'pt-BR')).toBe('1h 30min');
    expect(formatLocalizedDuration(90, 'es')).toBe('1h 30min');
    expect(formatLocalizedDuration(90, 'en')).toBe('1h 30 min');
    expect(formatLocalizedDuration(90, 'ja')).toBe('1時間 30分');
  });
});
