import { formatDuration, getTotalPlannedMinutes } from '../utils/time';
import type { TimeBlock } from '../types';

type StatsPanelProps = {
  blocks: TimeBlock[];
  now: Date;
};

export function StatsPanel({ blocks, now }: StatsPanelProps) {
  const date = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(now);

  const time = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-slate-200 bg-white/92 text-center shadow-xl shadow-slate-900/10 backdrop-blur">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">
        {date}
      </span>
      <span className="mt-2 text-2xl font-black text-slate-950">{time}</span>
      <span className="mt-2 text-xs font-semibold text-slate-500">
        {formatDuration(getTotalPlannedMinutes(blocks))}
      </span>
      <span className="text-xs font-medium text-slate-400">
        {blocks.length} {blocks.length === 1 ? 'bloco' : 'blocos'}
      </span>
    </div>
  );
}
