import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { track } from './telemetry';

interface SheetState {
  sheet?: boolean;
}

/**
 * Bottom sheets live in the URL (`?sheet=name`) so the Android back button
 * closes them before leaving the screen.
 */
export function useSheet() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const openedByUs = Boolean((location.state as SheetState | null)?.sheet);
  const name = params.get('sheet');

  const open = useCallback(
    (sheet: string, extra: Record<string, string> = {}) => {
      const next = new URLSearchParams(location.search);
      next.set('sheet', sheet);
      Object.entries(extra).forEach(([k, v]) => next.set(k, v));
      track('sheet_opened', { sheet });
      if (sheet === 'ipl') track('ipl_help_opened');
      if (sheet.startsWith('premium')) track('premium_sheet_opened', { sheet, ...extra });
      navigate({ search: `?${next.toString()}` }, { state: { sheet: true } satisfies SheetState });
    },
    [location.search, navigate],
  );

  const close = useCallback(() => {
    if (openedByUs) {
      navigate(-1);
      return;
    }
    const next = new URLSearchParams(location.search);
    ['sheet', 'task', 'feature'].forEach((k) => next.delete(k));
    const search = next.toString();
    navigate({ search: search ? `?${search}` : '' }, { replace: true });
  }, [location.search, navigate, openedByUs]);

  /** Navigate away from a sheet without leaving the sheet entry in history. */
  const goAndClose = useCallback(
    (to: string) => {
      navigate(to, { replace: openedByUs });
    },
    [navigate, openedByUs],
  );

  return { name, params, open, close, goAndClose };
}
