import type { TimeBlock } from '../types';
import { formatDuration, getDuration } from '../utils/time';

type TimeBlockListProps = {
  blocks: TimeBlock[];
  overlapIds: Set<string>;
  activeBlockId: string | null;
  onEdit: (block: TimeBlock) => void;
  onDelete: (id: string) => void;
};

export function TimeBlockList({
  blocks,
  overlapIds,
  activeBlockId,
  onEdit,
  onDelete,
}: TimeBlockListProps) {
  if (blocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-8 text-center text-sm text-slate-500">
        Nenhum bloco planejado ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block) => {
        const hasOverlap = overlapIds.has(block.id);
        const isActive = activeBlockId === block.id;

        return (
          <div
            key={block.id}
            className={[
              'rounded-2xl border bg-white p-4 shadow-sm transition',
              hasOverlap ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200',
              isActive ? 'ring-4 ring-cyan-100' : '',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="mt-1 h-4 w-4 shrink-0 rounded-full shadow-inner"
                style={{ backgroundColor: block.color }}
              />
              <button
                type="button"
                onClick={() => onEdit(block)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-sm font-bold text-slate-900">
                  {block.title}
                </span>
                <span className="mt-1 block text-xs font-medium text-slate-500">
                  {block.startTime} - {block.endTime} ·{' '}
                  {formatDuration(getDuration(block.startTime, block.endTime))}
                </span>
                <span className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {block.category}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(block.id)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Excluir
              </button>
            </div>
            {hasOverlap ? (
              <p className="mt-3 text-xs font-semibold text-amber-700">
                Sobreposição detectada neste horário.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
