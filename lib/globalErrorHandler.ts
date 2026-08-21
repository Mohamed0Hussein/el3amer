/**
 * Catches JS errors thrown outside React's render phase (event handlers,
 * timers, non-awaited async code) — the class ErrorBoundary only sees
 * errors thrown during render/lifecycle, so this is the complementary net.
 * Call once, as early as possible (module scope of the root layout).
 */
export function setupGlobalErrorHandler() {
  const defaultHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error(`[GlobalError] ${isFatal ? 'FATAL' : 'non-fatal'}:`, error);
    defaultHandler(error, isFatal);
  });
}
