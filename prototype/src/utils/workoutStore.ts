import { useSyncExternalStore } from 'react';
import type { AreaId } from '../data/tasks';

const STORAGE_KEY = 'lumo.workout.v1';

export type DailyStepId = 'detetive' | 'cafe' | 'passaros-perdidos';

export interface DailyStep {
  step: 1 | 2 | 3;
  id: DailyStepId;
  shortName: string;
  fullName: string;
  area: AreaId;
  areaLabel: string;
  duration: string;
  steps: [string, string];
}

export const DAILY_STEPS: DailyStep[] = [
  {
    step: 1,
    id: 'detetive',
    shortName: 'Detetive',
    fullName: 'Detetive',
    area: 'memoria',
    areaLabel: 'Memória',
    duration: 'cerca de 1 min',
    steps: [
      'Compare a carta atual com a carta anterior.',
      'Toque em SIM ou NÃO nos botões abaixo.',
    ],
  },
  {
    step: 2,
    id: 'cafe',
    shortName: 'Café',
    fullName: 'Café',
    area: 'memoria',
    areaLabel: 'Memória',
    duration: 'cerca de 1 min',
    steps: [
      'Veja os itens do pedido na ordem.',
      'Monte o pedido tocando nos botões abaixo.',
    ],
  },
  {
    step: 3,
    id: 'passaros-perdidos',
    shortName: 'Pássaros',
    fullName: 'Pássaros Perdidos',
    area: 'atencao',
    areaLabel: 'Atenção',
    duration: 'cerca de 1 min',
    steps: [
      'Olhe para onde o pássaro do meio aponta.',
      'Toque na seta da mesma direção abaixo.',
    ],
  },
];

export interface StepResult {
  hits: number;
  total: number;
  errors: number;
}

export interface WorkoutState {
  completed: DailyStepId[];
  results: Partial<Record<DailyStepId, StepResult>>;
  streakDays: number;
}

function fresh(): WorkoutState {
  return {
    completed: [],
    results: {},
    streakDays: 2,
  };
}

function load(): WorkoutState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as WorkoutState;
      if (parsed && Array.isArray(parsed.completed) && parsed.results) {
        return parsed;
      }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return fresh();
}

let state: WorkoutState = load();
const listeners = new Set<() => void>();

function commit(next: WorkoutState): void {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable */
  }
  listeners.forEach((l) => l());
}

export function useWorkout(): WorkoutState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => state,
  );
}

export function completeWorkoutStep(id: DailyStepId, result: StepResult): void {
  const completed = state.completed.includes(id) ? state.completed : [...state.completed, id];
  commit({
    ...state,
    completed,
    results: { ...state.results, [id]: result },
  });
}

export function setWorkoutPreset(preset: 'pending' | 'done'): void {
  if (preset === 'pending') {
    commit(fresh());
    return;
  }
  commit({
    completed: ['detetive', 'cafe', 'passaros-perdidos'],
    results: {
      detetive: { hits: 4, total: 4, errors: 0 },
      cafe: { hits: 3, total: 3, errors: 0 },
      'passaros-perdidos': { hits: 18, total: 20, errors: 0 },
    },
    streakDays: 2,
  });
}

export function resetWorkout(): void {
  commit(fresh());
}

export function nextPendingStepIndex(s: WorkoutState): 1 | 2 | 3 {
  const pending = DAILY_STEPS.find((d) => !s.completed.includes(d.id));
  return pending ? pending.step : 1;
}
