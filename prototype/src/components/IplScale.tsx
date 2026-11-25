import { TriangleUpIcon } from './Icons';

interface Props {
  /** Marker position in percent. Ignored in compact mode. */
  position?: number;
  compact?: boolean;
  current?: 'Baixo' | 'Médio' | 'Alto';
}

/** Three-segment Baixo / Médio / Alto scale for the IPL. */
export default function IplScale({ position = 70, compact = false, current = 'Alto' }: Props) {
  if (compact) {
    return (
      <div className="ipl-scale__track" style={{ height: 10 }} aria-hidden="true">
        <div />
        <div />
        <div />
      </div>
    );
  }
  return (
    <div className="stack-8" role="img" aria-label={`Escala do IPL: faixa ${current}`}>
      <div style={{ position: 'relative', height: 30 }}>
        <span className="ipl-scale__marker" style={{ left: `${position}%` }}>
          <TriangleUpIcon size={18} color="var(--color-text)" className="flip" />
        </span>
        <div className="ipl-scale__track" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 12 }}>
          <div />
          <div />
          <div />
        </div>
      </div>
      <div className="ipl-scale__labels">
        {(['Baixo', 'Médio', 'Alto'] as const).map((l) => (
          <span key={l} className={l === current ? 'is-current' : undefined}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
