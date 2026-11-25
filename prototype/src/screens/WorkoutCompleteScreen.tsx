import { useNavigate } from 'react-router-dom';
import { CheckIcon, ChartIcon, FlameIcon, TriangleUpIcon } from '../components/Icons';

const DONE = ['Pássaros', 'Detetive', 'Café'];

/** T2.A: end of workout. */
export default function WorkoutCompleteScreen() {
  const navigate = useNavigate();
  return (
    <main className="screen screen--full">
      <div className="complete-hero">
        <div className="complete-check">
          <CheckIcon size={56} color="var(--color-success)" stroke={2.6} />
        </div>
        <h1 className="h1 h1--xl" style={{ marginTop: 8 }}>Treino concluído!</h1>
        <p className="complete-meta">
          <FlameIcon size={18} color="var(--color-cta)" stroke={2} />
          3 de 3 tarefas · 2 dias seguidos
        </p>
      </div>

      <div className="chip-row">
        {DONE.map((name) => (
          <span key={name} className="done-pill">
            <span className="done-dot">
              <CheckIcon size={12} color="#fff" stroke={3.4} />
            </span>
            {name}
          </span>
        ))}
      </div>

      <section className="card last-task" aria-label="Última tarefa">
        <div className="last-task__row">
          <div>
            <span className="eyebrow">ÚLTIMA TAREFA</span>
            <strong className="last-task__name">Pássaros Perdidos</strong>
          </div>
          <span>
            <strong style={{ fontSize: 17 }}>18</strong> de 20 acertos
          </span>
        </div>
        <hr className="divider" />
        <div className="last-task__row">
          <span>
            Sua nota em <strong>Atenção</strong> subiu
          </span>
          <span className="delta-badge">
            <TriangleUpIcon size={11} />
            +12 pontos
          </span>
        </div>
      </section>

      <div className="grow" />

      <div className="stack-12">
        <button type="button" className="btn btn--primary" onClick={() => navigate('/progresso')}>
          <ChartIcon size={20} color="#fff" stroke={2.4} />
          Ver meu progresso
        </button>
        <button type="button" className="btn btn--secondary" onClick={() => navigate('/')}>
          Voltar ao início
        </button>
      </div>
    </main>
  );
}
