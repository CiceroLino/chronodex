import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ChronodexView } from './components/ChronodexView';
import { TimeBlockForm } from './components/TimeBlockForm';
import { TimeBlockList } from './components/TimeBlockList';
import { CATEGORY_COLORS, CATEGORIES, type TimeBlock } from './types';
import {
  detectOverlaps,
  getTotalPlannedMinutes,
  isMinuteInsideBlock,
  timeToMinutes,
} from './utils/time';

type EditableBlock = Omit<TimeBlock, 'id'>;

const STORAGE_KEY = 'chronodex-time-blocks';

const sampleBlocks: TimeBlock[] = [
  {
    id: 'sample-1',
    title: 'Ritual matinal',
    description: 'Café, revisão do dia e preparação mental.',
    startTime: '06:30',
    endTime: '07:30',
    category: 'Saúde',
    color: CATEGORY_COLORS.Saúde,
  },
  {
    id: 'sample-2',
    title: 'Trabalho profundo',
    description: 'Bloco sem reuniões para tarefas de maior impacto.',
    startTime: '08:30',
    endTime: '11:30',
    category: 'Trabalho',
    color: CATEGORY_COLORS.Trabalho,
  },
  {
    id: 'sample-3',
    title: 'Almoço',
    startTime: '12:00',
    endTime: '13:00',
    category: 'Alimentação',
    color: CATEGORY_COLORS.Alimentação,
  },
  {
    id: 'sample-4',
    title: 'Estudo guiado',
    startTime: '15:00',
    endTime: '16:30',
    category: 'Estudo',
    color: CATEGORY_COLORS.Estudo,
  },
  {
    id: 'sample-5',
    title: 'Projeto pessoal',
    startTime: '20:30',
    endTime: '22:30',
    category: 'Projeto pessoal',
    color: CATEGORY_COLORS['Projeto pessoal'],
  },
];

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredBlocks(): TimeBlock[] {
  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return parseBlocks(parsed);
  } catch {
    return [];
  }
}

function parseBlocks(value: unknown): TimeBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item): TimeBlock[] => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const block = item as Partial<TimeBlock>;
    const category = block.category;
    const hasValidCategory =
      typeof category === 'string' && CATEGORIES.includes(category);

    if (
      typeof block.title !== 'string' ||
      typeof block.startTime !== 'string' ||
      typeof block.endTime !== 'string' ||
      typeof block.color !== 'string' ||
      !hasValidCategory
    ) {
      return [];
    }

    return [
      {
        id: typeof block.id === 'string' ? block.id : createId(),
        title: block.title,
        description: typeof block.description === 'string' ? block.description : '',
        startTime: block.startTime,
        endTime: block.endTime,
        category,
        color: block.color,
      },
    ];
  });
}

function sortBlocks(blocks: TimeBlock[]): TimeBlock[] {
  return [...blocks].sort(
    (first, second) => timeToMinutes(first.startTime) - timeToMinutes(second.startTime),
  );
}

function App() {
  const [blocks, setBlocks] = useState<TimeBlock[]>(() => readStoredBlocks());
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const sortedBlocks = useMemo(() => sortBlocks(blocks), [blocks]);
  const overlapIds = useMemo(() => detectOverlaps(blocks), [blocks]);
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const activeBlockId =
    blocks.find((block) => isMinuteInsideBlock(currentMinute, block))?.id ?? null;
  const totalMinutes = getTotalPlannedMinutes(blocks);

  function saveBlock(form: EditableBlock) {
    if (!form.title) {
      setError('Informe um título para o bloco.');
      return;
    }

    if (form.startTime === form.endTime) {
      setError('O horário inicial não pode ser igual ao horário final.');
      return;
    }

    setError(null);

    if (editingBlock) {
      const updatedBlock = { ...form, id: editingBlock.id };
      setBlocks((current) =>
        current.map((block) => (block.id === editingBlock.id ? updatedBlock : block)),
      );
      setEditingBlock(null);
      setSelectedBlock(updatedBlock);
      return;
    }

    const newBlock = { ...form, id: createId() };
    setBlocks((current) => [...current, newBlock]);
    setSelectedBlock(newBlock);
  }

  function deleteBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id));

    if (editingBlock?.id === id) {
      setEditingBlock(null);
    }

    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
    }
  }

  function loadExample() {
    setBlocks(sampleBlocks.map((block) => ({ ...block, id: createId() })));
    setEditingBlock(null);
    setSelectedBlock(null);
    setError(null);
  }

  function clearDay() {
    setBlocks([]);
    setEditingBlock(null);
    setSelectedBlock(null);
    setError(null);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(blocks, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'chronodex-blocos.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const parsedBlocks = parseBlocks(JSON.parse(content));

      if (parsedBlocks.length === 0) {
        setError('O arquivo não contém blocos válidos.');
        return;
      }

      setBlocks(parsedBlocks);
      setEditingBlock(null);
      setSelectedBlock(null);
      setError(null);
    } catch {
      setError('Não foi possível importar este JSON.');
    } finally {
      event.target.value = '';
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f7] text-black">
      <div className="grid min-h-screen lg:grid-cols-[390px_minmax(0,1fr)]">
        <section className="border-b border-gray-200 bg-white px-6 py-7 lg:border-b-0 lg:border-r lg:px-7">
          <header className="mb-9">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gray-500">
              Planejamento diário
            </p>
            <h1 className="mt-3 text-3xl font-light tracking-normal text-black">Chronodex</h1>
            <p className="mt-3 text-sm font-normal leading-6 text-gray-500">
              {new Intl.DateTimeFormat('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
              }).format(now)}
            </p>
          </header>

          <section className="border-t border-gray-200 pt-6">
            <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
              Novo bloco
            </h2>
            <TimeBlockForm
              editingBlock={editingBlock}
              error={error}
              onSubmit={saveBlock}
              onCancelEdit={() => {
                setEditingBlock(null);
                setError(null);
              }}
            />
          </section>

          <section className="mt-9 border-t border-gray-200 pt-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                Blocos do dia
              </h2>
            </div>

            <TimeBlockList
              blocks={sortedBlocks}
              overlapIds={overlapIds}
              activeBlockId={activeBlockId}
              onEdit={(block) => {
                setEditingBlock(block);
                setSelectedBlock(block);
                setError(null);
              }}
              onDelete={deleteBlock}
            />
          </section>

          <section className="mt-9 border-t border-gray-200 pt-6">
            <h2 className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
              Ações
            </h2>
            <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={loadExample}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Exemplo
                </button>
                <button
                  type="button"
                  onClick={exportJson}
                  disabled={blocks.length === 0}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                >
                  Exportar
                </button>
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                >
                  Importar
                </button>
                <button
                  type="button"
                  onClick={clearDay}
                  disabled={blocks.length === 0}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40"
                >
                  Limpar
                </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                onChange={importJson}
                className="hidden"
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <span className="block text-lg font-light text-black">{blocks.length}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  blocos
                </span>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <span className="block text-lg font-light text-black">
                  {Math.floor(totalMinutes / 60)}h
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500">
                  planejadas
                </span>
              </div>
            </div>
          </section>
        </section>

        <ChronodexView
          blocks={sortedBlocks}
          now={now}
          selectedBlock={selectedBlock}
          onSelectBlock={setSelectedBlock}
        />
      </div>
    </main>
  );
}

export default App;
