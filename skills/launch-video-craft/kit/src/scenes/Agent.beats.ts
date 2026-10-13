import { copy } from "../copy";
import { assertBeats } from "../lib/beats";
import { typingEnd } from "../lib/motion";
import durations from "./durations.json";

// The person types one prompt and sends it. Every step after that is the agent's:
// those beats have no cursor and no press.
const typeStart = 216;
const typePerFrame = 0.8;
const typed = typingEnd(typeStart, copy.agent.prompt, typePerFrame);

const send = Math.max(typed + 20, 280);

export const timing = {
  headlineIn: 4,
  headlineOut: 72,
  windowIn: 80,
  windowLanded: 140,
  wideUntil: 144,
  cursorIn: 132,
  composerCamera: 200,
  focusCursor: 196,
  focus: 208,
  typeStart,
  typePerFrame,
  sendCursor: send - 12,
  send,
  // When each item of the log appears; a tool card's output starts about an eighth of a second after its card.
  reply: send + 8,
  using: send + 24,
  tool: send + 48,
  answer: send + 100,
  toolCamera: send + 88,
};

if (typed > timing.sendCursor) throw new Error(`Agent: typing ends at ${typed}, after the cursor leaves for send`);

export const beats = assertBeats("Agent", {
  duration: durations.Agent,
  headline: { in: timing.headlineIn, out: timing.headlineOut, words: copy.agent.headline.split(" ").length },
  window: { in: timing.windowIn, landed: timing.windowLanded, real: { capture: "src/captured/demo.json" } },
  actions: [
    { name: "focus", target: "composer-text", camera: timing.composerCamera, cursor: timing.focusCursor, press: timing.focus, result: timing.typeStart, resultCamera: timing.typeStart, holdUntil: timing.send, scale: 1.75, proves: true },
    { name: "send", target: "send", resultTarget: "tool", camera: timing.composerCamera, cursor: timing.sendCursor, press: timing.send, result: timing.reply, resultCamera: timing.toolCamera, holdUntil: durations.Agent, scale: 1.75 },
  ],
});
