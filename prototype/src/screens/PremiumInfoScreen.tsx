import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon } from '../components/Icons';
import { useGoBack } from '../utils/useGoBack';
import { ChevronLeftIcon } from '../components/Icons';

/** Informational Premium screen. Never asks for payment. */
export default function PremiumInfoScreen() {
  const navigate = useNavigate();
  const goBack = useGoBack('/tarefas');
  return (
    <main className="screen screen--full">
      <div className="row">
        <button type="button" className="back-btn" aria-label="Voltar" onClick={goBack}>
          <ChevronLeftIcon size={22} stroke={2.4} />
        </button>
      </div>
      <h1 className="h1">Conhecer o Premium</h1>
      <section className="card stack-12">
        <p style={{ fontSize: 17, lineHeight: 1.45 }}>
          O Premium libera tarefas extras e a comparação com outras pessoas. É opcional: o treino diário e o seu IPL continuam grátis.
        </p>
        <p className="sheet__foot" style={{ justifyContent: 'flex-start' }}>
          <ShieldCheckIcon size={16} color="var(--color-text-muted)" /> Nenhuma cobrança sem a sua confirmação.
        </p>
      </section>
      <div className="grow" />
      <button type="button" className="btn btn--primary" onClick={() => navigate('/tarefas', { replace: true })}>
        Voltar para tarefas grátis
      </button>
    </main>
  );
}
