export type Direction = 'up' | 'down' | 'left' | 'right';
export type Formation = 'row' | 'v' | 'cross';

export interface BirdsRound {
  id: number;
  center: Direction;
  flankers: Direction;
  formation: Formation;
}

export const DIR_LABEL: Record<Direction, string> = {
  up: 'cima',
  down: 'baixo',
  left: 'esquerda',
  right: 'direita',
};

export const DIR_ROTATION: Record<Direction, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: -90,
};

/**
 * Coordinates in 280x180 viewBox; index 2 is always the center target bird.
 */
export const FORMATIONS: Record<Formation, [number, number][]> = {
  row: [
    [36, 90],
    [88, 90],
    [140, 90],
    [192, 90],
    [244, 90],
  ],
  v: [
    [48, 56],
    [94, 73],
    [140, 90],
    [186, 73],
    [232, 56],
  ],
  cross: [
    [140, 34],
    [80, 90],
    [140, 90],
    [200, 90],
    [140, 146],
  ],
};

/** 3 deterministic practice rounds (T1 uses first 2; T3 uses all 3). */
export const BIRDS_PRACTICE_ROUNDS: BirdsRound[] = [
  { id: 1, center: 'up', flankers: 'right', formation: 'row' },
  { id: 2, center: 'left', flankers: 'up', formation: 'v' },
  { id: 3, center: 'down', flankers: 'left', formation: 'cross' },
];

/** 4 deterministic play rounds for the T1 daily workout. */
export const BIRDS_PLAY_ROUNDS: BirdsRound[] = [
  { id: 1, center: 'right', flankers: 'left', formation: 'row' },
  { id: 2, center: 'up', flankers: 'down', formation: 'v' },
  { id: 3, center: 'left', flankers: 'right', formation: 'cross' },
  { id: 4, center: 'down', flankers: 'up', formation: 'v' },
];
