export type AreaId = 'memoria' | 'atencao' | 'velocidade';
export type TaskIconKind = 'bird' | 'pinball' | 'chef' | 'bolt' | 'frog' | 'music';

export interface Task {
  id: string;
  name: string;
  area: AreaId;
  areaLabel: string;
  /** Sub-area label shown when a filter is active. */
  subtitle: string;
  duration: string;
  premium: boolean;
  icon: TaskIconKind;
  steps: [string, string];
}

export const TASKS: Task[] = [
  {
    id: 'passaros-perdidos',
    name: 'Pássaros Perdidos',
    area: 'atencao',
    areaLabel: 'Atenção',
    subtitle: 'Atenção seletiva',
    duration: 'cerca de 2 min',
    premium: false,
    icon: 'bird',
    steps: ['Olhe para onde o pássaro do meio aponta.', 'Toque na seta da mesma direção abaixo.'],
  },
  {
    id: 'fliperamemoria',
    name: 'Fliperamemória',
    area: 'memoria',
    areaLabel: 'Memória',
    subtitle: 'Memória de trabalho',
    duration: 'cerca de 2 min',
    premium: false,
    icon: 'pinball',
    steps: ['Veja o caminho da bola.', 'Toque no círculo onde ela vai sair.'],
  },
  {
    id: 'culinaria',
    name: 'Culinária',
    area: 'memoria',
    areaLabel: 'Memória',
    subtitle: 'Memória de curto prazo',
    duration: 'cerca de 2 min',
    premium: false,
    icon: 'chef',
    steps: ['Veja os ingredientes da receita.', 'Monte o prato na mesma ordem.'],
  },
  {
    id: 'corrida-de-pinguins',
    name: 'Corrida de Pinguins',
    area: 'velocidade',
    areaLabel: 'Velocidade',
    subtitle: 'Velocidade de reação',
    duration: 'cerca de 2 min',
    premium: true,
    icon: 'bolt',
    steps: ['Observe a pista.', 'Toque no pinguim certo.'],
  },
  {
    id: 'siga-o-sapo',
    name: 'Siga o Sapo',
    area: 'memoria',
    areaLabel: 'Memória',
    subtitle: 'Memória visual',
    duration: 'cerca de 2 min',
    premium: true,
    icon: 'frog',
    steps: ['Siga os pulos do sapo.', 'Repita o caminho.'],
  },
  {
    id: 'batida-perfeita',
    name: 'Batida Perfeita',
    area: 'memoria',
    areaLabel: 'Memória',
    subtitle: 'Memória auditiva',
    duration: 'cerca de 2 min',
    premium: true,
    icon: 'music',
    steps: ['Ouça o ritmo.', 'Repita a sequência.'],
  },
];

/** In the "Todas" view the design previews only one Premium task (de-emphasized, optional). */
export const FEATURED_PREMIUM_ID = 'corrida-de-pinguins';

export const AREA_COLOR: Record<AreaId, string> = {
  memoria: 'var(--color-memory)',
  atencao: 'var(--color-attention)',
  velocidade: 'var(--color-info)',
};

export function findTask(id: string | undefined): Task | undefined {
  return TASKS.find((t) => t.id === id);
}
