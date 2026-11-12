const KEY = 'cbaom:booted';

export function hasBooted() {
  try {
    return !!sessionStorage.getItem(KEY);
  } catch {
    return true;
  }
}

export function markBooted() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

// Delay (seconds) for hero animations so they start after the loading screen.
export const bootDelay = () => (hasBooted() ? 0.15 : 1.9);
