import { useLocation, useNavigate } from 'react-router-dom';
import { GridTasksIcon, HomeIcon, ProgressBarsIcon } from './Icons';

const TABS = [
  { to: '/', label: 'Hoje', Icon: HomeIcon, isActive: (p: string) => p === '/' },
  { to: '/tarefas', label: 'Tarefas', Icon: GridTasksIcon, isActive: (p: string) => p.startsWith('/tarefas') },
  { to: '/progresso', label: 'Progresso', Icon: ProgressBarsIcon, isActive: (p: string) => p.startsWith('/progresso') },
];

export const NAV_ROUTES = (pathname: string): boolean => TABS.some((t) => t.isActive(pathname));

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <nav aria-label="Navegação principal" className="bottom-nav">
      {TABS.map(({ to, label, Icon, isActive }) => {
        const active = isActive(pathname);
        return (
          <button
            key={to}
            type="button"
            className={`nav-item${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              if (pathname !== to) navigate(to);
            }}
          >
            <span className="nav-item__icon">
              <Icon size={22} />
            </span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}
