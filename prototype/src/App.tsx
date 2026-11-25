import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import BottomNav, { NAV_ROUTES } from './components/BottomNav';
import FacilitatorPanel from './components/FacilitatorPanel';
import AreaDetailScreen from './screens/AreaDetailScreen';
import HomeScreen from './screens/HomeScreen';
import PracticeGameScreen from './screens/PracticeGameScreen';
import PremiumInfoScreen from './screens/PremiumInfoScreen';
import ProgressScreen from './screens/ProgressScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import TasksScreen from './screens/TasksScreen';
import WorkoutCompleteScreen from './screens/WorkoutCompleteScreen';
import { track } from './utils/telemetry';

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    track('screen_view');
  }, [pathname]);

  // Silent tap counter. Facilitator controls are excluded.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as Element | null;
      if (el?.closest('[data-facilitator]')) return;
      track('tap');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return (
    <div className="stage">
      <div className="phone" id="phone-root">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/treino-concluido" element={<WorkoutCompleteScreen />} />
          <Route path="/progresso" element={<ProgressScreen />} />
          <Route path="/progresso/:areaId" element={<AreaDetailScreen />} />
          <Route path="/tarefas" element={<TasksScreen />} />
          <Route path="/tarefa/:taskId" element={<TaskDetailScreen />} />
          <Route path="/pratica/:taskId" element={<PracticeGameScreen />} />
          <Route path="/premium" element={<PremiumInfoScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {NAV_ROUTES(pathname) && <BottomNav />}
      </div>
      <FacilitatorPanel />
    </div>
  );
}
