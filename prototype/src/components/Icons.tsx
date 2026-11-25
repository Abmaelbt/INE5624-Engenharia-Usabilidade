import type { ReactNode } from 'react';
import type { TaskIconKind } from '../data/tasks';

export interface IconProps {
  size?: number;
  color?: string;
  stroke?: number;
  className?: string;
}

interface BaseProps extends IconProps {
  filled?: boolean;
  children: ReactNode;
}

/** Shared 24x24 SVG wrapper. Paths come from the Figma HTML export. */
function Base({ size = 22, color = 'currentColor', stroke = 2.2, filled = false, className, children }: BaseProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={filled ? 'none' : color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Base {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></Base>
);

export const GridTasksIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </Base>
);

export const ProgressBarsIcon = (p: IconProps) => (
  <Base {...p}><path d="M4 20V11M10 20V5M16 20v-6M21 20H3" /></Base>
);

export const ChartIcon = (p: IconProps) => (
  <Base {...p}><path d="M4 19V10M10 19V5M16 19v-7M22 19H2" /></Base>
);

export const FlameIcon = (p: IconProps) => (
  <Base {...p}><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1.2 2.6 2.5 3-.5-3 0-5.5 0-8z" /></Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Base>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Base {...p}><path d="M9 6l6 6-6 6" /></Base>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Base {...p}><path d="M15 6l-6 6 6 6" /></Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}><path d="M6 6l12 12M18 6L6 18" /></Base>
);

export const LockIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Base>
);

export const HelpCircleIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Base>
);

export const PlayIcon = (p: IconProps) => (
  <Base {...p} filled><path d="M7 4l13 8-13 8z" /></Base>
);

export const PlayCircleIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.5l5 3.5-5 3.5z" fill="currentColor" />
  </Base>
);

export const TrendUpIcon = (p: IconProps) => (
  <Base {...p}><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></Base>
);

export const ShieldCheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Base>
);

export const TriangleUpIcon = (p: IconProps) => (
  <Base {...p} filled><path d="M12 5l8 12H4z" /></Base>
);

export const BirdIcon = (p: IconProps) => (
  <Base {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Base>
);

export const PinballIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M7 3v14h14" strokeDasharray="2.5 2.5" />
    <circle cx="7" cy="17" r="2" fill="currentColor" />
  </Base>
);

export const ChefIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" />
    <path d="M9 4c0 1.5 1 1.5 1 3M14 4c0 1.5 1 1.5 1 3" />
  </Base>
);

export const BoltIcon = (p: IconProps) => (
  <Base {...p}><path d="M13 3L5 14h6l-1 7 8-11h-6z" /></Base>
);

export const FrogIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="9" r="2.5" />
    <circle cx="16" cy="9" r="2.5" />
    <path d="M4 15c2 3 5 4 8 4s6-1 8-4" />
  </Base>
);

export const MusicIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </Base>
);

const TASK_ICONS: Record<TaskIconKind, (p: IconProps) => ReactNode> = {
  bird: BirdIcon,
  pinball: PinballIcon,
  chef: ChefIcon,
  bolt: BoltIcon,
  frog: FrogIcon,
  music: MusicIcon,
};

export function TaskIcon({ kind, ...rest }: IconProps & { kind: TaskIconKind }) {
  return <>{TASK_ICONS[kind](rest)}</>;
}
