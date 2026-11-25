import { useEffect, useRef, useState } from 'react';
import {
  SEQUENCE_ROUNDS,
  THEME_ITEMS,
  findSequenceItem,
  type SequenceItemId,
  type SequenceRound,
  type SequenceTheme,
} from '../../data/sequence';
import { track } from '../../utils/telemetry';
import { CheckIcon, ChevronRightIcon, CloseIcon } from '../Icons';
import type { GameResult } from './BirdsGame';

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function ItemGlyph({ id, color, size = 28 }: { id: SequenceItemId; color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {id === 'cafe' && (
        <>
          <path d="M4 10h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
          <path d="M16 11h2a2.5 2.5 0 0 1 0 5h-2M8 4v3M12 4v3" />
        </>
      )}
      {id === 'bolo' && (
        <>
          <path d="M4 12h16v7H4zM4 15.5h16" />
          <path d="M7 12c0-2 2-3 5-3s5 1 5 3" />
          <circle cx="12" cy="6" r="1.5" fill={color} />
        </>
      )}
      {id === 'suco' && (
        <>
          <path d="M7 8h10l-1.2 12H8.2z" />
          <path d="M12 8l3-5h3" />
        </>
      )}
      {(id === 'pao' || id === 'pao-cul') && (
        <>
          <path d="M4 14c0-4 3.5-7 8-7s8 3 8 7v3H4z" />
          <path d="M9 10l2 3M13 10l2 3" />
        </>
      )}
      {id === 'tomate' && (
        <>
          <circle cx="12" cy="13" r="7" />
          <path d="M12 6c-1-2-3-2-4-1M12 6c1-2 3-2 4-1" />
        </>
      )}
      {id === 'queijo' && (
        <>
          <path d="M4 17L12 6l8 11z" />
          <circle cx="11" cy="13.5" r="1.2" fill={color} />
          <circle cx="14.5" cy="15" r="1" fill={color} />
        </>
      )}
      {id === 'folha' && (
        <>
          <path d="M5 19C5 10 11 5 19 5c0 8-5 14-14 14z" />
          <path d="M5 19l9-9" />
        </>
      )}
    </svg>
  );
}

interface Props {
  theme: SequenceTheme;
  mode: 'practice' | 'play';
  rounds: SequenceRound[];
  ctaFinishLabel?: string;
  onRoundChange?: (index: number, total: number) => void;
  onComplete: (result: GameResult) => void;
}

const WATCH_MS = 2300;

/** Playable order-memory game: powers both Café (T1) and Culinária (T3). */
export default function SequenceGame({
  theme,
  mode,
  rounds,
  ctaFinishLabel = 'Concluir prática',
  onRoundChange,
  onComplete,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'watch' | 'choose' | 'solved' | 'wrong'>('watch');
  const [picks, setPicks] = useState<SequenceItemId[]>([]);
  const [misclick, setMisclick] = useState(false);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);
  const [replayKey, setReplayKey] = useState(0);
  const timerRef = useRef<number | null>(null);

  const items = THEME_ITEMS[theme];
  const round = rounds[idx]!;
  const isLast = idx === rounds.length - 1;
  const gameId = theme === 'cafe' ? 'cafe' : 'culinaria';

  useEffect(() => {
    onRoundChange?.(idx, rounds.length);
  }, [idx, rounds.length, onRoundChange]);

  useEffect(() => {
    if (phase !== 'watch') return;
    const ms = reducedMotion() ? 1800 : WATCH_MS;
    const t = window.setTimeout(() => setPhase('choose'), ms);
    return () => window.clearTimeout(t);
  }, [phase, replayKey]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const replay = () => {
    setPicks([]);
    setMisclick(false);
    setReplayKey((k) => k + 1);
    setPhase('watch');
  };

  const advancePlay = (nextHits: number, nextErrors: number) => {
    if (isLast) {
      onComplete({ hits: nextHits, total: rounds.length, errors: nextErrors });
      return;
    }
    setIdx((i) => i + 1);
    setPicks([]);
    setMisclick(false);
    setReplayKey((k) => k + 1);
    setPhase('watch');
  };

  const pickItem = (id: SequenceItemId) => {
    if (phase !== 'choose' && phase !== 'wrong') return;
    if (timerRef.current !== null) return;
    setMisclick(false);

    const nextPicks = [...picks, id];
    const stepIdx = nextPicks.length - 1;
    const stepOk = round.target[stepIdx] === id;

    if (!stepOk) {
      track('practice_attempt', { game: gameId, mode, round: round.id, correct: false, picked: id });
      const nextErrors = errors + 1;
      setErrors(nextErrors);
      if (mode === 'practice') {
        setPicks([]);
        setPhase('wrong');
        return;
      }
      setPicks(nextPicks);
      setPhase('wrong');
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        advancePlay(hits, nextErrors);
      }, 650);
      return;
    }

    setPicks(nextPicks);
    if (nextPicks.length === round.target.length) {
      track('practice_attempt', { game: gameId, mode, round: round.id, correct: true });
      const nextHits = hits + 1;
      setHits(nextHits);
      setPhase('solved');
      if (mode === 'play') {
        timerRef.current = window.setTimeout(() => {
          timerRef.current = null;
          advancePlay(nextHits, errors);
        }, 550);
      }
    } else if (phase === 'wrong') {
      setPhase('choose');
    }
  };

  const onBoardTap = () => {
    if (phase !== 'choose' && phase !== 'wrong') return;
    setMisclick(true);
    track('stimulus_misclick', { game: gameId, mode, round: round.id });
  };

  const nextPractice = () => {
    if (isLast) {
      onComplete({ hits: rounds.length, total: rounds.length, errors });
      return;
    }
    setIdx((i) => i + 1);
    setPicks([]);
    setMisclick(false);
    setReplayKey((k) => k + 1);
    setPhase('watch');
  };

  return (
    <div className="stack-12 grow">
      <div className="card stack-12 game-stimulus" style={{ padding: 16 }} onClick={onBoardTap}>
        <div className="row row--between">
          <span className="eyebrow">
            {phase === 'watch'
              ? theme === 'cafe'
                ? 'MEMORIZE O PEDIDO'
                : 'MEMORIZE A RECEITA'
              : 'SUA VEZ NA MESMA ORDEM'}
          </span>
          {phase !== 'watch' && (
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-memory)' }}>
              {picks.length} de {round.target.length}
            </span>
          )}
        </div>

        <div className="seq-slots" style={{ gridTemplateColumns: `repeat(${round.target.length}, minmax(0, 1fr))` }}>
          {round.target.map((targetId, i) => {
            const shownId = phase === 'watch' ? targetId : picks[i];
            const item = shownId ? findSequenceItem(theme, shownId) : null;
            return (
              <div
                key={i}
                className={`seq-slot${item ? ' is-filled' : ''}`}
                style={item ? { background: item.bg, borderColor: item.color } : undefined}
              >
                <span className="seq-slot__num">{i + 1}</span>
                {item ? (
                  <>
                    <ItemGlyph id={item.id} color={item.color} size={30} />
                    <span className="seq-slot__label">{item.label}</span>
                  </>
                ) : (
                  <span className="seq-slot__empty">?</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="feedback-wrap" role="status" aria-live="polite">
        {misclick ? (
          <div className="feedback feedback--warn">
            <span>
              <span className="feedback__title">Toque nos botões abaixo</span>
              <span className="feedback__text">Escolha os itens embaixo na mesma ordem.</span>
            </span>
          </div>
        ) : phase === 'solved' ? (
          <div className="feedback feedback--ok">
            <span className="feedback__icon"><CheckIcon size={20} color="#fff" stroke={3} /></span>
            <span>
              <span className="feedback__title">Isso! Ordem certinha.</span>
              <span className="feedback__text">
                {round.target.map((id) => findSequenceItem(theme, id).label).join(' → ')}.
              </span>
            </span>
          </div>
        ) : phase === 'wrong' ? (
          <div className="feedback feedback--error">
            <span className="feedback__icon"><CloseIcon size={18} color="#fff" stroke={3} /></span>
            <span>
              <span className="feedback__title">{mode === 'practice' ? 'Quase!' : 'Ops!'}</span>
              <span className="feedback__text">
                {mode === 'practice'
                  ? 'A ordem mudou. Toque em Ver de novo ou tente outra vez.'
                  : 'Ordem diferente da pedida.'}
              </span>
            </span>
            {mode === 'practice' && (
              <button type="button" className="replay-btn" onClick={replay}>Ver de novo</button>
            )}
          </div>
        ) : (
          <div className="feedback feedback--idle">
            <span style={{ fontSize: 15, fontWeight: 800 }}>
              {phase === 'watch'
                ? 'Guarde a ordem dos itens...'
                : `Toque no ${picks.length + 1}º item abaixo.`}
            </span>
            {phase === 'choose' && mode === 'practice' && (
              <button type="button" className="replay-btn" onClick={replay}>Ver de novo</button>
            )}
          </div>
        )}
      </div>

      <div className="seq-grid" role="group" aria-label="Itens para montar a sequência">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="seq-choice"
            disabled={phase === 'watch' || phase === 'solved'}
            onClick={() => pickItem(item.id)}
          >
            <span className="seq-choice__icon" style={{ background: item.bg }}>
              <ItemGlyph id={item.id} color={item.color} size={24} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grow" />

      {mode === 'practice' && (
        <button
          type="button"
          className="btn btn--primary"
          disabled={phase !== 'solved'}
          style={phase !== 'solved' ? { opacity: 0.45, boxShadow: 'none' } : undefined}
          onClick={nextPractice}
        >
          {isLast ? ctaFinishLabel : 'Próxima rodada'}
          <ChevronRightIcon size={20} color="#fff" stroke={2.8} />
        </button>
      )}
    </div>
  );
}

/** Hero SVG illustration for Culinária (T3.C) and Café (T1.B). */
export function SequenceHero({ theme }: { theme: SequenceTheme }) {
  const sample = SEQUENCE_ROUNDS[theme].practice[0]!.target.map((id) => findSequenceItem(theme, id));
  return (
    <div className="seq-hero" role="img" aria-label={`Exemplo de sequência: ${sample.map((s) => s.label).join(' depois ')}`}>
      {sample.map((item, i) => (
        <div key={item.id} className="row" style={{ gap: 10 }}>
          <div className="seq-hero__card">
            <span className="seq-hero__badge">{i + 1}</span>
            <ItemGlyph id={item.id} color="var(--color-memory)" size={36} />
            <span style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-text)' }}>{item.label}</span>
          </div>
          {i < sample.length - 1 && <span style={{ color: '#fff', fontSize: 22, fontWeight: 900 }}>→</span>}
        </div>
      ))}
    </div>
  );
}
