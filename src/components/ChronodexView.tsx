import type { TimeBlock } from '../types';
import {
  formatDuration,
  getDuration,
  isMinuteInsideBlock,
  minutesToAngle,
  polarToCartesian,
} from '../utils/time';
import { ChronodexArc } from './ChronodexArc';
import { CurrentTimeIndicator } from './CurrentTimeIndicator';
import { StatsPanel } from './StatsPanel';

type ChronodexViewProps = {
  blocks: TimeBlock[];
  now: Date;
  selectedBlock: TimeBlock | null;
  onSelectBlock: (block: TimeBlock | null) => void;
};

const labelHours = [0, 3, 6, 9, 12, 15, 18, 21];

export function ChronodexView({
  blocks,
  now,
  selectedBlock,
  onSelectBlock,
}: ChronodexViewProps) {
  const currentMinute = now.getHours() * 60 + now.getMinutes();
  const activeBlock = blocks.find((block) => isMinuteInsideBlock(currentMinute, block)) ?? null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-xl shadow-slate-900/8 backdrop-blur sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-950">Chronodex</h2>
          <p className="text-sm font-medium text-slate-500">24 horas</p>
        </div>
        {activeBlock ? (
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-bold text-cyan-800">
            Agora: {activeBlock.title}
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="relative mx-auto aspect-square w-full max-w-[680px]">
          <svg
            viewBox="0 0 500 500"
            className="h-full w-full overflow-visible rounded-2xl bg-[#f8fbfd]"
            role="img"
            aria-label="Chronodex radial de vinte e quatro horas"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                onSelectBlock(null);
              }
            }}
          >
            <defs>
              <filter id="arcShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity="0.12" />
              </filter>
            </defs>

            <circle cx="250" cy="250" r="210" fill="#f8fbfd" stroke="#d9e4ea" />
            <circle cx="250" cy="250" r="190" fill="none" stroke="#e5edf2" strokeWidth="1" />
            <circle cx="250" cy="250" r="140" fill="none" stroke="#e5edf2" strokeWidth="1" />
            <circle cx="250" cy="250" r="96" fill="none" stroke="#edf3f6" strokeWidth="1" />

            {Array.from({ length: 24 }, (_, hour) => {
              const angle = minutesToAngle(hour * 60);
              const inner = polarToCartesian(250, 250, hour % 3 === 0 ? 184 : 192, angle);
              const outer = polarToCartesian(250, 250, 206, angle);

              return (
                <line
                  key={hour}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={hour % 3 === 0 ? '#8aa2b2' : '#d4e0e7'}
                  strokeWidth={hour % 3 === 0 ? 2 : 1}
                  strokeLinecap="round"
                />
              );
            })}

            {labelHours.map((hour) => {
              const point = polarToCartesian(250, 250, 226, minutesToAngle(hour * 60));
              return (
                <text
                  key={hour}
                  x={point.x}
                  y={point.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-500 text-[15px] font-black"
                >
                  {String(hour).padStart(2, '0')}
                </text>
              );
            })}

            <g filter="url(#arcShadow)">
              {blocks.map((block) => (
                <ChronodexArc
                  key={block.id}
                  block={block}
                  isActive={activeBlock?.id === block.id}
                  isSelected={selectedBlock?.id === block.id}
                  onSelect={onSelectBlock}
                />
              ))}
            </g>

            <CurrentTimeIndicator now={now} />
          </svg>

          <StatsPanel blocks={blocks} now={now} />
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner">
          {selectedBlock ? (
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: selectedBlock.color }}
                />
                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  {selectedBlock.category}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-950">{selectedBlock.title}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                {selectedBlock.startTime} - {selectedBlock.endTime}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">
                {formatDuration(getDuration(selectedBlock.startTime, selectedBlock.endTime))}
              </p>
              {selectedBlock.description ? (
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {selectedBlock.description}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex h-full min-h-40 flex-col justify-center text-sm text-slate-500">
              <span className="font-bold text-slate-700">Sem bloco selecionado</span>
              <span className="mt-2 leading-6">Detalhes do bloco aparecem aqui.</span>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
