import { useEffect, useRef, useState } from 'react';
import { SHAPE_META, type CardShape, type DetectiveRound } from '../../data/detective';
import { track } from '../../utils/telemetry';
import { CheckIcon, ChevronRightIcon, CloseIcon } from '../Icons';
import type { GameResult } from './BirdsGame';

interface Props {
  mode: 'practice' | 'play';
  rounds: DetectiveRound[];
  ctaFinishLabel?: string;
  onRoundChange?: (index: number, total: number) => void;
  onComplete: (result: GameResult) => void;
}

function ShapeSvg({ shape, size = 64 }: { shape: CardShape; size?: number }) {
  const { color } = SHAPE_META[shape];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {shape === 'circle' && <circle cx="32" cy="32" r="22" fill={color} />}
      {shape === 'triangle' && <path d="M32 8 L56 52 H8 Z" fill={color} strokeLinejoin="round" />}
      {shape === 'square' && <rect x="11" y="11" width="42" height="42" rx="8" fill={color} />}
      {shape === 'diamond' && <path d="M32 6 L58 32 L32 58 L6 32 Z" fill={color} strokeLinejoin="round" />}
    </svg>
  );
}

/** Playable Detetive (speed/working-memory card comparison) for T1. */
export default function DetectiveGame({
  mode,
  rounds,
  ctaFinishLabel = 'Começar valendo',
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

  useEffect(() => {
    onRoundChange?.(idx, rounds.length);
  }, [idx, rounds.length, onRoundChange]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const answer = (same: boolean) => {
    if (status === 'ok' && mode === 'practice') return;
    if (timerRef.current !== null) return;
    setMisclick(false);

    const correct = same === round.same;
    track('practice_attempt', { game: 'detetive', mode, round: round.id, correct, answer: same ? 'sim' : 'nao' });

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
      if (isLast) {
        onComplete({ hits: nextHits, total: rounds.length, errors: nextErrors });
        return;
      }
      setIdx((i) => i + 1);
      setStatus('idle');
      setMisclick(false);
    }, 550);
  };

  const onCardTap = () => {
    if (status === 'ok' && mode === 'practice') return;
    setMisclick(true);
    track('stimulus_misclick', { game: 'detetive', mode, round: round.id });
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
      <div className="detective-stage">
        <div className="detective-prev" aria-label={`Carta anterior: ${SHAPE_META[round.previous].label}`}>
          <span className="eyebrow">CARTA ANTERIOR</span>
          <div className="detective-prev__chip" style={{ background: SHAPE_META[round.previous].bg }}>
            <ShapeSvg shape={round.previous} size={36} />
          </div>
        </div>

        <div
          className="card detective-current game-stimulus"
          onClick={onCardTap}
          role="img"
          aria-label={`Carta atual: ${SHAPE_META[round.current].label}`}
        >
          <span className="eyebrow">CARTA ATUAL</span>
          <div className="detective-current__box" style={{ background: SHAPE_META[round.current].bg }}>
            <ShapeSvg shape={round.current} size={86} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-muted)' }}>
            Esta carta é igual à anterior?
          </span>
        </div>
      </div>

      <div className="feedback-wrap" role="status" aria-live="polite">
        {misclick ? (
          <div className="feedback feedback--warn">
            <span>
              <span className="feedback__title">Não toque na carta</span>
              <span className="feedback__text">Use os botões NÃO ou SIM abaixo para responder.</span>
            </span>
          </div>
        ) : status === 'ok' ? (
          <div className="feedback feedback--ok">
            <span className="feedback__icon"><CheckIcon size={20} color="#fff" stroke={3} /></span>
            <span>
              <span className="feedback__title">Isso!</span>
              <span className="feedback__text">
                {round.same ? 'As duas cartas têm o mesmo símbolo.' : 'Os símbolos são diferentes.'}
              </span>
            </span>
          </div>
        ) : status === 'wrong' ? (
          <div className="feedback feedback--error">
            <span className="feedback__icon"><CloseIcon size={18} color="#fff" stroke={3} /></span>
            <span>
              <span className="feedback__title">{mode === 'practice' ? 'Quase!' : 'Ops!'}</span>
              <span className="feedback__text">
                {round.same
                  ? 'Veja a carta anterior em cima: ela é igual à carta atual.'
                  : 'Compare com a carta anterior em cima: os símbolos são diferentes.'}
              </span>
            </span>
          </div>
        ) : (
          <div className="feedback feedback--idle">
            <span style={{ fontSize: 15, fontWeight: 800 }}>Toque em Não ou Sim abaixo.</span>
          </div>
        )}
      </div>

      <div className="yesno-row" role="group" aria-label="Responder comparação">
        <button
          type="button"
          className="yesno-btn yesno-btn--no"
          disabled={mode === 'practice' && status === 'ok'}
          onClick={() => answer(false)}
        >
          <CloseIcon size={20} stroke={2.8} />
          Não
        </button>
        <button
          type="button"
          className="yesno-btn yesno-btn--yes"
          disabled={mode === 'practice' && status === 'ok'}
          onClick={() => answer(true)}
        >
          <CheckIcon size={20} stroke={3} />
          Sim
        </button>
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

/** Hero card illustration for T1.B (Detetive). */
export function DetectiveHero() {
  return (
    <svg viewBox="0 0 280 180" width="248" height="160" role="img" aria-label="Duas cartas com símbolos para comparar se são iguais">
      <rect x="44" y="34" width="84" height="112" rx="14" fill="rgba(255,255,255,0.28)" stroke="#fff" strokeWidth="3" />
      <circle cx="86" cy="90" r="22" fill="#fff" />
      <rect x="152" y="34" width="84" height="112" rx="14" fill="#fff" />
      <circle cx="194" cy="90" r="22" fill="var(--color-memory)" />
      <text x="140" y="97" textAnchor="middle" fontFamily="Nunito, sans-serif" fontSize="22" fontWeight="900" fill="#fff">=</text>
    </svg>
  );
}
