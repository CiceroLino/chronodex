import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { TimeBlock } from '../types';
import { SpiderDashboard } from './SpiderDashboard';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('SpiderDashboard reduced motion', () => {
  test('renders its final geometry immediately when reduced motion is requested', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const blocks: TimeBlock[] = [{
      id: 'work',
      title: 'Trabalho profundo',
      startTime: '08:00',
      endTime: '10:00',
      category: 'Trabalho',
      color: '#8fb2d8',
    }];
    const { container } = render(<SpiderDashboard blocks={blocks} locale="pt-BR" />);

    await waitFor(() => {
      expect(container.querySelector('polygon')?.getAttribute('points')).not.toBe(
        '130.00,130.00 130.00,130.00 130.00,130.00 130.00,130.00 130.00,130.00 130.00,130.00 130.00,130.00',
      );
    });
    expect(requestAnimationFrame).not.toHaveBeenCalled();
  });
});
