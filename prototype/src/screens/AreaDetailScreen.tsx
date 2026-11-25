import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import AreaLineChart from '../components/AreaLineChart';
import { ChevronLeftIcon, TaskIcon, TriangleUpIcon } from '../components/Icons';
import { AREAS, RANGES, type RangeId } from '../data/progress';
import { AREA_COLOR, findTask, type AreaId } from '../data/tasks';
import { useGoBack } from '../utils/useGoBack';

/** T2.D: area evolution with 7 dias / 30 dias / Tudo. */
export default function AreaDetailScreen() {
  const { areaId } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack('/progresso');
  const [range, setRange] = useState<RangeId>('30d');

  const area = areaId && areaId in AREAS ? AREAS[areaId as AreaId] : undefined;
  if (!area) return <Navigate to="/progresso" replace />;
  if (!area.series || area.score === null) return <Navigate to="/tarefas?area=velocidade" replace />;

  const series = area.series[range];
  const color = AREA_COLOR[area.id];
  const task = findTask(area.recommendedTaskId);
  const badgeClass = area.id === 'memoria' ? 'pill pill--memory' : 'pill pill--attention';

  return (
    <main className="screen" style={{ ['--bar-color' as string]: color }}>
      <div className="row" style={{ gap: 6 }}>
        <button type="button" className="back-btn" aria-label="Voltar para Meu Progresso" onClick={goBack}>
          <ChevronLeftIcon size={22} stroke={2.4} />
        </button>
        <h1 className="h1" style={{ fontSize: 24, marginLeft: 6 }}>{area.name}</h1>
      </div>

      <div className="row" style={{ gap: 14 }}>
        <span className="area-score">{area.score}</span>
        <div className="stack-8" style={{ gap: 6, alignItems: 'flex-start' }}>
          <span className={badgeClass} style={{ padding: '4px 10px' }}>{area.badge}</span>
          <span className="row" style={{ gap: 4, color: 'var(--color-attention)', fontSize: 14, fontWeight: 800 }}>
            <TriangleUpIcon size={11} />
            {series.delta}
          </span>
        </div>
      </div>

      <div className="segmented" role="group" aria-label="Período">
        {RANGES.map((r) => (
          <button key={r.id} type="button" aria-pressed={range === r.id} onClick={() => setRange(r.id)}>
            {r.label}
          </button>
        ))}
      </div>

      <section className="card stack-8" style={{ borderRadius: 20, padding: 16 }} aria-live="polite">
        <AreaLineChart series={series} color={color} />
        <p style={{ fontSize: 15, lineHeight: 1.4 }}>
          {series.summary.before}
          <strong>{series.summary.strong}</strong>
          {series.summary.after}
        </p>
      </section>

      {task && (
        <section className="stack-10" aria-label="Treine esta área">
          <h2 className="h2">Treine esta área</h2>
          <div className="practice-card">
            <div className="task-tile" style={{ ['--tile-color' as string]: color }}>
              <TaskIcon kind={task.icon} size={28} stroke={2} />
            </div>
            <div className="task-row__body">
              <span className="task-row__name">{task.name}</span>
              <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Grátis · {task.duration}</span>
            </div>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => navigate(`/tarefa/${task.id}`)}>
              Praticar
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
