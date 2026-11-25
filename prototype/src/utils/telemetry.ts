import { useSyncExternalStore } from 'react';

/**
 * Silent usability telemetry (ISO 9241-11: effectiveness, efficiency).
 * Stored only in localStorage; nothing leaves the device.
 */
const STORAGE_KEY = 'lumo.telemetry.v1';
const MAX_EVENTS = 5000;

export type EventType =
  | 'session_start'
  | 'screen_view'
  | 'tap'
  | 'task_timer_start'
  | 'task_timer_end'
  | 'ipl_help_opened'
  | 'premium_sheet_opened'
  | 'sheet_opened'
  | 'practice_attempt'
  | 'practice_completed';

export type TimerId = 'T2' | 'T3';
export type Outcome = 'autonomous' | 'assisted';
export type EventData = Record<string, string | number | boolean>;

export interface TelemetryEvent {
  t: number;
  type: EventType;
  path: string;
  data?: EventData;
}

export interface TaskTimer {
  startedAt: number | null;
  endedAt: number | null;
  outcome: Outcome | null;
}

export interface TelemetryState {
  sessionId: string;
  startedAt: number;
  events: TelemetryEvent[];
  timers: Record<TimerId, TaskTimer>;
}

export interface TaskSummary {
  id: TimerId;
  status: 'idle' | 'running' | 'done';
  elapsedMs: number;
  taps: number;
  premiumOpens: number;
  practiceErrors: number;
  outcome: Outcome | null;
}

const emptyTimer = (): TaskTimer => ({ startedAt: null, endedAt: null, outcome: null });

function currentPath(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

function fresh(): TelemetryState {
  const now = Date.now();
  return {
    sessionId: `s-${now.toString(36)}`,
    startedAt: now,
    events: [{ t: now, type: 'session_start', path: currentPath() }],
    timers: { T2: emptyTimer(), T3: emptyTimer() },
  };
}

function load(): TelemetryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TelemetryState;
      if (parsed && Array.isArray(parsed.events) && parsed.timers) return parsed;
    }
  } catch {
    /* ignore corrupted storage */
  }
  return fresh();
}

let state: TelemetryState = load();
const listeners = new Set<() => void>();

function commit(next: TelemetryState): void {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable */
  }
  listeners.forEach((l) => l());
}

export function track(type: EventType, data?: EventData): void {
  const event: TelemetryEvent = { t: Date.now(), type, path: currentPath(), ...(data ? { data } : {}) };
  const events = [...state.events, event];
  commit({ ...state, events: events.length > MAX_EVENTS ? events.slice(-MAX_EVENTS) : events });
}

export function startTimer(id: TimerId): void {
  const now = Date.now();
  const timers = { ...state.timers, [id]: { startedAt: now, endedAt: null, outcome: null } };
  commit({ ...state, timers });
  track('task_timer_start', { task: id });
}

export function finishTimer(id: TimerId, outcome: Outcome): void {
  const timer = state.timers[id];
  if (!timer.startedAt || timer.endedAt) return;
  const timers = { ...state.timers, [id]: { ...timer, endedAt: Date.now(), outcome } };
  commit({ ...state, timers });
  track('task_timer_end', { task: id, outcome });
}

export function resetSession(): void {
  commit(fresh());
}

export function getState(): TelemetryState {
  return state;
}

export function useTelemetry(): TelemetryState {
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

export function summarize(s: TelemetryState, now = Date.now()): TaskSummary[] {
  return (['T2', 'T3'] as TimerId[]).map((id) => {
    const timer = s.timers[id];
    if (!timer.startedAt) {
      return { id, status: 'idle', elapsedMs: 0, taps: 0, premiumOpens: 0, practiceErrors: 0, outcome: null };
    }
    const end = timer.endedAt ?? now;
    const inWindow = s.events.filter((e) => e.t >= timer.startedAt! && e.t <= end);
    return {
      id,
      status: timer.endedAt ? 'done' : 'running',
      elapsedMs: end - timer.startedAt,
      taps: inWindow.filter((e) => e.type === 'tap').length,
      premiumOpens: inWindow.filter((e) => e.type === 'premium_sheet_opened').length,
      practiceErrors: inWindow.filter((e) => e.type === 'practice_attempt' && e.data?.correct === false).length,
      outcome: timer.outcome,
    };
  });
}

function download(filename: string, mime: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportJson(): void {
  const payload = { ...state, summary: summarize(state), exportedAt: new Date().toISOString() };
  download(`lumo-telemetry-${state.sessionId}.json`, 'application/json', JSON.stringify(payload, null, 2));
}

export function exportCsv(): void {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = ['session_id,timestamp_iso,elapsed_ms,type,path,data'];
  for (const e of state.events) {
    rows.push(
      [
        esc(state.sessionId),
        esc(new Date(e.t).toISOString()),
        String(e.t - state.startedAt),
        esc(e.type),
        esc(e.path),
        esc(e.data ? JSON.stringify(e.data) : ''),
      ].join(','),
    );
  }
  rows.push('');
  rows.push('task,status,elapsed_ms,taps,premium_opens,practice_errors,outcome');
  for (const s of summarize(state)) {
    rows.push([s.id, s.status, s.elapsedMs, s.taps, s.premiumOpens, s.practiceErrors, s.outcome ?? ''].join(','));
  }
  download(`lumo-telemetry-${state.sessionId}.csv`, 'text/csv', rows.join('\n'));
}
