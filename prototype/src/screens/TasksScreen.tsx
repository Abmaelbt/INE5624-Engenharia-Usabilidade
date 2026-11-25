import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BottomSheet from '../components/BottomSheet';
import { CheckIcon, CloseIcon, LockIcon, PlayIcon, SearchIcon, ShieldCheckIcon, TaskIcon } from '../components/Icons';
import { AREA_COLOR, FEATURED_PREMIUM_ID, TASKS, findTask, type AreaId, type Task } from '../data/tasks';
import { useSecretTaps } from '../utils/facilitatorStore';
import { normalizeText } from '../utils/normalize';
import { useSheet } from '../utils/useSheet';

type Filter = 'todas' | AreaId;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'memoria', label: 'Memória' },
  { id: 'atencao', label: 'Atenção' },
  { id: 'velocidade', label: 'Veloc.' },
];

const AREA_NAME: Record<AreaId, string> = { memoria: 'Memória', atencao: 'Atenção', velocidade: 'Velocidade' };

const parseFilter = (v: string | null): Filter =>
  v === 'memoria' || v === 'atencao' || v === 'velocidade' ? v : 'todas';

function countLabel(n: number, filter: Filter, searching: boolean): string {
  if (searching) return `${n} ${n === 1 ? 'resultado' : 'resultados'}`;
  const noun = n === 1 ? 'tarefa' : 'tarefas';
  return filter === 'todas' ? `${n} ${noun}` : `${n} ${noun} de ${AREA_NAME[filter]}`;
}

/** T3.A / T3.B: task catalog with search and area filter (plus T3.B2 sheet). */
export default function TasksScreen() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const sheet = useSheet();
  const onSecretTap = useSecretTaps();
  const filter = parseFilter(params.get('area'));
  const [query, setQuery] = useState('');
  const freeRef = useRef<HTMLDivElement>(null);

  const q = normalizeText(query);
  const match = (t: Task) =>
    (filter === 'todas' || t.area === filter) && (!q || normalizeText(`${t.name} ${t.areaLabel} ${t.subtitle}`).includes(q));

  const free = TASKS.filter((t) => !t.premium && match(t));
  let premium = TASKS.filter((t) => t.premium && match(t));
  // The design previews a single optional Premium task in the unfiltered view.
  if (filter === 'todas' && !q) premium = premium.filter((t) => t.id === FEATURED_PREMIUM_ID);

  const setFilter = (id: Filter) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === 'todas') next.delete('area');
        else next.set('area', id);
        return next;
      },
      { replace: true },
    );

  const premiumTask = sheet.name === 'premium-task' ? findTask(sheet.params.get('task') ?? '') : undefined;
  const alternatives = premiumTask
    ? (() => {
        const same = TASKS.filter((t) => !t.premium && t.area === premiumTask.area);
        return same.length ? same : TASKS.filter((t) => !t.premium).slice(0, 2);
      })()
    : [];
  const sameArea = premiumTask ? alternatives.every((t) => t.area === premiumTask.area) : false;

  return (
    <main className="screen" style={{ gap: 14 }}>
      <h1 className="h1" onClick={onSecretTap}>Tarefas</h1>

      <div className="search">
        <label htmlFor="busca" className="sr-only">Buscar tarefa</label>
        <SearchIcon size={20} color="var(--color-text-subtle)" stroke={2.4} />
        <input
          id="busca"
          type="search"
          inputMode="search"
          placeholder="Buscar tarefa"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button type="button" className="search__clear" aria-label="Limpar busca" onClick={() => setQuery('')}>
            <CloseIcon size={18} color="var(--color-text-subtle)" stroke={2.4} />
          </button>
        )}
      </div>

      <div className="chips" role="group" aria-label="Filtrar por área">
        {FILTERS.map((f) => (
          <button key={f.id} type="button" className="chip" data-area={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {filter === f.id && f.id !== 'todas' && <CheckIcon size={14} stroke={3.2} />}
            {f.label}
          </button>
        ))}
      </div>

      <div ref={freeRef} className="section-head">
        <h2 className="h2">Grátis pra você</h2>
        <span className="section-head__aside" aria-live="polite">{countLabel(free.length, filter, Boolean(q))}</span>
      </div>

      <div className="stack-10">
        {free.map((t) => (
          <article
            key={t.id}
            className="task-row"
            style={{ ['--tile-color' as string]: AREA_COLOR[t.area], ['--area-color' as string]: AREA_COLOR[t.area] }}
          >
            <div className="task-tile">
              <TaskIcon kind={t.icon} size={28} stroke={2.2} />
            </div>
            <div className="task-row__body">
              <span className="task-row__name">{t.name}</span>
              <span className="task-row__area">{filter === 'todas' ? t.areaLabel : t.subtitle}</span>
            </div>
            <button type="button" className="btn btn--primary btn--sm" aria-label={`Praticar ${t.name}`} onClick={() => navigate(`/tarefa/${t.id}`)}>
              Praticar
            </button>
          </article>
        ))}
        {free.length === 0 && (
          <div className="empty-state" role="status">
            <strong style={{ color: 'var(--color-text)' }}>Nenhuma tarefa grátis encontrada</strong>
            <span>Tente outro nome ou outra área.</span>
            {(q || filter !== 'todas') && (
              <button
                type="button"
                className="link-underline"
                onClick={() => {
                  setQuery('');
                  setFilter('todas');
                }}
              >
                Limpar busca
              </button>
            )}
          </div>
        )}
      </div>

      {premium.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 8 }}>
            <h2 className="h2 row" style={{ gap: 8, fontSize: 17 }}>
              <LockIcon size={18} color="var(--color-text-subtle)" stroke={2} />
              Premium
            </h2>
            <span className="section-head__aside">opcional</span>
          </div>
          <div className="stack-10">
            {premium.map((t) => (
              <button
                key={t.id}
                type="button"
                className="task-row task-row--premium"
                style={{ ['--area-color' as string]: 'var(--color-text-muted)' }}
                aria-label={`${t.name}, Premium`}
                onClick={() => sheet.open('premium-task', { task: t.id })}
              >
                <div className="task-tile task-tile--premium">
                  <TaskIcon kind={t.icon} size={28} stroke={2.2} />
                </div>
                <div className="task-row__body">
                  <span className="task-row__name">{t.name}</span>
                  <span className="task-row__area">{t.areaLabel}</span>
                </div>
                <span className="premium-pill">
                  <LockIcon size={12} stroke={2.6} />
                  PREMIUM
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <BottomSheet open={Boolean(premiumTask)} onClose={sheet.close} labelledBy="premium-task-title">
        {premiumTask && (
          <>
            <div className="sheet__head">
              <div className="sheet__icon" style={{ background: 'var(--color-premium-bg)' }}>
                <LockIcon size={22} color="var(--color-text)" />
              </div>
              <h2 id="premium-task-title" className="sheet__title">Esta tarefa é Premium</h2>
            </div>
            <p className="sheet__text" style={{ lineHeight: 1.45 }}>
              <strong>{premiumTask.name}</strong> faz parte da assinatura. Você pode praticar{' '}
              {sameArea ? `${premiumTask.areaLabel} agora` : 'agora'} com estas tarefas grátis:
            </p>
            <div className="stack-10">
              {alternatives.map((t) => (
                <div key={t.id} className="sheet-task" style={{ ['--tile-color' as string]: AREA_COLOR[t.area] }}>
                  <div className="task-tile">
                    <TaskIcon kind={t.icon} size={24} stroke={2} />
                  </div>
                  <span className="sheet-task__name">{t.name}</span>
                  <button
                    type="button"
                    className="btn btn--sm btn--soft"
                    aria-label={`Praticar ${t.name}`}
                    onClick={() => sheet.goAndClose(`/tarefa/${t.id}`)}
                  >
                    <PlayIcon size={12} />
                    Praticar
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                sheet.close();
                window.setTimeout(() => freeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
              }}
            >
              Ver tarefas grátis
            </button>
            <button type="button" className="link-underline" onClick={() => sheet.goAndClose('/premium')}>
              Conhecer o Premium
            </button>
            <p className="sheet__foot">
              <ShieldCheckIcon size={16} color="var(--color-text-muted)" /> Nenhuma cobrança sem a sua confirmação.
            </p>
          </>
        )}
      </BottomSheet>
    </main>
  );
}
