import { type FormEvent, useEffect, useState } from 'react';
import { CATEGORIES, CATEGORY_COLORS, type Category, type TimeBlock } from '../types';

type FormState = Omit<TimeBlock, 'id'>;

type TimeBlockFormProps = {
  editingBlock: TimeBlock | null;
  error: string | null;
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
};

export function TimeBlockForm({
  editingBlock,
  error,
  onSubmit,
  onCancelEdit,
}: TimeBlockFormProps) {
  const [form, setForm] = useState<FormState>(emptyForm);

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
        <label className="mb-2 block text-xs font-medium text-gray-600" htmlFor="title">
          Título
        </label>
        <input
          id="title"
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="Ex.: Revisar planejamento"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-gray-500"
        />
      </div>

      <div>
        <label
          className="mb-2 block text-xs font-medium text-gray-600"
          htmlFor="description"
        >
          Descrição
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Opcional"
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-gray-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            className="mb-2 block text-xs font-medium text-gray-600"
            htmlFor="startTime"
          >
            Início
          </label>
          <input
            id="startTime"
            type="time"
            value={form.startTime}
            onChange={(event) => updateField('startTime', event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition focus:border-gray-500"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-600" htmlFor="endTime">
            Fim
          </label>
          <input
            id="endTime"
            type="time"
            value={form.endTime}
            onChange={(event) => updateField('endTime', event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition focus:border-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label
            className="mb-2 block text-xs font-medium text-gray-600"
            htmlFor="category"
          >
            Categoria
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(event) => handleCategoryChange(event.target.value as Category)}
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-black outline-none transition focus:border-gray-500"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-600" htmlFor="color">
            Cor
          </label>
          <input
            id="color"
            type="color"
            value={form.color}
            onChange={(event) => updateField('color', event.target.value)}
            className="h-11 w-14 rounded-xl border border-gray-200 bg-white p-1.5"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {editingBlock ? 'Salvar alteração' : 'Adicionar bloco'}
        </button>
        {editingBlock ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancelar edição
          </button>
        ) : null}
      </div>
    </form>
  );
}
