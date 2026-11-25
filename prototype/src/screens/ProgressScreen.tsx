import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, HelpCircleIcon, LockIcon, TriangleUpIcon } from '../components/Icons';
import IplScale from '../components/IplScale';
import { IplSheet, PremiumFeatureSheet } from '../components/Sheets';
import { AREAS, AREA_ORDER, IPL } from '../data/progress';
import { AREA_COLOR } from '../data/tasks';
import { useSecretTaps } from '../utils/facilitatorStore';
import { useSheet } from '../utils/useSheet';

/** T2.C: progress overview (plus T2.C2 sheet). */
export default function ProgressScreen() {
  const navigate = useNavigate();
  const sheet = useSheet();
  const onSecretTap = useSecretTaps();

  return (
    <main className="screen">
      <h1 className="h1" onClick={onSecretTap}>Meu Progresso</h1>

      <section className="card stack-16" aria-label="Seu IPL geral" style={{ gap: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-subtle)' }}>Seu IPL geral</span>
        <div className="ipl-big">
          <span className="ipl-big__value">{IPL.score}</span>
          <span className="delta-badge">
            <TriangleUpIcon size={11} />
            {IPL.weeklyDelta}
          </span>
        </div>
        <IplScale position={IPL.position} current={IPL.tier} />
        <button type="button" className="help-btn" onClick={() => sheet.open('ipl')}>
          <HelpCircleIcon size={20} />
          O que é o IPL?
        </button>
      </section>

      <section aria-label="Por área" className="stack-10">
        <h2 className="h2" style={{ marginTop: 4 }}>Por área</h2>
        {AREA_ORDER.map((id) => {
          const area = AREAS[id];
          const empty = area.score === null;
          return (
            <button
              key={id}
              type="button"
              className="area-row"
              style={{ ['--bar-color' as string]: AREA_COLOR[id] }}
              onClick={() => navigate(empty ? '/tarefas?area=velocidade' : `/progresso/${id}`)}
            >
              <div className="area-row__body">
                <div className="area-row__top">
                  <span>{area.name}</span>
                  {empty ? (
                    <span className="area-row__empty">{area.emptyPrompt}</span>
                  ) : (
                    <span className="area-row__score">{area.score}</span>
                  )}
                </div>
                <div className="bar">
                  <span style={{ width: `${area.barPercent}%` }} />
                </div>
              </div>
              <ChevronRightIcon size={18} color="var(--color-text-subtle)" stroke={2.4} />
            </button>
          );
        })}

        <button
          type="button"
          className="premium-strip"
          style={{ minHeight: 60 }}
          onClick={() => sheet.open('premium', { feature: 'comparar' })}
        >
          <LockIcon size={18} color="var(--color-text-subtle)" stroke={2} />
          <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <strong style={{ color: 'var(--color-text)', fontSize: 15 }}>Comparar com outras pessoas</strong>
            <span style={{ fontSize: 12 }}>Premium (opcional) · Saiba mais</span>
          </span>
        </button>
      </section>

      <IplSheet open={sheet.name === 'ipl'} />
      <PremiumFeatureSheet open={sheet.name === 'premium'} />
    </main>
  );
}
