import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/** Go back in history when possible, otherwise fall back to a fixed route. */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [fallback, navigate]);
}
