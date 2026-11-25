import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomSheet from '../components/BottomSheet';
import { CheckIcon, ChevronRightIcon, FlameIcon, LockIcon, TriangleUpIcon } from '../components/Icons';
import { PremiumFeatureSheet } from '../components/Sheets';
import { IPL } from '../data/progress';
import { useSecretTaps } from '../utils/facilitatorStore';
import { useSheet } from '../utils/useSheet';

const TODAY = ['Pássaros', 'Detetive', 'Café'];
const MOODS = ['Bem', 'Normal', 'Cansada'];

function MoodSheet({ open }: { open: boolean }) {
  const sheet = useSheet();
  const [mood, setMood] = useState<string | null>(null);
  return (
    <BottomSheet open={open} onClose={sheet.close} labelledBy="mood-title">
      <h2 id="mood-title" className="sheet__title">Como você está hoje?</h2>
      <p className="sheet__text muted">Opcional. Ajuda a gente a entender seu treino.</p>
      <div className="mood-options" role="group" aria-label="Como você está hoje?">
        {MOODS.map((m) => (
          <button key={m} type="button" aria-pressed={mood === m} onClick={() => setMood(m)}>
            {m}
          </button>
        ))}
      </div>
      {mood && <p className="sheet__text" role="status">Obrigada! Anotamos: <strong>{mood}</strong>.</p>}
      <button type="button" className="btn btn--primary" onClick={sheet.close}>
        {mood ? 'Fechar' : 'Agora não'}
      </button>
    </BottomSheet>
  );
}

/** T2.B: home (default entry screen). */
export default function HomeScreen() {
  const navigate = useNavigate();
  const sheet = useSheet();
  const onSecretTap = useSecretTaps();

  return (
    <main className="screen">
      <header className="home-header" onClick={onSecretTap}>
        <div className="stack-8" style={{ gap: 2 }}>
          <span className="greeting">Boa tarde,</span>
          <h1 className="h1">Rosângela</h1>
        </div>
        <div className="streak-badge">
          <FlameIcon size={18} color="var(--color-cta)" stroke={2} />2 dias
        </div>
      </header>

      <section className="card stack-16" aria-label="Treino de hoje" style={{ borderRadius: 22 }}>
        <div className="row row--between" style={{ alignItems: 'baseline' }}>
          <h2 style={{ fontSize: 20, fontWeight: 900 }}>Treino de hoje</h2>
          <span className="today-count">3 de 3 concluídos</span>
        </div>
        <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={3} aria-label="Treino de hoje">
          <span style={{ width: '100%' }} />
        </div>
        <div className="today-grid">
          {TODAY.map((name) => (
            <div key={name} className="today-item">
              <div className="today-item__dot">
                <CheckIcon size={26} color="var(--color-success)" stroke={2.8} />
              </div>
              {name}
            </div>
          ))}
        </div>
      </section>

      <button type="button" className="ipl-card" onClick={() => navigate('/progresso')} aria-label={`Seu IPL geral ${IPL.score}. Ver meu progresso`}>
        <div className="stack-8" style={{ gap: 4 }}>
          <span className="ipl-card__label">Seu IPL geral</span>
          <div className="row" style={{ gap: 10 }}>
            <span className="ipl-card__value">{IPL.score}</span>
            <span className="delta-badge" style={{ fontSize: 12, padding: '4px 8px' }}>
              <TriangleUpIcon size={10} />
              {IPL.weeklyDelta}
            </span>
          </div>
        </div>
        <span className="ipl-card__cta">
          Ver <ChevronRightIcon size={18} stroke={2.6} />
        </span>
      </button>

      <button type="button" className="link-underline" onClick={() => sheet.open('mood')}>
        Como você está hoje? (opcional)
      </button>

      <div className="grow" />

      <button type="button" className="premium-strip" onClick={() => sheet.open('premium', { feature: 'mais-tarefas' })}>
        <LockIcon size={18} color="var(--color-text-subtle)" stroke={2} />
        <span>Mais tarefas no Premium (opcional)</span>
        <ChevronRightIcon size={18} color="var(--color-text-subtle)" stroke={2.4} />
      </button>

      <MoodSheet open={sheet.name === 'mood'} />
      <PremiumFeatureSheet open={sheet.name === 'premium'} />
    </main>
  );
}
