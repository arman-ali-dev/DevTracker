import { useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext.jsx';

// Easy access to progress state and actions.
export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
