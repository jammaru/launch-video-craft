import demo from "../captured/demo.json";
import { copy } from "../copy";
import { assertBeats } from "../lib/beats";
import { typingEnd } from "../lib/motion";
import durations from "./durations.json";

// A person types a command; the product's real output answers. Frames are at the kit's 60fps:
// the same seconds as the old 30fps sheet, with twice the frames.
const focus = 208;
const typeStart = focus + 8;
const typePerFrame = 0.5;
const enter = Math.max(typingEnd(typeStart, demo.command, typePerFrame) + 12, focus + 60);

export const timing = {
  headlineIn: 4,
  headlineOut: 72,
  windowIn: 80,
  windowLanded: 140,
  wideUntil: 144,
  cursorIn: 120,
  focusCamera: 200,
  focusCursor: 196,
  focus,
  typeStart,
  typePerFrame,
  enter,
  firstLine: enter + 8,
  lineEvery: 4,
  outputCamera: enter + 60,
};

export const beats = assertBeats("Command", {
  duration: durations.Command,
  headline: { in: timing.headlineIn, out: timing.headlineOut, words: copy.command.headline.split(" ").length },
  window: { in: timing.windowIn, landed: timing.windowLanded, real: { capture: "src/captured/demo.json" } },
  actions: [
    { name: "focus", target: "prompt-ps1", camera: timing.focusCamera, cursor: timing.focusCursor, press: timing.focus, result: timing.typeStart, resultCamera: timing.typeStart, holdUntil: timing.enter, scale: 2, proves: true },
    { name: "enter", key: true, target: "prompt-ps1", resultTarget: "result", camera: timing.focusCamera, press: timing.enter, result: timing.firstLine, resultCamera: timing.outputCamera, holdUntil: durations.Command, scale: 2 },
  ],
});
