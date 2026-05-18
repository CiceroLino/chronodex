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
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-8 text-center text-sm text-gray-500">
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
              'border bg-white p-3 transition',
              hasOverlap ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200',
              isActive ? 'border-black' : '',
              block.highlighted ? 'border-black' : '',
            ].join(' ')}
          >
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="h-12 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: block.color }}
              />
              <button
                type="button"
                onClick={() => onEdit(block)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {block.highlighted ? (
                    <span
                      aria-label="Bloco destacado"
                      className="h-2 w-2 shrink-0 rounded-full bg-black"
                    />
                  ) : null}
                  <span className="block truncate text-sm font-medium text-black">
                    {block.title}
                  </span>
                </span>
                <span className="mt-1 block text-xs font-normal text-gray-500">
                  {block.startTime} - {block.endTime} ·{' '}
                  {formatDuration(getDuration(block.startTime, block.endTime))}
                </span>
                <span className="mt-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-gray-500">
                  {block.category}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(block.id)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Excluir
              </button>
            </div>
            {hasOverlap ? (
              <p className="mt-3 text-xs font-medium text-amber-700">
                Sobreposição detectada neste horário.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
