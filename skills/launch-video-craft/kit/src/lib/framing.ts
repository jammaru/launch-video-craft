import { BAR, WIN, type CameraKey, type CursorKey } from "../components/Stage";
import type { Beats } from "./beats";
import type { Box } from "./measure";
import { keyed, span } from "./motion";

/** A rectangle in stage pixels (the 1920×1080 coordinates the camera and cursor use). */
export type StageBox = { x: number; y: number; w: number; h: number };

/** Stage box of an anchor measured inside the window body, minus any scroll at that frame. */
export function stageBox(box: Box | undefined, scroll = 0): StageBox | undefined {
  if (!box) return undefined;
  return { x: WIN.x + box.x, y: WIN.y + BAR + box.y - scroll, w: box.w, h: box.h };
}

/** Moves a camera centre so a zoomed view stays inside the window instead of showing the backdrop. */
function keepInWindow(view: { x: number; y: number; scale: number }) {
  const halfW = 960 / view.scale;
  const halfH = 540 / view.scale;
  const clamp = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)));
  return {
    ...view,
    x: clamp(view.x, WIN.x + halfW, WIN.x + WIN.w - halfW),
    y: clamp(view.y, WIN.y + halfH, WIN.y + WIN.h - halfH),
  };
}

/**
 * Camera keyframe values that frame `box`: centred on it, scaled so it fills `fill` of the
 * frame's width or height, whichever binds first, clamped to [min, max], then moved so the
 * view stays inside the window. Use this instead of guessing x, y, and scale.
 */
export function fit(box: StageBox | undefined, { fill = 0.62, min = 1.4, max = 2.4 } = {}) {
  if (!box) return { x: 960, y: 540, scale: 1 };
  const scale = Math.max(min, Math.min(max, (1920 * fill) / box.w, (1080 * fill) / box.h));
  return keepInWindow({ x: box.x + box.w / 2, y: box.y + box.h / 2, scale });
}

/** Where the cursor goes on a measured box: a fraction of its size plus a pixel offset. */
export function pointIn(box: StageBox | undefined, { fx = 0.5, fy = 0.5, dx = 0, dy = 0 } = {}) {
  // Off stage until measured, never a plausible guess; assertFraming names the missing anchor.
  if (!box) return { x: -400, y: -400 };
  return { x: box.x + box.w * fx + dx, y: box.y + box.h * fy + dy };
}

/** The smallest box around several anchors (a command line and its output, a card and its caption). */
export function union(...boxes: (StageBox | undefined)[]): StageBox | undefined {
  const real = boxes.filter((b): b is StageBox => Boolean(b));
  if (!real.length) return undefined;
  const x = Math.min(...real.map((b) => b.x));
  const y = Math.min(...real.map((b) => b.y));
  return { x, y, w: Math.max(...real.map((b) => b.x + b.w)) - x, h: Math.max(...real.map((b) => b.y + b.h)) - y };
}

/** Frame `box` by its left edge instead of its centre, for lines of text that start at the left. */
export function fitLeft(box: StageBox | undefined, options: { fill?: number; min?: number; max?: number; margin?: number } = {}) {
  const view = fit(box, options);
  if (!box) return view;
  const margin = options.margin ?? 40;
  return keepInWindow({ ...view, x: Math.max(view.x, box.x - margin + 960 / view.scale) });
}

export function viewAt(camera: CameraKey[], frame: number) {
  const scale = keyed(frame, camera, "scale");
  const x = keyed(frame, camera, "x");
  const y = keyed(frame, camera, "y");
  const w = 1920 / scale;
  const h = 1080 / scale;
  return { scale, x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2, w, h };
}

const inside = (p: { x: number; y: number }, b: StageBox, pad = 0) =>
  p.x >= b.x - pad && p.x <= b.x + b.w + pad && p.y >= b.y - pad && p.y <= b.y + b.h + pad;

/**
 * Checks the beat sheet in space, the way assertBeats checks it in time. For each action:
 * - its `target` (and `resultTarget`) was measured; no silent fallback position
 * - at the press, the cursor tip is on the target and the whole target is in view, clear of the edges
 * - a zoomed view shows the product, not the backdrop around the window
 * - during the hold, the camera is zoomed (1.4+), the result is entirely in view, fills a
 *   readable share of the frame, stays put (no scroll under a parked camera), and the cursor
 *   has left the view
 * `boxAt(name, frame)` returns the anchor in stage pixels at that frame (pass scroll there).
 * Throws once the anchors are measured, so a miss stops the render with the reason.
 */
export function assertFraming(
  id: string,
  {
    beats,
    camera,
    cursor,
    ready,
    boxAt,
  }: {
    beats: Beats;
    camera: CameraKey[];
    cursor?: CursorKey[];
    ready: boolean;
    boxAt: (name: string, frame: number) => StageBox | undefined;
  },
) {
  if (!ready) return;
  const errors: string[] = [];
  const fail = (message: string) => errors.push(message);
  const round = (n: number) => Math.round(n);
  const outsideWindow = (name: string, view: ReturnType<typeof viewAt>, frame: number) => {
    if (view.scale < 1.2) return;
    const w = Math.max(0, Math.min(view.x1, WIN.x + WIN.w) - Math.max(view.x0, WIN.x));
    const h = Math.max(0, Math.min(view.y1, WIN.y + WIN.h) - Math.max(view.y0, WIN.y));
    const outside = 1 - (w * h) / (view.w * view.h);
    if (outside > 0.1) fail(`${name}: ${Math.round(outside * 100)}% of the view at ${frame} is backdrop outside the window; frame the product (fit() keeps the view inside)`);
  };
  for (const a of beats.actions) {
    if (!a.target) continue;
    const target = boxAt(a.target, a.press ?? a.resultCamera);
    if (!target) {
      fail(`${a.name}: no [data-anchor="${a.target}"] was measured; fix the anchor, do not fall back to a guessed position`);
      continue;
    }
    if (a.press !== undefined) {
      const view = viewAt(camera, a.press);
      if (cursor && !a.key) {
        const tip = { x: keyed(a.press, cursor, "x"), y: keyed(a.press, cursor, "y") };
        if (!inside(tip, target, 4)) {
          const dx = Math.max(target.x - tip.x, 0, tip.x - (target.x + target.w));
          const dy = Math.max(target.y - tip.y, 0, tip.y - (target.y + target.h));
          fail(`${a.name}: the cursor presses at (${round(tip.x)}, ${round(tip.y)}), ${round(Math.hypot(dx, dy))}px off "${a.target}" (${round(target.x)}, ${round(target.y)}, ${round(target.w)}×${round(target.h)})`);
        }
      }
      const m = 8;
      if (target.x < view.x0 + m || target.y < view.y0 + m || target.x + target.w > view.x1 - m || target.y + target.h > view.y1 - m) {
        fail(`${a.name}: at the press the camera looks at (${round((view.x0 + view.x1) / 2)}, ${round((view.y0 + view.y1) / 2)}) at scale ${view.scale.toFixed(2)}; "${a.target}" (${round(target.x)}, ${round(target.y)}, ${round(target.w)}×${round(target.h)}) is not fully inside the view`);
      }
      if (view.scale < 1.4) fail(`${a.name}: the camera is at scale ${view.scale.toFixed(2)} when "${a.target}" is pressed`);
      outsideWindow(a.name, view, a.press);
    }
    const read = a.resultTarget ?? (a.press === undefined ? a.target : undefined);
    if (!read) continue;
    const first = boxAt(read, a.resultCamera);
    if (!first) {
      fail(`${a.name}: no [data-anchor="${read}"] was measured`);
      continue;
    }
    for (let f = a.resultCamera; f <= a.holdUntil; f += 3) {
      const box = boxAt(read, f);
      const view = viewAt(camera, f);
      if (!box) break;
      if (view.scale < 1.4) {
        fail(`${a.name}: the camera is at scale ${view.scale.toFixed(2)} at ${f} while "${read}" is held; a result is read zoomed (1.4 or more), so name one element as resultTarget, not the whole page`);
        break;
      }
      if (box.w > view.w || box.h > view.h) {
        fail(`${a.name}: "${read}" (${round(box.w)}×${round(box.h)}) is larger than the view at scale ${view.scale.toFixed(2)} (frame ${f}); anchor the sentence, not its container, or use fit()`);
        break;
      }
      const m = 8;
      if (box.x < view.x0 + m || box.y < view.y0 + m || box.x + box.w > view.x1 - m || box.y + box.h > view.y1 - m) {
        fail(`${a.name}: "${read}" is cut off by the frame at ${f} (box ${round(box.x)},${round(box.y)} ${round(box.w)}×${round(box.h)}; view ${round(view.x0)},${round(view.y0)} ${round(view.w)}×${round(view.h)})`);
        break;
      }
      if (Math.abs(box.y - first.y) > 6) {
        fail(`${a.name}: "${read}" moves ${round(box.y - first.y)}px while the camera holds it (frame ${f}); stop the scroll before the camera lands`);
        break;
      }
      if (cursor && f > (a.press ?? -1) + 12) {
        const tip = { x: keyed(f, cursor, "x"), y: keyed(f, cursor, "y") };
        if (inside(tip, box, 6)) {
          fail(`${a.name}: the cursor sits on "${read}" at ${f}; move it out of the way while the result is read`);
          break;
        }
        if (f >= a.resultCamera + span(6) && inside(tip, { x: view.x0, y: view.y0, w: view.w, h: view.h }, 30)) {
          fail(`${a.name}: the cursor is still in view at ${f} (${round(tip.x)}, ${round(tip.y)}) while "${read}" is read; move it out of the view`);
          break;
        }
      }
    }
    const view = viewAt(camera, a.resultCamera);
    outsideWindow(a.name, view, a.resultCamera);
    const share = Math.max(first.w / view.w, first.h / view.h);
    if (share < 0.35) fail(`${a.name}: "${read}" fills ${Math.round(share * 100)}% of the view at ${a.resultCamera}; zoom until it fills at least 35% (fit() does this)`);
  }
  // One line: Remotion shows only the first line of an error thrown while rendering.
  if (errors.length) throw new Error(`${id} framing: ${errors.join(" | ")}`);
}
