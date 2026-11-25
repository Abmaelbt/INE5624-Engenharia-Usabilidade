export type CardShape = 'circle' | 'triangle' | 'square' | 'diamond';

export interface DetectiveRound {
  id: number;
  previous: CardShape;
  current: CardShape;
  same: boolean;
}

export const SHAPE_META: Record<CardShape, { label: string; color: string; bg: string }> = {
  circle: { label: 'Círculo roxo', color: 'var(--color-memory)', bg: 'var(--color-memory-soft)' },
  triangle: { label: 'Triângulo laranja', color: 'var(--color-cta)', bg: 'var(--color-cta-soft)' },
  square: { label: 'Quadrado verde', color: 'var(--color-success)', bg: 'var(--color-success-soft)' },
  diamond: { label: 'Losango azul', color: 'var(--color-info)', bg: 'var(--color-info-soft)' },
};

/** 2 practice rounds: one matching pair, one non-matching pair. */
export const DETECTIVE_PRACTICE_ROUNDS: DetectiveRound[] = [
  { id: 1, previous: 'circle', current: 'circle', same: true },
  { id: 2, previous: 'circle', current: 'triangle', same: false },
];

/** 4 play rounds for the T1 daily workout. */
export const DETECTIVE_PLAY_ROUNDS: DetectiveRound[] = [
  { id: 1, previous: 'square', current: 'square', same: true },
  { id: 2, previous: 'square', current: 'diamond', same: false },
  { id: 3, previous: 'triangle', current: 'triangle', same: true },
  { id: 4, previous: 'diamond', current: 'circle', same: false },
];
