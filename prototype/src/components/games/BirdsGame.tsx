import { useEffect, useRef, useState } from 'react';
import {
  DIR_LABEL,
  DIR_ROTATION,
  FORMATIONS,
  type BirdsRound,
  type Direction,
} from '../../data/birds';
import { track } from '../../utils/telemetry';
import { CheckIcon, ChevronRightIcon, CloseIcon } from '../Icons';

export interface GameResult {
  hits: number;
  total: number;
  errors: number;
}

interface Props {
  mode: 'practice' | 'play';
  rounds: BirdsRound[];
  ctaFinishLabel?: string;
  onRoundChange?: (index: number, total: number) => void;
  onComplete: (result: GameResult) => void;
}

function BirdGlyph({
  x,
  y,
  dir,
  color,
  highlight = false,
}: {
  x: number;
  y: number;
  dir: Direction;
  color: string;
  highlight?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {highlight && (
        <circle r="24" fill="var(--color-attention-soft)" stroke="var(--color-attention)" strokeWidth="2.5" strokeDasharray="4 3" />
      )}
      <g transform={`rotate(${DIR_ROTATION[dir]})`}>
        {/* Stylized directional bird matching Lost in Migration / Figma attention arrow */}
        <path
          d="M0 -17 L13 4 L5 4 L5 15 L-5 15 L-5 4 L-13 4 Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

const DIRS: { dir: Direction; symbol: string; area: string }[] = [
  { dir: 'up', symbol: '↑', area: 'up' },
  { dir: 'left', symbol: '←', area: 'left' },
  { dir: 'down', symbol: '↓', area: 'down' },
  { dir: 'right', symbol: '→', area: 'right' },
];

/** Playable Pássaros Perdidos (Lost in Migration) component for T1 and T3. */
export default function BirdsGame({
  mode,
  rounds,
  ctaFinishLabel = 'Concluir prática',
  onRoundChange,
  onComplete,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<'idle' | 'ok' | 'wrong'>('idle');
  const [misclick, setMisclick] = useState(false);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const timerRef = useRef<number | null>(null);

  const round = rounds[idx]!;
  const isLast = idx === rounds.length - 1;
  const coords = FORMATIONS[round.formation];

  useEffect(() => {
    onRoundChange?.(idx, rounds.length);
  }, [idx, rounds.length, onRoundChange]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const advancePlay = (nextHits: number, nextErrors: number) => {
    if (isLast) {
      onComplete({ hits: nextHits, total: rounds.length, errors: nextErrors });
      return;
    }
    setIdx((i) => i + 1);
    setStatus('idle');
    setMisclick(false);
  };

  const pick = (dir: Direction) => {
    if (status === 'ok' && mode === 'practice') return;
    if (timerRef.current !== null) return;
    setMisclick(false);

    const correct = dir === round.center;
    track('practice_attempt', { game: 'passaros-perdidos', mode, round: round.id, correct, dir });

    if (mode === 'practice') {
      if (correct) {
        setHits((h) => h + 1);
        setStatus('ok');
      } else {
        setErrors((e) => e + 1);
        setStatus('wrong');
      }
      return;
    }

    const nextHits = correct ? hits + 1 : hits;
    const nextErrors = correct ? errors : errors + 1;
    setHits(nextHits);
    setErrors(nextErrors);
    setStatus(correct ? 'ok' : 'wrong');
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      advancePlay(nextHits, nextErrors);
    }, 550);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        pick(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleStimulusTap = () => {
    if (status === 'ok' && mode === 'practice') return;
    setMisclick(true);
    track('stimulus_misclick', { game: 'passaros-perdidos', mode, round: round.id });
  };

  const nextPractice = () => {
    if (isLast) {
      onComplete({ hits: rounds.length, total: rounds.length, errors });
      return;
    }
    setIdx((i) => i + 1);
    setStatus('idle');
    setMisclick(false);
  };

  return (
    <div className="stack-12 grow">
      <div
        className="board-card game-stimulus"
        onClick={handleStimulusTap}
        role="img"
        aria-label={`5 pássaros na tela; pássaro central aponta para ${DIR_LABEL[round.center]}`}
      >
        <svg viewBox="0 0 280 180" style={{ width: '100%', maxWidth: 280, height: 'auto', aspectRatio: '14/9' }}>
          {coords.map(([x, y], i) => {
            const isCenter = i === 2;
            const dir = isCenter ? round.center : round.flankers;
            return (
              <BirdGlyph
                key={i}
                x={x}
                y={y}
                dir={dir}
                color={isCenter ? 'var(--color-attention)' : '#2d3748'}
                highlight={isCenter && mode === 'practice'}
              />
            );
          })}
        </svg>
      </div>

      <div className="feedback-wrap" role="status" aria-live="polite">
        {misclick ? (
          <div className="feedback feedback--warn">
            <span>
              <span className="feedback__title">Use os botões abaixo</span>
              <span className="feedback__text">Toque em uma das 4 setas embaixo para responder.</span>
            </span>
          </div>
        ) : status === 'ok' ? (
          <div className="feedback feedback--ok">
            <span className="feedback__icon"><CheckIcon size={20} color="#fff" stroke={3} /></span>
            <span>
              <span className="feedback__title">Isso!</span>
              <span className="feedback__text">O pássaro do meio aponta para {DIR_LABEL[round.center]}.</span>
            </span>
          </div>
        ) : status === 'wrong' ? (
          <div className="feedback feedback--error">
            <span className="feedback__icon"><CloseIcon size={18} color="#fff" stroke={3} /></span>
            <span>
              <span className="feedback__title">{mode === 'practice' ? 'Quase!' : 'Ops!'}</span>
              <span className="feedback__text">
                {mode === 'practice'
                  ? `Olhe só para o pássaro do meio: ele aponta para ${DIR_LABEL[round.center]}. Tente de novo.`
                  : `O pássaro do meio apontava para ${DIR_LABEL[round.center]}.`}
              </span>
            </span>
          </div>
        ) : (
          <div className="feedback feedback--idle" style={{ background: 'var(--color-attention-soft)', color: 'var(--color-attention)' }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>
              Para onde o pássaro do meio aponta?
            </span>
          </div>
        )}
      </div>

      <div className="dpad" role="group" aria-label="Direção do pássaro do meio">
        {DIRS.map((d) => (
          <button
            key={d.dir}
            type="button"
            className="dpad__btn"
            style={{ gridArea: d.area }}
            aria-label={`Para ${DIR_LABEL[d.dir]}`}
            disabled={mode === 'practice' && status === 'ok'}
            onClick={() => pick(d.dir)}
          >
            {d.symbol}
          </button>
        ))}
      </div>

      <div className="grow" />

      {mode === 'practice' && (
        <button
          type="button"
          className="btn btn--primary"
          disabled={status !== 'ok'}
          style={status !== 'ok' ? { opacity: 0.45, boxShadow: 'none' } : undefined}
          onClick={nextPractice}
        >
          {isLast ? ctaFinishLabel : 'Próxima rodada'}
          <ChevronRightIcon size={20} color="#fff" stroke={2.8} />
        </button>
      )}
    </div>
  );
}

/** Static SVG illustration for T3.C and T1.B. */
export function BirdsHero() {
  const coords = FORMATIONS.v;
  return (
    <svg viewBox="0 0 280 180" width="248" height="160" role="img" aria-label="Cinco pássaros em V; o pássaro do meio aponta para cima">
      {coords.map(([x, y], i) => (
        <BirdGlyph
          key={i}
          x={x}
          y={y}
          dir={i === 2 ? 'up' : 'right'}
          color="#fff"
          highlight={false}
        />
      ))}
      <circle cx="140" cy="90" r="26" fill="none" stroke="#fff" strokeWidth="3" strokeDasharray="5 4" />
    </svg>
  );
}
