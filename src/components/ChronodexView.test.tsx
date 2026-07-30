import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { TimeBlock } from '../types';
import { ChronodexView } from './ChronodexView';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(Element.prototype, 'setPointerCapture');
});

const activeBlock: TimeBlock = {
  id: 'active-block',
  title: 'Projeto pessoal',
  startTime: '20:30',
  endTime: '22:30',
  category: 'Projeto pessoal',
  color: '#c7a5bd',
};

function renderChronodex() {
  return render(
    <ChronodexView
      blocks={[activeBlock]}
      now={new Date('2026-07-29T21:00:00')}
      selectedBlock={null}
      locale="pt-BR"
      blockOpacity={0.5}
      onSelectBlock={vi.fn()}
      onCreateBlockAtRange={vi.fn()}
    />,
  );
}

describe('ChronodexView motion geometry', () => {
  test('uses only exact time ticks as radial guide divisions', () => {
    const { container } = renderChronodex();

    expect(
      container.querySelectorAll('path.chronodex-line-draw'),
    ).toHaveLength(0);
    expect(
      container.querySelectorAll('line.chronodex-tick-draw'),
    ).toHaveLength(96);
  });

  test('draws compass progress on the PM perimeter', () => {
    const { container } = renderChronodex();

    fireEvent.pointerEnter(screen.getByRole('button', { name: 'Dia passado' }));

    const progress = container.querySelector('.chronodex-compass-progress');
    const insightCard = screen.getByTestId('chronodex-compass-insight');

    expect(progress).not.toBeNull();
    expect(progress?.getAttribute('d')).toContain('A 194 194');
    expect(progress?.getAttribute('d')).not.toContain('A 226 226');
    expect(progress?.getAttribute('stroke-width')).toBe('3.2');
    expect(insightCard.className).toContain(
      'xl:left-[calc(100%+1.5rem)]',
    );
  });

  test('clips a PM block to its ring and delays dynamic content', () => {
    const { container } = renderChronodex();
    const block = screen.getByRole('button', {
      name: 'Projeto pessoal, 20:30 até 22:30',
    });
    const indicator = container.querySelector('.chronodex-current-time');
    const clip = container.querySelector('#chronodex-pm-ring-clip path');

    expect(clip?.getAttribute('clip-rule')).toBe('evenodd');
    expect(block.parentElement?.getAttribute('clip-path')).toBe(
      'url(#chronodex-pm-ring-clip)',
    );
    expect(block.classList.contains('chronodex-content-in')).toBe(true);
    expect(indicator?.classList.contains('chronodex-content-in')).toBe(true);
  });

  test('keeps the PM perimeter fixed while a compass node is pressed', () => {
    Object.defineProperty(Element.prototype, 'setPointerCapture', {
      configurable: true,
      value: vi.fn(),
    });
    const { container } = renderChronodex();
    const pmPerimeter = container.querySelector(
      '[data-chronodex-ring="pm-outer"]',
    );

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Dia passado' }), {
      pointerId: 1,
    });

    expect(pmPerimeter?.getAttribute('r')).toBe('194');
  });
});
