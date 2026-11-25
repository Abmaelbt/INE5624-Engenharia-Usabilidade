import IplScale from './IplScale';
import BottomSheet from './BottomSheet';
import {
  GridTasksIcon,
  HelpCircleIcon,
  LockIcon,
  ProgressBarsIcon,
  ShieldCheckIcon,
  TrendUpIcon,
} from './Icons';
import { useSheet } from '../utils/useSheet';

const FEATURE_LABELS: Record<string, string> = {
  comparar: 'Comparar com outras pessoas',
  'mais-tarefas': 'Mais tarefas',
};

interface Props {
  open: boolean;
}

/** Generic "Recurso Premium" sheet. Optional, non-blocking, with a clear "Agora não". */
export function PremiumFeatureSheet({ open }: Props) {
  const sheet = useSheet();
  const feature = FEATURE_LABELS[sheet.params.get('feature') ?? ''] ?? 'Este recurso';
  return (
    <BottomSheet open={open} onClose={sheet.close} labelledBy="premium-feature-title">
      <div className="sheet__head">
        <div className="sheet__icon" style={{ background: 'var(--color-premium-bg)' }}>
          <LockIcon size={22} color="var(--color-text)" />
        </div>
        <h2 id="premium-feature-title" className="sheet__title">Recurso Premium</h2>
      </div>
      <p className="sheet__text">
        <strong>{feature}</strong> faz parte da assinatura. Todas as tarefas grátis continuam disponíveis para você.
      </p>
      <button type="button" className="btn btn--primary" onClick={sheet.close}>
        Agora não
      </button>
      <button type="button" className="link-underline" onClick={() => sheet.goAndClose('/premium')}>
        Conhecer o Premium
      </button>
      <p className="sheet__foot">
        <ShieldCheckIcon size={16} color="var(--color-text-muted)" /> Nenhuma cobrança sem a sua confirmação.
      </p>
    </BottomSheet>
  );
}

/** "O que é o IPL?" sheet (T2.C2). */
export function IplSheet({ open }: Props) {
  const sheet = useSheet();
  return (
    <BottomSheet open={open} onClose={sheet.close} labelledBy="ipl-title">
      <div className="sheet__head">
        <div className="sheet__icon" style={{ background: 'var(--color-memory-soft)' }}>
          <HelpIcon />
        </div>
        <h2 id="ipl-title" className="sheet__title">O que é o IPL?</h2>
      </div>
      <ul className="info-list">
        <li>
          <GridIcon />
          <span>É uma nota que <strong>resume seus resultados</strong> nas tarefas.</span>
        </li>
        <li>
          <TrendIcon />
          <span><strong>Sobe</strong> quando você acerta mais e responde mais rápido.</span>
        </li>
        <li>
          <BarsIcon />
          <span>Cada área (memória, atenção...) tem <strong>a sua nota</strong>.</span>
        </li>
      </ul>
      <div className="scale-box">
        <span style={{ fontSize: 15, fontWeight: 800 }}>Como ler a escala</span>
        <IplScale compact />
        <span style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
          Baixo, Médio e Alto mostram onde você está hoje. Ex.: Memória 895 é a sua melhor área.
        </span>
      </div>
      <button type="button" className="btn btn--primary" onClick={sheet.close}>
        Entendi
      </button>
    </BottomSheet>
  );
}

const HelpIcon = () => <HelpCircleIcon size={24} color="var(--color-memory)" />;
const GridIcon = () => <GridTasksIcon size={22} color="var(--color-cta)" />;
const TrendIcon = () => <TrendUpIcon size={22} color="var(--color-cta)" />;
const BarsIcon = () => <ProgressBarsIcon size={22} color="var(--color-cta)" />;
