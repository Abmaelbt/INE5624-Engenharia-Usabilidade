export type Side = 'top' | 'right' | 'bottom' | 'left';

export interface SlotRef {
  side: Side;
  /** Column for top/bottom slots, row for left/right slots (0..2). */
  index: number;
}

export interface Mirror {
  row: number;
  col: number;
  kind: '\\' | '/';
}

export interface Round {
  id: number;
  entry: SlotRef;
  mirrors: Mirror[];
  explanation: string;
  wrongHint: string;
}

export interface Point {
  x: number;
  y: number;
}

/** Cell centers on the 300x300 board (matches the Figma export). */
export const CC = [83, 150, 217] as const;

export const ROUNDS: Round[] = [
  {
    id: 1,
    entry: { side: 'top', index: 0 },
    mirrors: [{ row: 2, col: 0, kind: '\\' }],
    explanation: 'Ela bateu na barra e virou para a direita.',
    wrongHint: 'Quase! Veja a inclinação da barra e tente outro círculo.',
  },
  {
    id: 2,
    entry: { side: 'top', index: 1 },
    mirrors: [{ row: 1, col: 1, kind: '/' }],
    explanation: 'Ela bateu na barra inclinada e virou para a esquerda.',
    wrongHint: 'Quase! A barra desvia a bola para o lado. Tente outro círculo.',
  },
  {
    id: 3,
    entry: { side: 'left', index: 0 },
    mirrors: [
      { row: 0, col: 2, kind: '\\' },
      { row: 2, col: 2, kind: '/' },
    ],
    explanation: 'Ela bateu nas duas barras até sair pela esquerda.',
    wrongHint: 'Quase! Siga a bola barra por barra e tente outro círculo.',
  },
];

export const ALL_SLOTS: SlotRef[] = (['top', 'right', 'bottom', 'left'] as Side[]).flatMap((side) =>
  [0, 1, 2].map((index) => ({ side, index })),
);

export const slotId = (s: SlotRef): string => `${s.side}-${s.index}`;

const SIDE_LABEL: Record<Side, string> = { top: 'superior', right: 'direita', bottom: 'inferior', left: 'esquerda' };
export const slotLabel = (s: SlotRef): string => `Saída ${SIDE_LABEL[s.side]} ${s.index + 1}`;

/** Center of the circle drawn outside the board. */
export function slotPoint(s: SlotRef): Point {
  const c = CC[s.index]!;
  switch (s.side) {
    case 'top':
      return { x: c, y: 25 };
    case 'bottom':
      return { x: c, y: 275 };
    case 'left':
      return { x: 25, y: c };
    case 'right':
      return { x: 275, y: c };
  }
}

/** Rotation (deg) of the entry arrow, which points inward. */
export const ARROW_ROTATION: Record<Side, number> = { top: 0, right: 90, bottom: 180, left: -90 };

/** Trace the ball: returns the exit slot and the polyline points of its path. */
export function simulate(round: Round): { exit: SlotRef; points: Point[] } {
  let row = 0;
  let col = 0;
  let dx = 0;
  let dy = 0;
  const { side, index } = round.entry;
  const c = CC[index]!;
  const points: Point[] = [];
  if (side === 'top') {
    row = 0; col = index; dx = 0; dy = 1;
    points.push({ x: c, y: 34 });
  } else if (side === 'bottom') {
    row = 2; col = index; dx = 0; dy = -1;
    points.push({ x: c, y: 266 });
  } else if (side === 'left') {
    row = index; col = 0; dx = 1; dy = 0;
    points.push({ x: 34, y: c });
  } else {
    row = index; col = 2; dx = -1; dy = 0;
    points.push({ x: 266, y: c });
  }

  for (let guard = 0; guard < 20; guard += 1) {
    const mirror = round.mirrors.find((m) => m.row === row && m.col === col);
    if (mirror) {
      [dx, dy] = mirror.kind === '\\' ? [dy, dx] : [-dy, -dx];
      points.push({ x: CC[col]!, y: CC[row]! });
    }
    const nr = row + dy;
    const nc = col + dx;
    if (nr < 0 || nr > 2 || nc < 0 || nc > 2) {
      let exit: SlotRef;
      let end: Point;
      if (dx === 1) { exit = { side: 'right', index: row }; end = { x: 256, y: CC[row]! }; }
      else if (dx === -1) { exit = { side: 'left', index: row }; end = { x: 44, y: CC[row]! }; }
      else if (dy === 1) { exit = { side: 'bottom', index: col }; end = { x: CC[col]!, y: 256 }; }
      else { exit = { side: 'top', index: col }; end = { x: CC[col]!, y: 44 }; }
      points.push(end);
      return { exit, points };
    }
    row = nr;
    col = nc;
  }
  throw new Error('Ball trace did not terminate');
}

export const pathD = (points: Point[]): string =>
  points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ');
