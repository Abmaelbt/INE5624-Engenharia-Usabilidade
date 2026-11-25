import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeftIcon, PlayCircleIcon, PlayIcon } from '../components/Icons';
import { PinballHero } from '../components/PinballBoard';
import { BirdsHero } from '../components/games/BirdsGame';
import { SequenceHero } from '../components/games/SequenceGame';
import { ROUNDS } from '../data/fliperamemoria';
import { AREA_COLOR, findTask } from '../data/tasks';
import { useGoBack } from '../utils/useGoBack';

const DEMO_CAPTIONS = ['1. A bola entra por cima.', '2. Ela bate na barra e vira.', '3. Ela sai pelo círculo da direita.'];
const DEMO_STEP_MS = 1400;

/** T3.C: task detail sheet with an inline "how to practice" demo. */
export default function TaskDetailScreen() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const task = findTask(taskId);
  const goBack = useGoBack(task ? `/tarefas?area=${task.area}` : '/tarefas');
  const [demoKey, setDemoKey] = useState(0);
  const [caption, setCaption] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  if (!task || task.premium) return <Navigate to="/tarefas" replace />;

  const isPinball = task.id === 'fliperamemoria';
  const demoRunning = caption !== null;

  const stopDemo = () => {
    clearTimers();
    setCaption(null);
  };
  const startDemo = () => {
    clearTimers();
    setDemoKey((k) => k + 1);
    setCaption(0);
    DEMO_CAPTIONS.forEach((_, i) => {
      if (i > 0) timers.current.push(window.setTimeout(() => setCaption(i), i * DEMO_STEP_MS));
    });
    timers.current.push(window.setTimeout(() => setCaption(null), DEMO_CAPTIONS.length * DEMO_STEP_MS + 1200));
  };

  return (
    <main className="screen screen--full" style={{ paddingTop: 48 }}>
      <div className="row" style={{ gap: 6 }}>
        <button type="button" className="back-btn" aria-label="Voltar para Tarefas" onClick={goBack}>
          <ChevronLeftIcon size={22} stroke={2.4} />
        </button>
        <span style={{ marginLeft: 6, fontSize: 16, fontWeight: 700, color: 'var(--color-text-muted)' }}>
          Tarefas de {task.areaLabel}
        </span>
      </div>

      <div className="hero" style={{ ['--hero-color' as string]: AREA_COLOR[task.area] }}>
        {isPinball ? (
          <PinballHero round={ROUNDS[0]!} demoKey={demoRunning ? demoKey : 0} />
        ) : task.id === 'passaros-perdidos' ? (
          <BirdsHero />
        ) : (
          <SequenceHero theme="culinaria" />
        )}
        {demoRunning && caption !== null && (
          <span className="hero__caption" role="status">{DEMO_CAPTIONS[caption]}</span>
        )}
      </div>

      <div className="stack-10">
        <h1 className="h1">{task.name}</h1>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span className={task.area === 'atencao' ? 'pill pill--attention' : 'pill pill--memory'}>{task.areaLabel}</span>
          <span className="pill pill--success">Grátis</span>
          <span className="pill pill--outline">{task.duration}</span>
        </div>
      </div>

      <section className="steps" aria-label="Como praticar">
        <h2 style={{ fontSize: 18, fontWeight: 900 }}>Como praticar</h2>
        {task.steps.map((text, i) => (
          <div key={text} className="step">
            <span className="step__num">{i + 1}</span>
            <span>{text}</span>
          </div>
        ))}
      </section>

      <div className="grow" />

      <div className="stack-12">
        <button type="button" className="btn btn--primary" onClick={() => navigate(`/pratica/${task.id}`)}>
          <PlayIcon size={14} color="#fff" />
          Praticar
        </button>
        {isPinball && (
          <button type="button" className="btn btn--secondary" onClick={demoRunning ? stopDemo : startDemo}>
            <PlayCircleIcon size={18} />
            {demoRunning ? 'Parar demonstração' : 'Ver como praticar (30 s)'}
          </button>
        )}
      </div>
    </main>
  );
}
