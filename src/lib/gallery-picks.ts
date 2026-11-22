import { useEffect, useState } from "react";

// Per-tab pick list for gallery photos the customer wants to reference in a
// custom request. sessionStorage so it survives tab reloads but doesn't bleed
// into long-term state. Cleared on tab close by design.

const STORAGE_KEY = "kk_engravings.gallery_picks.v1";
const EVENT_NAME = "kk:gallery-picks-changed";
export const MAX_PICKS = 15;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string").slice(0, MAX_PICKS);
  } catch {
    return [];
  }
}

function write(next: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // ignore quota / private-mode failures
  }
}

export function getPicks(): string[] {
  return read();
}

export function hasPick(slug: string): boolean {
  return read().includes(slug);
}

export function togglePick(slug: string): { added: boolean; atLimit: boolean } {
  const current = read();
  if (current.includes(slug)) {
    write(current.filter((s) => s !== slug));
    return { added: false, atLimit: false };
  }
  if (current.length >= MAX_PICKS) {
    return { added: false, atLimit: true };
  }
  write([...current, slug]);
  return { added: true, atLimit: false };
}

export function removePick(slug: string): void {
  const current = read();
  if (!current.includes(slug)) return;
  write(current.filter((s) => s !== slug));
}

export function clearPicks(): void {
  write([]);
}

// Hook — subscribes to pick-list changes across all mounted consumers in this tab.
export function usePicks(): string[] {
  const [picks, setPicks] = useState<string[]>(() => read());
  useEffect(() => {
    const onChange = () => setPicks(read());
    window.addEventListener(EVENT_NAME, onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
    };
  }, []);
  return picks;
}
