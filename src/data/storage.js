// Persistence layer (localStorage): the bracket survives a page refresh and
// is shared between browser tabs. To be replaced by server calls later.
// No UI here, easy to test: the storage can be injected.

export const STORAGE_KEYS = {
  tournaments: "laligue:tournaments",
  registrations: "laligue:registrations",
};

function defaultStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null; // storage blocked (private mode, etc.)
  }
}

/** Reads a saved list, or returns `fallback` if nothing valid is saved. */
export function loadList(name, fallback, storage = defaultStorage()) {
  try {
    const raw = storage?.getItem(STORAGE_KEYS[name]);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/** Saves a list. Does not write when nothing changed (avoids tab ping-pong). */
export function saveList(name, list, storage = defaultStorage()) {
  try {
    const raw = JSON.stringify(list);
    if (storage?.getItem(STORAGE_KEYS[name]) !== raw) {
      storage?.setItem(STORAGE_KEYS[name], raw);
    }
  } catch {
    // Quota exceeded or storage unavailable: the app keeps working in memory.
  }
}

/**
 * Calls `callback(name)` when ANOTHER tab changes a saved list
 * (the "storage" event never fires in the tab that wrote). Returns a stop function.
 */
export function onExternalChange(callback, target = globalThis) {
  const handler = (event) => {
    const name = Object.keys(STORAGE_KEYS).find(
      (k) => STORAGE_KEYS[k] === event.key,
    );
    if (name) callback(name);
  };
  target.addEventListener?.("storage", handler);
  return () => target.removeEventListener?.("storage", handler);
}
