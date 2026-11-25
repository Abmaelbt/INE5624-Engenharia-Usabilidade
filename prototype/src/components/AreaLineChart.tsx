import type { Series } from '../data/progress';

interface Props {
  series: Series;
  color: string;
}

const W = 300;
const H = 180;
const TOP = 10;
const BOTTOM = 150;
const LEFT = 10;
const RIGHT = 290;

/** Responsive SVG line chart; geometry matches the Figma export (300x180 viewBox). */
export default function AreaLineChart({ series, color }: Props) {
  const { points, yTicks, xLabels, ariaLabel } = series;
  const yMax = yTicks[0];
  const yMin = yTicks[2];
  const toY = (v: number) => BOTTOM - ((v - yMin) / (yMax - yMin)) * (BOTTOM - TOP);
  const step = (RIGHT - LEFT) / (points.length - 1);
  const coords = points.map((v, i) => ({ x: +(LEFT + i * step).toFixed(1), y: +toY(v).toFixed(1) }));
  const last = coords[coords.length - 1]!;
  const gridYs = [TOP, (TOP + BOTTOM) / 2, BOTTOM];

  return (
    <div className="chart">
      {yTicks.map((tick, i) => (
        <span key={tick} className="chart__y" style={{ top: `${(gridYs[i]! / H) * 100}%` }}>
          {tick}
        </span>
      ))}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel}>
        {gridYs.map((y, i) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2={W}
            y2={y}
            stroke={i === 2 ? 'var(--color-border-strong)' : '#efefef'}
            strokeWidth="1.5"
          />
        ))}
        <polyline
          key={ariaLabel}
          className="chart__line"
          pathLength={1}
          points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.slice(0, -1).map((c) => (
          <circle key={c.x} cx={c.x} cy={c.y} r="5" fill="#fff" stroke={color} strokeWidth="3" />
        ))}
        <circle cx={last.x} cy={last.y} r="7" fill={color} />
        <text x="10" y="172" fontFamily="Nunito, sans-serif" fontSize="13" fontWeight="700" fill="var(--color-text-subtle)">
          {xLabels[0]}
        </text>
        <text x="150" y="172" textAnchor="middle" fontFamily="Nunito, sans-serif" fontSize="13" fontWeight="700" fill="var(--color-text-subtle)">
          {xLabels[1]}
        </text>
        <text x="296" y="172" textAnchor="end" fontFamily="Nunito, sans-serif" fontSize="13" fontWeight="700" fill="var(--color-text-subtle)">
          {xLabels[2]}
        </text>
      </svg>
    </div>
  );
}
