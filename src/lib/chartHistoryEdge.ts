/**
 * Left-edge history guardian (TradingView-style buffer).
 *
 * Pro feel = never sit on an empty left gutter:
 * - Warm when approaching the buffer zone
 * - Actually prepend when the viewport gets within BUFFER bars of the oldest data
 * - Keep retrying on Netlify 503s while still in that zone
 *
 * Maintain-position shift after prepend keeps the same candles on screen, so
 * loading at ~150 (not at 0) finishes before the user can hit blank space.
 */

/** Prefetch+apply when fewer than this many bars sit left of the viewport. */
export const EDGE_LOAD_FROM = 220;
/** Start HTTP warm a bit earlier so apply is instant. */
export const EDGE_WARM_FROM = 360;
export const EDGE_POLL_MS = 850;

type EdgeGuards = {
  getChart: () => {
    timeScale: () => {
      getVisibleLogicalRange: () => { from: number; to: number } | null;
    };
  } | null;
  hasMore: () => boolean;
  loadingMore: () => boolean;
  viewReady?: () => boolean;
  loadOlder: () => Promise<boolean>;
  warm?: () => void;
};

/**
 * Start polling. Returns a disposer.
 */
export function startLeftEdgeGuardian(guards: EdgeGuards): () => void {
  let stopped = false;
  let fails = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const tick = async () => {
    if (stopped) return;
    try {
      if (guards.viewReady && !guards.viewReady()) return;
      if (!guards.hasMore() || guards.loadingMore()) return;

      const chart = guards.getChart();
      const logical = chart?.timeScale().getVisibleLogicalRange() ?? null;
      if (!logical) return;

      if (logical.from < EDGE_LOAD_FROM) {
        const ok = await guards.loadOlder();
        fails = ok ? 0 : Math.min(fails + 1, 8);
      } else if (logical.from < EDGE_WARM_FROM) {
        guards.warm?.();
        fails = 0;
      } else {
        fails = 0;
      }
    } finally {
      if (!stopped) {
        const delay = EDGE_POLL_MS + fails * 350;
        timer = setTimeout(() => {
          void tick();
        }, delay);
      }
    }
  };

  // First tick soon after mount so the buffer deepens before the first long pan.
  timer = setTimeout(() => {
    void tick();
  }, 280);

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}
