import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { CheckIcon, ChevronRightIcon, CloseIcon, PlayIcon } from '../components/Icons';
import BirdsGame, { BirdsHero, type GameResult } from '../components/games/BirdsGame';
import DetectiveGame, { DetectiveHero } from '../components/games/DetectiveGame';
import SequenceGame, { SequenceHero } from '../components/games/SequenceGame';
import { BIRDS_PLAY_ROUNDS, BIRDS_PRACTICE_ROUNDS } from '../data/birds';
import { DETECTIVE_PLAY_ROUNDS, DETECTIVE_PRACTICE_ROUNDS } from '../data/detective';
import { SEQUENCE_ROUNDS } from '../data/sequence';
import { AREA_COLOR } from '../data/tasks';
import { track } from '../utils/telemetry';
import { useGoBack } from '../utils/useGoBack';
import { DAILY_STEPS, completeWorkoutStep, type DailyStep } from '../utils/workoutStore';

type Stage = 'intro' | 'practice' | 'play' | 'step-done';

function StepHero({ id }: { id: DailyStep['id'] }) {
  if (id === 'detetive') return <DetectiveHero />;
  if (id === 'cafe') return <SequenceHero theme="cafe" />;
  return <BirdsHero />;
}

/** T1.B / T1.C / T1.D: daily 3-step workout runner. */
export default function DailyWorkoutScreen() {
  const { step: stepParam } = useParams();
  const navigate = useNavigate();
  const goHome = useGoBack('/');

  const stepNum = Number(stepParam);
  const stepInfo = DAILY_STEPS.find((d) => d.step === stepNum);

  const [stage, setStage] = useState<Stage>('intro');
  const [roundProgress, setRoundProgress] = useState({ idx: 0, total: 1 });
  const [lastResult, setLastResult] = useState<GameResult | null>(null);

  useEffect(() => {
    setStage('intro');
    setRoundProgress({ idx: 0, total: 1 });
    setLastResult(null);
  }, [stepNum]);

  useEffect(() => {
    if (stepNum === 1) {
      track('workout_started');
    }
  }, [stepNum]);

  const handleRoundChange = useCallback((idx: number, total: number) => {
    setRoundProgress({ idx, total });
  }, []);

  if (!stepInfo) return <Navigate to="/" replace />;

  const nextStep = DAILY_STEPS.find((d) => d.step === stepInfo.step + 1);
  const color = AREA_COLOR[stepInfo.area];

  const handlePracticeDone = () => {
    setStage('play');
  };

  const handlePlayComplete = (result: GameResult) => {
    completeWorkoutStep(stepInfo.id, result);
    track('workout_step_completed', {
      step: stepInfo.step,
      id: stepInfo.id,
      hits: result.hits,
      total: result.total,
      errors: result.errors,
    });
    if (stepInfo.step === 3) {
      track('workout_completed');
      navigate('/treino-concluido', { replace: true });
      return;
    }
    setLastResult(result);
    setStage('step-done');
  };

  if (stage === 'step-done' && lastResult) {
    return (
      <main className="screen screen--full" style={{ paddingTop: 48 }}>
        <div className="practice-top">
          <button type="button" className="back-btn" aria-label="Voltar ao início" onClick={() => navigate('/')}>
            <CloseIcon size={20} stroke={2.6} />
          </button>
          <span className="pill pill--success" style={{ padding: '7px 14px' }}>
            TREINO · {stepInfo.step} de 3 concluído
          </span>
          <span style={{ width: 44 }} aria-hidden="true" />
        </div>

        <div className="practice-progress" aria-hidden="true">
          {DAILY_STEPS.map((d) => (
            <div key={d.id} className={d.step <= stepInfo.step ? 'is-on' : undefined} style={d.step <= stepInfo.step ? { background: 'var(--color-success)' } : undefined} />
          ))}
        </div>

        <section className="card finish-card" role="status" style={{ marginTop: 12 }}>
          <div className="complete-check">
            <CheckIcon size={56} color="var(--color-success)" stroke={2.6} />
          </div>
          <h1 className="h1">{stepInfo.fullName} concluído!</h1>
          <p style={{ fontSize: 17, fontWeight: 800 }}>
            {lastResult.hits} de {lastResult.total} acertos
          </p>
          <p className="muted" style={{ fontSize: 15 }}>
            Falta {3 - stepInfo.step === 1 ? 'só 1 tarefa' : `apenas ${3 - stepInfo.step} tarefas`} para terminar o treino de hoje.
          </p>
        </section>

        <div className="grow" />

        <div className="stack-12">
          {nextStep && (
            <button type="button" className="btn btn--primary" onClick={() => navigate(`/treino/${nextStep.step}`)}>
              Próxima: {nextStep.fullName}
              <ChevronRightIcon size={20} color="#fff" stroke={2.8} />
            </button>
          )}
          <button type="button" className="btn btn--secondary" onClick={() => navigate('/')}>
            Voltar ao início
          </button>
        </div>
      </main>
    );
  }

  if (stage === 'intro') {
    return (
      <main className="screen screen--full" style={{ paddingTop: 48 }}>
        <div className="practice-top">
          <button type="button" className="back-btn" aria-label="Sair do treino" onClick={goHome}>
            <CloseIcon size={20} stroke={2.6} />
          </button>
          <span className="pill pill--memory" style={{ padding: '7px 14px' }}>
            TREINO · {stepInfo.step} de 3
          </span>
          <span style={{ width: 44 }} aria-hidden="true" />
        </div>

        <div className="practice-progress" aria-hidden="true">
          {DAILY_STEPS.map((d) => (
            <div key={d.id} className={d.step <= stepInfo.step ? 'is-on' : undefined} />
          ))}
        </div>

        <div className="hero" style={{ ['--hero-color' as string]: color, height: 220 }}>
          <StepHero id={stepInfo.id} />
        </div>

        <div className="stack-10">
          <h1 className="h1">{stepInfo.fullName}</h1>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className={stepInfo.area === 'atencao' ? 'pill pill--attention' : 'pill pill--memory'}>
              {stepInfo.areaLabel}
            </span>
            <span className="pill pill--success">Grátis</span>
            <span className="pill pill--outline">{stepInfo.duration}</span>
          </div>
        </div>

        <section className="steps" aria-label="Como jogar">
          <h2 style={{ fontSize: 18, fontWeight: 900 }}>Como funciona</h2>
          {stepInfo.steps.map((text, i) => (
            <div key={text} className="step">
              <span className="step__num">{i + 1}</span>
              <span>{text}</span>
            </div>
          ))}
        </section>

        <div className="grow" />

        <div className="stack-12">
          <button type="button" className="btn btn--primary" onClick={() => setStage('practice')}>
            <PlayIcon size={14} color="#fff" />
            Praticar sem tempo
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => setStage('play')}>
            Já sei jogar · Começar valendo
          </button>
        </div>
      </main>
    );
  }

  const isPractice = stage === 'practice';
  const mode = isPractice ? 'practice' : 'play';

  return (
    <main className="screen screen--full" style={{ paddingTop: 48, gap: 14 }}>
      <div className="practice-top">
        <button type="button" className="back-btn" aria-label="Sair do treino" onClick={goHome}>
          <CloseIcon size={20} stroke={2.6} />
        </button>
        <span className={isPractice ? 'pill pill--memory' : 'pill pill--attention'} style={{ padding: '7px 14px' }}>
          {isPractice ? 'PRÁTICA · sem tempo' : `TREINO · ${stepInfo.step} de 3`}
        </span>
        <span style={{ fontSize: 15, fontWeight: 800 }}>
          Rodada {roundProgress.idx + 1} de {roundProgress.total}
        </span>
      </div>

      <div className="practice-progress" aria-hidden="true">
        {DAILY_STEPS.map((d) => (
          <div key={d.id} className={d.step <= stepInfo.step ? 'is-on' : undefined} />
        ))}
      </div>

      <h1 className="h1" style={{ fontSize: 24 }}>{stepInfo.fullName}</h1>

      {stepInfo.id === 'detetive' && (
        <DetectiveGame
          key={`det-${mode}`}
          mode={mode}
          rounds={isPractice ? DETECTIVE_PRACTICE_ROUNDS : DETECTIVE_PLAY_ROUNDS}
          ctaFinishLabel="Começar valendo"
          onRoundChange={handleRoundChange}
          onComplete={isPractice ? handlePracticeDone : handlePlayComplete}
        />
      )}

      {stepInfo.id === 'cafe' && (
        <SequenceGame
          key={`cafe-${mode}`}
          theme="cafe"
          mode={mode}
          rounds={isPractice ? SEQUENCE_ROUNDS.cafe.practice.slice(0, 2) : SEQUENCE_ROUNDS.cafe.play}
          ctaFinishLabel="Começar valendo"
          onRoundChange={handleRoundChange}
          onComplete={isPractice ? handlePracticeDone : handlePlayComplete}
        />
      )}

      {stepInfo.id === 'passaros-perdidos' && (
        <BirdsGame
          key={`birds-${mode}`}
          mode={mode}
          rounds={isPractice ? BIRDS_PRACTICE_ROUNDS.slice(0, 2) : BIRDS_PLAY_ROUNDS}
          ctaFinishLabel="Começar valendo"
          onRoundChange={handleRoundChange}
          onComplete={isPractice ? handlePracticeDone : handlePlayComplete}
        />
      )}
    </main>
  );
}
