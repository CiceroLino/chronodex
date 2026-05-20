import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { TimeBlockForm } from './TimeBlockForm';

afterEach(() => {
  cleanup();
});

describe('TimeBlockForm', () => {
  test('uses an initial time range when creating a new block', () => {
    render(
      <TimeBlockForm
        editingBlock={null}
        error={null}
        initialTimeRange={{ startTime: '09:00', endTime: '10:00' }}
        locale="pt-BR"
        onSubmit={vi.fn()}
        onCancelEdit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText<HTMLInputElement>('Início').value).toBe('09:00');
    expect(screen.getByLabelText<HTMLInputElement>('Fim').value).toBe('10:00');
  });

  test('submits the suggested time range with a new block', () => {
    const onSubmit = vi.fn();

    render(
      <TimeBlockForm
        editingBlock={null}
        error={null}
        initialTimeRange={{ startTime: '15:00', endTime: '16:00' }}
        locale="pt-BR"
        onSubmit={onSubmit}
        onCancelEdit={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Título'), {
      target: { value: 'Revisar planejamento' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar bloco' }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Revisar planejamento',
        startTime: '15:00',
        endTime: '16:00',
      }),
    );
  });
});
