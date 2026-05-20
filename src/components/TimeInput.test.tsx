import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { TimeInput } from './TimeInput';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLInputElement.prototype, 'showPicker');
});

describe('TimeInput', () => {
  test('opens the native time picker from the clock button', () => {
    const showPicker = vi.fn();
    HTMLInputElement.prototype.showPicker = showPicker;

    render(
      <TimeInput
        id="appointment-time"
        label="Hora"
        value="09:00"
        onChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir seletor de hora' }));

    const input = screen.getByLabelText<HTMLInputElement>('Hora');

    expect(showPicker).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(input);
  });
});
