"use client";

import { useCallback, useRef, useState } from "react";

const UNDO_WINDOW_MS = 5000;

/**
 * Generic "delete, but give the user a few seconds to undo" pattern: the
 * item is hidden immediately (caller filters its list against `isPending`),
 * and the real server delete only actually runs once the window elapses
 * without being cancelled.
 */
export function useUndoableDelete() {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const schedule = useCallback((id: string, commit: () => void | Promise<void>) => {
    setPendingIds((prev) => new Set(prev).add(id));

    const timer = setTimeout(() => {
      timers.current.delete(id);
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      void commit();
    }, UNDO_WINDOW_MS);

    timers.current.set(id, timer);
  }, []);

  const cancel = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isPending = useCallback((id: string) => pendingIds.has(id), [pendingIds]);

  return { schedule, cancel, isPending, undoWindowMs: UNDO_WINDOW_MS };
}
