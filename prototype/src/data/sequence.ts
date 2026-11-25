export type SequenceTheme = 'cafe' | 'culinaria';
export type SequenceItemId =
  | 'cafe'
  | 'bolo'
  | 'suco'
  | 'pao'
  | 'tomate'
  | 'queijo'
  | 'folha'
  | 'pao-cul';

export interface SequenceItem {
  id: SequenceItemId;
  label: string;
  color: string;
  bg: string;
}

export interface SequenceRound {
  id: number;
  target: SequenceItemId[];
}

export const THEME_ITEMS: Record<SequenceTheme, SequenceItem[]> = {
  cafe: [
    { id: 'cafe', label: 'Café', color: '#7C3AED', bg: '#F3E8FF' },
    { id: 'bolo', label: 'Bolo', color: '#C14009', bg: '#FFF2E2' },
    { id: 'suco', label: 'Suco', color: '#19746D', bg: '#E6F4F1' },
    { id: 'pao', label: 'Pão', color: '#2F76D2', bg: '#EAF2FF' },
  ],
  culinaria: [
    { id: 'tomate', label: 'Tomate', color: '#C14009', bg: '#FFF2E2' },
    { id: 'queijo', label: 'Queijo', color: '#B45309', bg: '#FEF3C7' },
    { id: 'folha', label: 'Folha', color: '#227C48', bg: '#E2F4E8' },
    { id: 'pao-cul', label: 'Pão', color: '#6D27D8', bg: '#F3E8FF' },
  ],
};

export const SEQUENCE_ROUNDS: Record<SequenceTheme, { practice: SequenceRound[]; play: SequenceRound[] }> = {
  cafe: {
    practice: [
      { id: 1, target: ['cafe', 'bolo'] },
      { id: 2, target: ['suco', 'pao'] },
      { id: 3, target: ['cafe', 'pao', 'bolo'] },
    ],
    play: [
      { id: 1, target: ['cafe', 'pao'] },
      { id: 2, target: ['bolo', 'suco'] },
      { id: 3, target: ['suco', 'cafe', 'bolo'] },
    ],
  },
  culinaria: {
    practice: [
      { id: 1, target: ['tomate', 'queijo'] },
      { id: 2, target: ['pao-cul', 'folha'] },
      { id: 3, target: ['pao-cul', 'tomate', 'queijo'] },
    ],
    play: [
      { id: 1, target: ['folha', 'queijo'] },
      { id: 2, target: ['tomate', 'pao-cul'] },
      { id: 3, target: ['pao-cul', 'folha', 'tomate'] },
    ],
  },
};

export function findSequenceItem(theme: SequenceTheme, id: SequenceItemId): SequenceItem {
  return THEME_ITEMS[theme].find((i) => i.id === id) ?? THEME_ITEMS[theme][0]!;
}
