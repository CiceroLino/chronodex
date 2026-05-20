import { type ChangeEvent, useRef } from 'react';

type TimeInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TimeInput({ id, label, value, onChange }: TimeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function openPicker() {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();
    input.showPicker?.();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value);
  }

  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400" htmlFor={id}>
        {label}
      </label>
      <span className="time-input-shell">
        <input
          ref={inputRef}
          id={id}
          type="time"
          value={value}
          onChange={handleChange}
          className="time-input h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition focus:border-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-white dark:focus:border-neutral-500"
        />
        <button
          type="button"
          aria-label="Abrir seletor de hora"
          className="time-input-trigger"
          onClick={openPicker}
        />
      </span>
    </div>
  );
}
