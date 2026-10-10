import { copy } from "../copy";
import { assertBeats } from "../lib/beats";
import { typingEnd } from "../lib/motion";
import durations from "./durations.json";

// The person types one prompt and sends it. Every step after that is the agent's:
// those beats have no cursor and no press.
const typeStart = 108;
const typePerFrame = 1.6;
const typed = typingEnd(typeStart, copy.agent.prompt, typePerFrame);

const send = Math.max(typed + 10, 140);

export const timing = {
  headlineIn: 2,
  headlineOut: 36,
  windowIn: 40,
  windowLanded: 70,
  wideUntil: 72,
  cursorIn: 66,
  composerCamera: 100,
  focusCursor: 98,
  focus: 104,
  typeStart,
  typePerFrame,
  sendCursor: send - 6,
  send,
  reply: send + 4,
  skill: send + 8,
  tool: send + 20,
  toolOutput: send + 32,
  toolCamera: send + 44,
  answer: send + 50,
};

if (typed > timing.sendCursor) throw new Error(`Agent: typing ends at ${typed}, after the cursor leaves for send`);

export const beats = assertBeats("Agent", {
  duration: durations.Agent,
  headline: { in: timing.headlineIn, out: timing.headlineOut, words: copy.agent.headline.split(" ").length },
  window: { in: timing.windowIn, landed: timing.windowLanded },
  actions: [
    { name: "focus", camera: timing.composerCamera, cursor: timing.focusCursor, press: timing.focus, result: timing.typeStart, resultCamera: timing.typeStart, holdUntil: timing.send, scale: 1.9, proves: true },
    { name: "send", camera: timing.composerCamera, cursor: timing.sendCursor, press: timing.send, result: timing.skill, resultCamera: timing.toolCamera, holdUntil: durations.Agent, scale: 1.9 },
    { name: "tool output", camera: timing.toolCamera, result: timing.toolOutput, resultCamera: timing.toolCamera, holdUntil: durations.Agent, scale: 2 },
  ],
});
