import { useMemo } from 'react';
import {
  ALL_SLOTS,
  ARROW_ROTATION,
  CC,
  pathD,
  simulate,
  slotId,
  slotLabel,
  slotPoint,
  type Mirror,
  type Round,
  type SlotRef,
} from '../data/fliperamemoria';

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GRID_LINES = [116.7, 183.3];

function Mirrors({ mirrors, color }: { mirrors: Mirror[]; color: string }) {
  return (
    <>
      {mirrors.map((m) => {
        const cx = CC[m.col]!;
        const cy = CC[m.row]!;
        const [x1, y1, x2, y2] = m.kind === '\\' ? [cx - 21, cy - 21, cx + 21, cy + 21] : [cx - 21, cy + 21, cx + 21, cy - 21];
        return <line key={`${m.row}-${m.col}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="9" strokeLinecap="round" />;
      })}
    </>
  );
}

function EntryArrow({ slot, color }: { slot: SlotRef; color: string }) {
  const { x, y } = slotPoint(slot);
  return (
    <g transform={`translate(${x} ${y}) rotate(${ARROW_ROTATION[slot.side]})`}>
      <path d="M-11 -9h22l-11 18z" fill={color} />
    </g>
  );
}

export type Phase = 'watch' | 'choose' | 'solved';

interface BoardProps {
  round: Round;
  phase: Phase;
  wrong: string[];
  replayKey: number;
  onPick: (slot: SlotRef) => void;
}

/** Interactive 3x3 board for the Fliperamemória practice (T3.D). */
export default function PinballBoard({ round, phase, wrong, replayKey, onPick }: BoardProps) {
  const sim = useMemo(() => simulate(round), [round]);
  const d = pathD(sim.points);
  const entryId = slotId(round.entry);
  const exitId = slotId(sim.exit);
  const still = reducedMotion();

  return (
    <svg
      viewBox="0 0 300 300"
      role="group"
      aria-label="Tabuleiro 3 por 3 com círculos de saída ao redor. Toque no círculo onde a bola sai."
    >
      <rect x="50" y="50" width="200" height="200" rx="14" fill="#f9f9f9" stroke="var(--color-memory)" strokeWidth="3" />
      {GRID_LINES.map((p) => (
        <g key={p}>
          <line x1={p} y1="52" x2={p} y2="248" stroke="#d8d8d8" strokeWidth="2" />
          <line x1="52" y1={p} x2="248" y2={p} stroke="#d8d8d8" strokeWidth="2" />
        </g>
      ))}
      <Mirrors mirrors={round.mirrors} color="var(--color-text)" />

      {phase === 'solved' && (
        <path d={d} fill="none" stroke="var(--color-memory)" strokeWidth="4" strokeDasharray="9 8" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {phase === 'watch' && (
        <>
          <path
            key={`trail-${replayKey}`}
            className={still ? undefined : 'trail'}
            style={still ? { strokeDasharray: 'none', strokeDashoffset: 0 } : undefined}
            pathLength={1}
            d={d}
            fill="none"
            stroke="var(--color-memory-mid)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {!still && (
            <circle key={`ball-${replayKey}`} r="9" fill="var(--color-cta)">
              <animateMotion dur="2.4s" fill="freeze" path={d} />
            </circle>
          )}
        </>
      )}

      {ALL_SLOTS.filter((s) => slotId(s) !== entryId).map((slot) => {
        const id = slotId(slot);
        const { x, y } = slotPoint(slot);
        const isCorrect = phase === 'solved' && id === exitId;
        const isWrong = wrong.includes(id);
        const interactive = phase === 'choose' && !isWrong;
        const fill = isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : '#fff';
        const ring = isCorrect ? 'var(--color-success)' : isWrong ? 'var(--color-error)' : '#cecece';
        return (
          <g
            key={id}
            className={`exit-slot${interactive ? '' : ' exit-slot--locked'}`}
            role="button"
            tabIndex={interactive ? 0 : -1}
            aria-label={slotLabel(slot)}
            aria-disabled={!interactive}
            onClick={() => interactive && onPick(slot)}
            onKeyDown={(e) => {
              if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onPick(slot);
              }
            }}
          >
            <circle cx={x} cy={y} r="22" fill="transparent" />
            <circle className="exit-slot__ring" cx={x} cy={y} r={isCorrect ? 16 : 13} fill={fill} stroke={ring} strokeWidth="3" />
            {isCorrect && (
              <path d="M-7 0.5l5 5 9-10" transform={`translate(${x} ${y})`} fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {isWrong && (
              <path d="M-5 -5l10 10M5 -5l-10 10" transform={`translate(${x} ${y})`} fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
            )}
          </g>
        );
      })}
      <EntryArrow slot={round.entry} color="var(--color-memory)" />
    </svg>
  );
}

interface HeroProps {
  round: Round;
  /** Increment to (re)start the animated ball. 0 means static. */
  demoKey: number;
}

/** Illustration for the task sheet (T3.C): white board on the purple banner. */
export function PinballHero({ round, demoKey }: HeroProps) {
  const sim = useMemo(() => simulate(round), [round]);
  const d = pathD(sim.points);
  const exit = slotPoint(sim.exit);
  const still = reducedMotion();
  return (
    <svg
      viewBox="0 0 300 300"
      width="240"
      height="240"
      role="img"
      aria-label="Exemplo: a bola desce pela coluna da esquerda, bate na barra e sai pela direita"
    >
      <rect x="50" y="50" width="200" height="200" rx="14" fill="#fff" />
      {GRID_LINES.map((p) => (
        <g key={p}>
          <line x1={p} y1="56" x2={p} y2="244" stroke="#e9e0fa" strokeWidth="2" />
          <line x1="56" y1={p} x2="244" y2={p} stroke="#e9e0fa" strokeWidth="2" />
        </g>
      ))}
      <EntryArrow slot={{ side: 'top', index: 0 }} color="#fff" />
      <path d={d} fill="none" stroke="#2a1160" strokeWidth="4" strokeDasharray="9 8" strokeLinecap="round" strokeLinejoin="round" />
      <Mirrors mirrors={round.mirrors} color="#2a1160" />
      <circle cx={exit.x + 1} cy={exit.y} r="15" fill="#fff" stroke="var(--color-memory-low)" strokeWidth="5" />
      <text x={exit.x + 1} y={exit.y + 45} textAnchor="middle" fontFamily="Nunito, sans-serif" fontSize="17" fontWeight="900" fill="#fff">
        saída
      </text>
      {demoKey > 0 && !still && (
        <circle key={demoKey} r="10" fill="var(--color-cta)" stroke="#fff" strokeWidth="3">
          <animateMotion dur="4s" fill="freeze" path={d} />
        </circle>
      )}
    </svg>
  );
}
