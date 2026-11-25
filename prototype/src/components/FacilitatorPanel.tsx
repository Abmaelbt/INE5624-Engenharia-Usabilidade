import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setFacilitatorOpen, useFacilitatorOpen } from '../utils/facilitatorStore';
import {
  exportCsv,
  exportJson,
  finishTimer,
  resetSession,
  startTimer,
  summarize,
  useTelemetry,
  type TaskSummary,
  type TimerId,
} from '../utils/telemetry';
import { resetWorkout, setWorkoutPreset } from '../utils/workoutStore';

interface Scenario {
  label: string;
  to: string;
  preset?: 'pending' | 'done';
}

const SCENARIOS: Scenario[] = [
  { label: 'T1.A · Início (treino 0/3)', to: '/', preset: 'pending' },
  { label: 'T1.B · Treino (etapa 1)', to: '/treino/1', preset: 'pending' },
  { label: 'T2.A · Fim do treino', to: '/treino-concluido', preset: 'done' },
  { label: 'T2.B · Início (treino 3/3)', to: '/', preset: 'done' },
  { label: 'T3.A · Tarefas', to: '/tarefas' },
  { label: 'T3.B · Filtro Memória', to: '/tarefas?area=memoria' },
  { label: 'T3.D · Prática Fliperamemória', to: '/pratica/fliperamemoria' },
];

const TASK_LABEL: Record<TimerId, string> = {
  T1: 'T1 · Realizar o treino diário',
  T2: 'T2 · Consultar o IPL',
  T3: 'T3 · Buscar e praticar tarefa de memória',
};

const STATUS_LABEL = { idle: 'parada', running: 'em andamento', done: 'concluída' } as const;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

function TimerBlock({ s }: { s: TaskSummary }) {
  return (
    <div className="stack-8" style={{ gap: 6 }}>
      <h3>{TASK_LABEL[s.id]}</h3>
      <div className="facilitator__metric">
        <strong>{STATUS_LABEL[s.status]} · {seconds(s.elapsedMs)}</strong>
        Toques: {s.taps} · Avisos Premium: {s.premiumOpens} · Erros: {s.practiceErrors}
        {s.outcome ? ` · ${s.outcome === 'autonomous' ? 'autônomo' : 'com ajuda'}` : ''}
      </div>
      <div className="facilitator__grid">
        <button type="button" onClick={() => startTimer(s.id)}>Iniciar {s.id}</button>
        <button type="button" disabled={s.status !== 'running'} onClick={() => finishTimer(s.id, 'autonomous')}>
          Concluir (autônomo)
        </button>
      </div>
      <button type="button" disabled={s.status !== 'running'} onClick={() => finishTimer(s.id, 'assisted')}>
        Concluir (com ajuda)
      </button>
    </div>
  );
}

/**
 * Hidden facilitator controls: scenario jumps, task timers, telemetry export.
 * Desktop (>= 860px): side panel. Mobile: modal opened with 5 taps on a screen header.
 */
export default function FacilitatorPanel() {
  const open = useFacilitatorOpen();
  const telemetry = useTelemetry();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [, setTick] = useState(0);

  const running = (['T1', 'T2', 'T3'] as TimerId[]).some(
    (id) => telemetry.timers[id].startedAt && !telemetry.timers[id].endedAt,
  );

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, [running]);

  const summaries = summarize(telemetry);
  const jump = (s: Scenario | string) => {
    if (typeof s === 'string') {
      navigate(s);
    } else {
      if (s.preset) setWorkoutPreset(s.preset);
      navigate(s.to);
    }
    setFacilitatorOpen(false);
  };

  return (
    <aside
      className={`facilitator${open ? ' is-open' : ''}${collapsed ? ' is-collapsed' : ''}`}
      data-facilitator
      aria-label="Painel do facilitador"
    >
      <div className="facilitator__card">
        <div className="facilitator__head">
          <h2>Facilitador</h2>
          <button type="button" className="facilitator__collapse" onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? 'Expandir' : 'Recolher'}
          </button>
          <button type="button" className="facilitator__close" onClick={() => setFacilitatorOpen(false)}>
            Fechar
          </button>
        </div>
        <div className="facilitator__body stack-12">
          <div className="facilitator__metric">
            Sessão <strong>{telemetry.sessionId}</strong>
            Eventos: {telemetry.events.length}
          </div>

          <section className="stack-8">
            <h3>Cenários</h3>
            {SCENARIOS.map((s) => (
              <button key={s.label} type="button" onClick={() => jump(s)}>{s.label}</button>
            ))}
          </section>

          {summaries.map((s) => (
            <TimerBlock key={s.id} s={s} />
          ))}

          <section className="stack-8">
            <h3>Dados</h3>
            <div className="facilitator__grid">
              <button type="button" onClick={exportJson}>Exportar JSON</button>
              <button type="button" onClick={exportCsv}>Exportar CSV</button>
            </div>
            <button
              type="button"
              className="is-danger"
              onClick={() => {
                resetSession();
                resetWorkout();
                jump('/');
              }}
            >
              Resetar sessão
            </button>
          </section>
        </div>
      </div>
    </aside>
  );
}
