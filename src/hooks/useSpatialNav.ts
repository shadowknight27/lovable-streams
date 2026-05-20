import { useEffect } from "react";

// Global D-pad spatial navigation. Finds nearest [data-focusable] in arrow direction.
const SELECTOR = '[data-focusable]:not([disabled]):not([aria-hidden="true"])';

function visibleFocusables(): HTMLElement[] {
  const all = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  return all.filter((el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    if (el.tabIndex < 0) el.tabIndex = 0;
    return true;
  });
}

type Dir = "up" | "down" | "left" | "right";

function pickNext(current: HTMLElement, dir: Dir): HTMLElement | null {
  const cr = current.getBoundingClientRect();
  const cx = cr.left + cr.width / 2;
  const cy = cr.top + cr.height / 2;

  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of visibleFocusables()) {
    if (el === current) continue;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    let primary = 0;
    let secondary = 0;
    switch (dir) {
      case "right":
        if (r.left < cr.right - 4) continue;
        primary = dx;
        secondary = Math.abs(dy) * 2;
        break;
      case "left":
        if (r.right > cr.left + 4) continue;
        primary = -dx;
        secondary = Math.abs(dy) * 2;
        break;
      case "down":
        if (r.top < cr.bottom - 4) continue;
        primary = dy;
        secondary = Math.abs(dx) * 1.2;
        break;
      case "up":
        if (r.bottom > cr.top + 4) continue;
        primary = -dy;
        secondary = Math.abs(dx) * 1.2;
        break;
    }
    if (primary <= 0) continue;
    const score = primary + secondary;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}

function focusEl(el: HTMLElement) {
  el.focus({ preventScroll: true });
  el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
}

export function useSpatialNav() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      // Allow typing in inputs
      if (tag === "input" || tag === "textarea") {
        if (e.key === "Escape") (document.activeElement as HTMLElement).blur();
        return;
      }

      let dir: Dir | null = null;
      if (e.key === "ArrowRight") dir = "right";
      else if (e.key === "ArrowLeft") dir = "left";
      else if (e.key === "ArrowUp") dir = "up";
      else if (e.key === "ArrowDown") dir = "down";

      if (dir) {
        e.preventDefault();
        const current = (document.activeElement as HTMLElement) || null;
        if (!current || !current.matches?.(SELECTOR)) {
          const first = visibleFocusables()[0];
          if (first) focusEl(first);
          return;
        }
        const next = pickNext(current, dir);
        if (next) focusEl(next);
        return;
      }

      if (e.key === "Enter") {
        const cur = document.activeElement as HTMLElement | null;
        if (cur && cur.matches?.(SELECTOR)) {
          e.preventDefault();
          cur.click();
        }
      }
    };
    window.addEventListener("keydown", onKey);

    // Initial focus
    const t = setTimeout(() => {
      if (!document.activeElement || document.activeElement === document.body) {
        const first = visibleFocusables()[0];
        if (first) focusEl(first);
      }
    }, 300);

    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, []);
}

// Helpers for focus restore across navigation
const KEY = "tv:lastFocusId";
export function rememberFocus(id: string) {
  try {
    sessionStorage.setItem(KEY, id);
  } catch {}
}
export function consumeRememberedFocus(): string | null {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v) sessionStorage.removeItem(KEY);
    return v;
  } catch {
    return null;
  }
}
