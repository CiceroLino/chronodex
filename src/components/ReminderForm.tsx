import { type FormEvent, useState } from 'react';
import { getMessages, type AppLocale } from '../i18n';
import type { Reminder } from '../types';

type ReminderFormProps = {
  locale: AppLocale;
  onSubmit: (reminder: Omit<Reminder, 'id'>) => void;
};

const emptyReminder: Omit<Reminder, 'id'> = {
  title: '',
  description: '',
  time: '09:00',
  enabled: true,
};

export function ReminderForm({ locale, onSubmit }: ReminderFormProps) {
  const [form, setForm] = useState(emptyReminder);
  const messages = getMessages(locale);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description?.trim(),
    });
    setForm(emptyReminder);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400" htmlFor="reminder-title">
          {messages.title}
        </label>
        <input
          id="reminder-title"
          value={form.title}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          placeholder={messages.reminderTitlePlaceholder}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-neutral-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400" htmlFor="reminder-time">
          {messages.reminderTime}
        </label>
        <input
          id="reminder-time"
          type="time"
          value={form.time}
          onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition focus:border-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-white dark:focus:border-neutral-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400" htmlFor="reminder-description">
          {messages.description}
        </label>
        <textarea
          id="reminder-description"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder={messages.optional}
          rows={2}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-neutral-500"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        {messages.addReminder}
      </button>
    </form>
  );
}
