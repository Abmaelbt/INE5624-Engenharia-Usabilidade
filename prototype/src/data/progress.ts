import type { AreaId } from './tasks';

export type RangeId = '7d' | '30d' | 'all';

export interface SeriesSummary {
  before: string;
  strong: string;
  after: string;
}

export interface Series {
  /** Delta label, e.g. "+60 em 30 dias". */
  delta: string;
  yTicks: [number, number, number];
  xLabels: [string, string, string];
  points: number[];
  summary: SeriesSummary;
  ariaLabel: string;
}

export interface AreaProgress {
  id: AreaId;
  name: string;
  score: number | null;
  badge?: string;
  barPercent: number;
  emptyPrompt?: string;
  recommendedTaskId?: string;
  series?: Record<RangeId, Series>;
}

export const IPL = {
  score: 885,
  weeklyDelta: '+20 na semana',
  /** Marker position over the Baixo / Médio / Alto scale, in percent. */
  position: 70,
  tier: 'Alto',
} as const;

export const RANGES: { id: RangeId; label: string }[] = [
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: 'all', label: 'Tudo' },
];

export const AREAS: Record<AreaId, AreaProgress> = {
  memoria: {
    id: 'memoria',
    name: 'Memória',
    score: 895,
    badge: 'Sua melhor área!',
    barPercent: 85,
    recommendedTaskId: 'fliperamemoria',
    series: {
      '7d': {
        delta: '+20 em 7 dias',
        yTicks: [900, 885, 870],
        xLabels: ['Seg', 'Qui', 'Hoje'],
        points: [875, 878, 880, 884, 889, 895],
        summary: { before: 'Você subiu ', strong: '20 pontos', after: ' em Memória nos últimos 7 dias.' },
        ariaLabel: 'Gráfico de linha: IPL de Memória subiu de 875 para 895 nos últimos 7 dias',
      },
      '30d': {
        delta: '+60 em 30 dias',
        yTicks: [900, 860, 820],
        xLabels: ['18/10', '02/11', 'Hoje'],
        points: [835, 842, 856, 851, 870, 881, 895],
        summary: { before: 'Você subiu ', strong: '60 pontos', after: ' em Memória no último mês.' },
        ariaLabel: 'Gráfico de linha: IPL de Memória subiu de 835 para 895 nos últimos 30 dias',
      },
      all: {
        delta: '+145 desde o início',
        yTicks: [900, 825, 750],
        xLabels: ['Ago', 'Out', 'Hoje'],
        points: [750, 775, 800, 835, 860, 880, 895],
        summary: { before: 'Você subiu ', strong: '145 pontos', after: ' em Memória desde que começou.' },
        ariaLabel: 'Gráfico de linha: IPL de Memória subiu de 750 para 895 desde o início',
      },
    },
  },
  atencao: {
    id: 'atencao',
    name: 'Atenção',
    score: 864,
    badge: 'Em evolução',
    barPercent: 76,
    recommendedTaskId: 'passaros-perdidos',
    series: {
      '7d': {
        delta: '+9 em 7 dias',
        yTicks: [870, 855, 840],
        xLabels: ['Seg', 'Qui', 'Hoje'],
        points: [855, 857, 858, 861, 862, 864],
        summary: { before: 'Você subiu ', strong: '9 pontos', after: ' em Atenção nos últimos 7 dias.' },
        ariaLabel: 'Gráfico de linha: IPL de Atenção subiu de 855 para 864 nos últimos 7 dias',
      },
      '30d': {
        delta: '+34 em 30 dias',
        yTicks: [870, 850, 830],
        xLabels: ['18/10', '02/11', 'Hoje'],
        points: [830, 838, 841, 849, 853, 858, 864],
        summary: { before: 'Você subiu ', strong: '34 pontos', after: ' em Atenção no último mês.' },
        ariaLabel: 'Gráfico de linha: IPL de Atenção subiu de 830 para 864 nos últimos 30 dias',
      },
      all: {
        delta: '+64 desde o início',
        yTicks: [870, 835, 800],
        xLabels: ['Ago', 'Out', 'Hoje'],
        points: [800, 812, 826, 838, 851, 864],
        summary: { before: 'Você subiu ', strong: '64 pontos', after: ' em Atenção desde que começou.' },
        ariaLabel: 'Gráfico de linha: IPL de Atenção subiu de 800 para 864 desde o início',
      },
    },
  },
  velocidade: {
    id: 'velocidade',
    name: 'Velocidade',
    score: null,
    barPercent: 0,
    emptyPrompt: 'Faça 1 tarefa para ver',
  },
};

export const AREA_ORDER: AreaId[] = ['memoria', 'atencao', 'velocidade'];
