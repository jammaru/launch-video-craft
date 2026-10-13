// Copied from the launch-video-craft skill's reference.md by scripts/sync-beats.mjs. Do not edit.
import { FPS } from "../theme";

/** A duration written at 30fps, in this film's frames. One second is 30 frames there and 60 here. */
const span = (at30: number) => at30 * (FPS / 30);

export type Action = {
  name: string;
  camera: number;       // camera keyframe that lands on the control (or on the output, for a read)
  cursor?: number;      // cursor keyframe that lands on the control; omit when nobody presses (an agent's step)
  press?: number;       // omit for a read-only beat
  result: number;       // the thing the press changed is visible
  resultCamera: number; // camera keyframe that lands on the result
  holdUntil: number;    // camera leaves the result after this
  scale: number;        // camera scale at the press
  proves?: boolean;     // this is what the headline names; defaults to the first action
  target?: string;      // data-anchor pressed (or read, for a read-only beat); assertFraming checks it in space
  resultTarget?: string; // data-anchor of what the press changed; framed and uncovered during the hold
  playing?: boolean;    // the held picture moves by itself (a video plays), so a long hold is allowed
  key?: boolean;        // the press is a key (Enter), not a click: no cursor needs to be on the target
};
export type Beats = {
  duration: number;
  headline?: { in: number; out: number; words: number };
  window?: { in: number; landed: number; real: Real };
  actions: Action[];
};
/**
 * What the window shows, and where it came from. A web page the product builds: the screenshot
 * shootProduct took of it, compared with the landed frame by npm run verify. A terminal, an agent,
 * or an app that needs a server: the captured JSON file the scene renders.
 */
export type Real = { screenshot: string } | { capture: string };

export function assertBeats(id: string, b: Beats): Beats {
  const errors: string[] = [];
  const fail = (message: string) => errors.push(message);
  const { headline: h, window: w } = b;
  if (h) {
    const need = Math.max(span(30), span(3) * (h.words - 1) + span(16));
    if (h.out - h.in < need) fail(`headline is up ${h.out - h.in} frames; needs ${need} at ${FPS}fps`);
  }
  if (h && w && w.in < h.out) fail(`window rises at ${w.in}, while the headline is read until ${h.out}`);
  if (w && !w.real) fail(`the window shows the product; name where it came from (window.real: the screenshot shootProduct took, or the captured JSON)`);
  if (w && w.landed - w.in > span(36)) fail(`window takes ${w.landed - w.in} frames to land; use a stiffer spring`);
  const proof = b.actions.find((a) => a.proves) ?? b.actions[0];
  if (h && proof && proof.result - h.out > span(90) + span(12)) fail(`${proof.name}: what the headline names shows at ${proof.result}, ${proof.result - h.out} frames after it leaves (${h.out})`);
  let lastPress = -Infinity;
  for (const a of b.actions) {
    const at = a.press ?? a.result;
    if (w && at < w.landed + span(20)) fail(`${a.name}: at ${at}, the window has not settled (${w.landed})`);
    if (a.press !== undefined) {
      if (a.scale < 1.4) fail(`${a.name}: press at scale ${a.scale}; zoom to 1.4 or more first`);
      if (a.press - a.camera < span(2)) fail(`${a.name}: camera arrives at ${a.camera}, after or on the press ${a.press}`);
      if (a.cursor === undefined) {
        if (!a.key) fail(`${a.name}: a press needs a cursor keyframe`);
      }
      else if (a.press - a.cursor < span(4)) fail(`${a.name}: cursor arrives at ${a.cursor}, too close to the press ${a.press}`);
      if (a.result - a.press > span(12)) fail(`${a.name}: result ${a.result - a.press} frames after the press`);
      if (a.press - lastPress < span(30)) fail(`${a.name}: press ${a.press - lastPress} frames after the previous one`);
      lastPress = a.press;
    }
    if (a.resultCamera - a.result > span(50)) fail(`${a.name}: camera reaches the result ${a.resultCamera - a.result} frames late`);
    if (a.holdUntil - a.resultCamera < span(25)) fail(`${a.name}: result held ${a.holdUntil - a.resultCamera} frames`);
    if (a.holdUntil > b.duration) fail(`${a.name}: hold runs past the shot`);
    if (!a.playing && a.holdUntil - a.resultCamera > span(120)) fail(`${a.name}: the same picture is held ${a.holdUntil - a.resultCamera} frames; nothing changes for over 4 seconds`);
    if (!a.target) fail(`${a.name}: name the data-anchor it lands on (target), so assertFraming can check the camera and cursor`);
  }
  if (errors.length) throw new Error(`${id} beats:\n- ${errors.join("\n- ")}`);
  return b;
}
