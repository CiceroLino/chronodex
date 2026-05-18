import { type FormEvent, useEffect, useState } from 'react';
import {
  getCategoryLabel,
  getMessages,
  type AppLocale,
} from '../i18n';
import { CATEGORIES, CATEGORY_COLORS, type Category, type TimeBlock } from '../types';

type FormState = Omit<TimeBlock, 'id'>;

type TimeBlockFormProps = {
  editingBlock: TimeBlock | null;
  error: string | null;
  locale: AppLocale;
  onSubmit: (block: FormState) => void;
  onCancelEdit: () => void;
};

const emptyForm: FormState = {
  title: '',
  description: '',
  startTime: '09:00',
  endTime: '10:00',
  category: 'Trabalho',
  color: CATEGORY_COLORS.Trabalho,
  highlighted: false,
};

export function TimeBlockForm({
  editingBlock,
  error,
  locale,
  onSubmit,
  onCancelEdit,
}: TimeBlockFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const messages = getMessages(locale);

  useEffect(() => {
    if (editingBlock) {
      const { id: _id, ...editableBlock } = editingBlock;
      setForm(editableBlock);
      return;
    }

    setForm(emptyForm);
  }, [editingBlock]);

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleCategoryChange(category: Category) {
    setForm((current) => ({
      ...current,
      category,
      color: CATEGORY_COLORS[category],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description?.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400" htmlFor="title">
          {messages.title}
        </label>
        <input
          id="title"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder={messages.titlePlaceholder}
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-neutral-500"
        />
      </div>

      <div>
        <label
          className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400"
          htmlFor="description"
        >
          {messages.description}
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder={messages.optional}
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-neutral-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400"
            htmlFor="startTime"
          >
            {messages.start}
          </label>
          <input
            id="startTime"
            type="time"
            value={form.startTime}
            onChange={(event) => updateField('startTime', event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition focus:border-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-white dark:focus:border-neutral-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400" htmlFor="endTime">
            {messages.end}
          </label>
          <input
            id="endTime"
            type="time"
            value={form.endTime}
            onChange={(event) => updateField('endTime', event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition focus:border-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-white dark:focus:border-neutral-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label
            className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400"
            htmlFor="category"
          >
            {messages.category}
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(event) => handleCategoryChange(event.target.value as Category)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition focus:border-gray-500 dark:border-neutral-800 dark:bg-[#191919] dark:text-white dark:focus:border-neutral-500"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {getCategoryLabel(category, locale)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-600 dark:text-neutral-400" htmlFor="color">
            {messages.color}
          </label>
          <input
            id="color"
            type="color"
            value={form.color}
            onChange={(event) => updateField('color', event.target.value)}
            className="h-11 w-14 rounded-xl border border-gray-200 bg-white p-1.5 dark:border-neutral-800 dark:bg-[#191919]"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300">
        <input
          type="checkbox"
          checked={form.highlighted === true}
          onChange={(event) => updateField('highlighted', event.target.checked)}
          className="h-4 w-4 accent-black dark:accent-white"
        />
        <span className="flex min-w-0 flex-col">
          <span className="font-medium text-black dark:text-white">
            {messages.highlightedBlock}
          </span>
          <span className="mt-0.5 text-xs text-gray-500 dark:text-neutral-500">
            {messages.highlightedBlockDescription}
          </span>
        </span>
      </label>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {editingBlock ? messages.saveChange : messages.addBlock}
        </button>
        {editingBlock ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-neutral-800 dark:bg-[#191919] dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            {messages.cancelEdit}
          </button>
        ) : null}
      </div>
    </form>
  );
}
