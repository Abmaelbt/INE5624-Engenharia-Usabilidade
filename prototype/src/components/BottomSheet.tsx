import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
}

const DISMISS_DISTANCE = 90;

/** Modal sheet rendered inside the phone frame. Closes on backdrop, Escape and swipe down. */
export default function BottomSheet({ open, onClose, labelledBy, children }: Props) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [drag, setDrag] = useState(0);
  const startY = useRef<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTarget(document.getElementById('phone-root'));
  }, []);

  useEffect(() => {
    if (!open) return;
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !target) return null;

  const onTouchStart = (e: TouchEvent) => {
    startY.current = e.touches[0]?.clientY ?? null;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (startY.current === null) return;
    const dy = (e.touches[0]?.clientY ?? 0) - startY.current;
    setDrag(Math.max(0, dy));
  };
  const onTouchEnd = () => {
    if (drag > DISMISS_DISTANCE) onClose();
    setDrag(0);
    startY.current = null;
  };

  return createPortal(
    <div className="sheet-root" data-sheet>
      <button type="button" className="sheet-backdrop" aria-label="Fechar" onClick={onClose} tabIndex={-1} />
      <div
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        style={drag ? { transform: `translateY(${drag}px)`, transition: 'none' } : undefined}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="sheet__handle" aria-hidden="true" />
        {children}
      </div>
    </div>,
    target,
  );
}
