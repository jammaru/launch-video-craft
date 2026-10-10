import demo from "../captured/demo.json";
import { copy } from "../copy";
import { assertBeats } from "../lib/beats";
import { typingEnd } from "../lib/motion";
import durations from "./durations.json";

// A person types a command; the product's real output answers.
const focus = 104;
const typeStart = focus + 4;
const typePerFrame = 1;
const enter = Math.max(typingEnd(typeStart, demo.command, typePerFrame) + 6, focus + 30);

export const timing = {
  headlineIn: 2,
  headlineOut: 36,
  windowIn: 40,
  windowLanded: 70,
  wideUntil: 72,
  cursorIn: 60,
  focusCamera: 100,
  focusCursor: 98,
  focus,
  typeStart,
  typePerFrame,
  enter,
  firstLine: enter + 4,
  lineEvery: 2,
  outputCamera: enter + 30,
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
