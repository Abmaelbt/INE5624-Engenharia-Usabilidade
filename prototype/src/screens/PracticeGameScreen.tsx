import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CheckIcon, ChevronRightIcon, CloseIcon } from '../components/Icons';
import PinballBoard, { type Phase } from '../components/PinballBoard';
import BirdsGame, { type GameResult } from '../components/games/BirdsGame';
import SequenceGame from '../components/games/SequenceGame';
import { BIRDS_PRACTICE_ROUNDS } from '../data/birds';
import { ROUNDS, simulate, slotId, type SlotRef } from '../data/fliperamemoria';
import { SEQUENCE_ROUNDS } from '../data/sequence';
import { findTask } from '../data/tasks';
import { useGoBack } from '../utils/useGoBack';
import { track } from '../utils/telemetry';

const WATCH_MS = 2800;

/** T3.D: playable practice for all 3 free catalog games (3 rounds, no timer). */
export default function PracticeGameScreen() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const task = findTask(taskId);
  const goBack = useGoBack(`/tarefa/${taskId ?? ''}`);

  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('watch');
  const [wrong, setWrong] = useState<string[]>([]);
  const [replayKey, setReplayKey] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[roundIdx]!;
  const isPinball = task?.id === 'fliperamemoria';

  useEffect(() => {
    setRoundIdx(0);
    setPhase('watch');
    setWrong([]);
    setReplayKey(0);
    setErrors(0);
    setFinished(false);
  }, [taskId]);

  useEffect(() => {
    if (!isPinball || phase !== 'watch') return;
    const t = window.setTimeout(() => setPhase('choose'), WATCH_MS);
    return () => window.clearTimeout(t);
  }, [isPinball, phase, replayKey]);

  const handleRoundChange = useCallback((idx: number) => {
    setRoundIdx(idx);
  }, []);

  if (!task || task.premium) return <Navigate to="/tarefas" replace />;

  const isLast = roundIdx === ROUNDS.length - 1;

  const replay = () => {
    setReplayKey((k) => k + 1);
    setPhase('watch');
  };

  const onPick = (slot: SlotRef) => {
    if (phase !== 'choose') return;
    const correct = slotId(slot) === slotId(simulate(round).exit);
    track('practice_attempt', { game: 'fliperamemoria', round: round.id, correct, slot: slotId(slot) });
    if (correct) {
      setPhase('solved');
    } else {
      setWrong((w) => [...w, slotId(slot)]);
      setErrors((n) => n + 1);
    }
  };

  const next = () => {
    if (isLast) {
      track('practice_completed', { game: 'fliperamemoria', rounds: ROUNDS.length, errors });
      setFinished(true);
      return;
    }
    setRoundIdx((i) => i + 1);
    setWrong([]);
    setReplayKey((k) => k + 1);
    setPhase('watch');
  };

  const finishExternalGame = (result: GameResult) => {
    track('practice_completed', { game: task.id, rounds: result.total, errors: result.errors });
    setErrors(result.errors);
    setFinished(true);
  };

  if (finished) {
    return (
      <main className="screen screen--full">
        <div className="practice-top">
          <button type="button" className="back-btn" aria-label="Sair da prática" onClick={goBack}>
            <CloseIcon size={20} stroke={2.6} />
          </button>
        </div>
        <section className="card finish-card" role="status">
          <div className="complete-check">
            <CheckIcon size={56} color="var(--color-success)" stroke={2.6} />
          </div>
          <h1 className="h1">Prática concluída!</h1>
          <p className="muted" style={{ fontSize: 16 }}>
            3 de 3 rodadas · Sem pressão de tempo
          </p>
          <p className="muted" style={{ fontSize: 14 }}>
            {errors === 0 ? 'Você acertou todas de primeira.' : `Você tentou de novo ${errors} ${errors === 1 ? 'vez' : 'vezes'}, e tudo bem.`}
          </p>
        </section>
        <div className="grow" />
        <div className="stack-12">
          <button type="button" className="btn btn--primary" onClick={() => navigate('/progresso')}>
            Ver meu progresso
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => navigate(`/tarefas?area=${task.area}`)}>
            Voltar para Tarefas
          </button>
        </div>
      </main>
    );
  }

  const lastWrong = wrong.length > 0 && phase === 'choose';
  const pillClass = task.area === 'atencao' ? 'pill pill--attention' : 'pill pill--memory';

  return (
    <main className="screen screen--full" style={{ paddingTop: 48, gap: 14 }}>
      <div className="practice-top">
        <button type="button" className="back-btn" aria-label="Sair da prática" onClick={goBack}>
          <CloseIcon size={20} stroke={2.6} />
        </button>
        <span className={pillClass} style={{ padding: '7px 14px' }}>PRÁTICA · sem tempo</span>
        <span style={{ fontSize: 15, fontWeight: 800 }}>Rodada {roundIdx + 1} de 3</span>
      </div>

      <div className="practice-progress" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={i <= roundIdx ? 'is-on' : undefined}
            style={i <= roundIdx && task.area === 'atencao' ? { background: 'var(--color-attention)' } : undefined}
          />
        ))}
      </div>

      <div className="stack-8" style={{ gap: 4, marginTop: 4 }}>
        <h1 className="h1" style={{ fontSize: 24 }}>{task.name}</h1>
        {isPinball && (
          <p style={{ fontSize: 16, lineHeight: 1.4 }}>Veja por onde a bola passa e toque no círculo onde ela sai.</p>
        )}
      </div>

      {isPinball ? (
        <>
          <div className="board-card">
            <PinballBoard round={round} phase={phase} wrong={wrong} replayKey={replayKey} onPick={onPick} />
          </div>

          <div className="feedback-wrap" role="status" aria-live="polite">
            {phase === 'solved' ? (
              <div className="feedback feedback--ok">
                <span className="feedback__icon"><CheckIcon size={20} color="#fff" stroke={3} /></span>
                <span>
                  <span className="feedback__title">Isso! A bola saiu aí.</span>
                  <span className="feedback__text">{round.explanation}</span>
                </span>
              </div>
            ) : lastWrong ? (
              <div className="feedback feedback--error">
                <span className="feedback__icon"><CloseIcon size={18} color="#fff" stroke={3} /></span>
                <span>
                  <span className="feedback__title">Ainda não.</span>
                  <span className="feedback__text">{round.wrongHint}</span>
                </span>
                <button type="button" className="replay-btn" onClick={replay}>Ver de novo</button>
              </div>
            ) : (
              <div className="feedback feedback--idle">
                <span style={{ fontSize: 15, fontWeight: 800 }}>
                  {phase === 'watch' ? 'Observe a bola...' : 'Agora toque no círculo de saída.'}
                </span>
                {phase === 'choose' && <button type="button" className="replay-btn" onClick={replay}>Ver de novo</button>}
              </div>
            )}
          </div>

          <div className="grow" />

          <button type="button" className="btn btn--primary" disabled={phase !== 'solved'} style={phase !== 'solved' ? { opacity: 0.45, boxShadow: 'none' } : undefined} onClick={next}>
            {isLast ? 'Concluir prática' : 'Próxima rodada'}
            <ChevronRightIcon size={20} color="#fff" stroke={2.8} />
          </button>
        </>
      ) : task.id === 'passaros-perdidos' ? (
        <BirdsGame
          mode="practice"
          rounds={BIRDS_PRACTICE_ROUNDS}
          onRoundChange={handleRoundChange}
          onComplete={finishExternalGame}
        />
      ) : (
        <SequenceGame
          theme="culinaria"
          mode="practice"
          rounds={SEQUENCE_ROUNDS.culinaria.practice}
          onRoundChange={handleRoundChange}
          onComplete={finishExternalGame}
        />
      )}
    </main>
  );
}
