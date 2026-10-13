import { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import demo from "../captured/demo.json";
import { AgentText, ChatLog, chatScroll, ChatSurface, Composer, logStageBox, Reveal, ToolCard, UserBubble } from "../components/Chat";
import { FramingOverlay } from "../components/Debug";
import { Backdrop, Camera, Cursor, Headline, rise, Window, type CameraKey, type CursorKey } from "../components/Stage";
import { copy } from "../copy";
import { assertFraming, fit, pointIn, stageBox, union } from "../lib/framing";
import { useAnchors } from "../lib/measure";
import { keyed, span, typed, windowSpring } from "../lib/motion";
import { beats, timing } from "./Agent.beats";

// The log in order. Each item is mounted from the start and appears at its frame.
const items = [
  { at: timing.reply, anchor: "prompt" },
  { at: timing.using, anchor: "using" },
  { at: timing.tool, anchor: "tool" },
  { at: timing.answer, anchor: "answer" },
];

export function Agent() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bodyRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const surface = useAnchors(bodyRef);
  const log = useAnchors(logRef);
  const enter = windowSpring(frame, fps, timing.windowIn);
  const scroll = chatScroll(items, log.boxes);

  const sent = frame >= timing.send + span(2);
  const text = sent ? "" : typed(frame, timing.typeStart, copy.agent.prompt, timing.typePerFrame);
  const caret = frame >= timing.focus && !sent && Math.floor((frame - timing.focus) / span(8)) % 2 === 0;

  // Composer anchors sit on the surface; log anchors scroll, so they are placed at the frame asked for.
  const boxAt = (name: string, at: number) => stageBox(surface.boxes[name]) ?? logStageBox(log.boxes[name], scroll, at);
  const composer = boxAt("composer", 0);
  const field = boxAt("composer-text", 0);
  const send = boxAt("send", 0);
  const reply = union(boxAt("tool", timing.toolCamera), boxAt("answer", timing.toolCamera));
  const typeAt = pointIn(field, { fx: 0, dx: 8 });
  const sendAt = pointIn(send);

  const camera: CameraKey[] = [
    { at: 0, x: 960, y: 540, scale: 1 },
    { at: timing.wideUntil, x: 960, y: 540, scale: 1 },
    { at: timing.composerCamera, ...fit(composer, { fill: 0.95, max: 1.8 }) },
    { at: timing.send + span(4), ...fit(composer, { fill: 0.95, max: 1.8 }) },
    { at: timing.toolCamera, ...fit(reply) },
    { at: beats.duration, ...fit(reply) },
  ];
  const cursor: CursorKey[] = [
    { at: timing.cursorIn, x: 1380, y: 900 },
    { at: timing.focusCursor, ...typeAt },
    { at: timing.focus + span(8), ...typeAt },
    { at: timing.focus + span(24), x: typeAt.x + 160, y: typeAt.y + 50 },
    { at: timing.sendCursor - span(12), x: typeAt.x + 160, y: typeAt.y + 50 },
    { at: timing.sendCursor, ...sendAt },
    { at: timing.send + span(10), ...sendAt },
    // After send the person only watches; the cursor leaves the agent's reply.
    { at: timing.toolCamera, x: sendAt.x + 400, y: sendAt.y + 300 },
  ];
  assertFraming("Agent", { beats, camera, cursor, ready: surface.ready && log.ready, boxAt });

  return (
    <AbsoluteFill>
      <Backdrop />
      <Headline text={copy.agent.headline} start={timing.headlineIn} out={timing.headlineOut} />
      <Camera keys={camera}>
        <Window title={copy.agent.title} style={rise(enter)}>
          <ChatSurface bodyRef={bodyRef}>
            <ChatLog scroll={keyed(frame, scroll, "s")} logRef={logRef}>
              <Reveal at={timing.reply} anchor="prompt">
                <UserBubble text={copy.agent.prompt} />
              </Reveal>
              <Reveal at={timing.using} anchor="using">
                <AgentText>{copy.agent.using}</AgentText>
              </Reveal>
              <Reveal at={timing.tool} anchor="tool">
                <ToolCard verb={copy.agent.ran} name={demo.command} lines={demo.lines.map((line) => ({ text: line }))} start={timing.tool + span(4)} />
              </Reveal>
              <Reveal at={timing.answer} anchor="answer">
                <AgentText>{copy.agent.answer}</AgentText>
              </Reveal>
            </ChatLog>
            <Composer text={text} placeholder={copy.agent.placeholder} chip={copy.agent.chip} caret={caret} pressed={frame >= timing.send && frame < timing.send + span(6)} />
          </ChatSurface>
        </Window>
        <Cursor from={timing.cursorIn} presses={[timing.focus, timing.send]} keys={cursor} />
        <FramingOverlay boxes={{ "composer-text": field, send, reply: boxAt("tool", frame) }} cursor={cursor} />
      </Camera>
    </AbsoluteFill>
  );
}
