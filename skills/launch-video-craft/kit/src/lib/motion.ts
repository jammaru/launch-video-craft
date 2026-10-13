import { Easing, interpolate, spring } from "remotion";

import { FPS } from "../theme";

/** Frames for a duration designed at 30fps. At 60fps a 16-frame rise takes 32 frames, the same half-second. */
export function span(at30: number, fps = FPS): number {
  return at30 * (fps / 30);
}

export const ease = Easing.bezier(0.65, 0, 0.35, 1);
export const settle = Easing.bezier(0.16, 1, 0.3, 1);

export function ramp(frame: number, from: number, to: number, easing = settle): number {
  return interpolate(frame, [from, to], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export type Key<K extends string> = { at: number } & Record<K, number>;

export function keyed<K extends string>(frame: number, keys: Key<K>[], prop: K): number {
  if (frame <= keys[0].at) return keys[0][prop];
  for (let index = 1; index < keys.length; index += 1) {
    const from = keys[index - 1];
    const to = keys[index];
    if (frame <= to.at) {
      const t = ramp(frame, from.at, to.at, ease);
      return from[prop] + (to[prop] - from[prop]) * t;
    }
  }
  return keys[keys.length - 1][prop];
}

/** The window spring: stiffness 170, damping 16, mass 0.9 lands in about one second. */
export function windowSpring(frame: number, fps: number, start: number): number {
  return spring({ frame: frame - start, fps, config: { stiffness: 170, damping: 16, mass: 0.9 } });
}

export function bounce(frame: number, fps: number, start: number, damping = 11): number {
  return spring({ frame: frame - start, fps, config: { stiffness: 190, damping, mass: 0.7 } });
}

/** Number of characters of `text` visible when typing starts at `start`. */
export function typed(frame: number, start: number, text: string, perFrame: number): string {
  const count = Math.max(0, Math.floor((frame - start) * perFrame));
  return text.slice(0, count);
}

export function typingEnd(start: number, text: string, perFrame: number): number {
  return start + Math.ceil(text.length / perFrame);
}
