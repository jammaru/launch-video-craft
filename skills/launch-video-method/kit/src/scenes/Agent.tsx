import { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import demo from "../captured/demo.json";
import { AgentText, CHAT, ChatSurface, Composer, SkillUse, ToolCard, UserBubble, WorkingBar } from "../components/Chat";
import { FramingOverlay } from "../components/Debug";
import { Backdrop, Camera, Cursor, Headline, rise, Window, type CameraKey, type CursorKey } from "../components/Stage";
import { copy } from "../copy";
import { assertFraming, fit, pointIn, stageBox } from "../lib/framing";
import { useAnchors } from "../lib/measure";
import { typed, windowSpring } from "../lib/motion";
import { beats, timing } from "./Agent.beats";

export function Agent() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { boxes, ready } = useAnchors(bodyRef);
  const enter = windowSpring(frame, fps, timing.windowIn);

  const sent = frame >= timing.send + 2;
  const text = sent ? "" : typed(frame, timing.typeStart, copy.agent.prompt, timing.typePerFrame);
  const caret = frame >= timing.focus && !sent && Math.floor((frame - timing.focus) / 9) % 2 === 0;

  const boxAt = (name: string) => stageBox(boxes[name]);
  const composer = boxAt("composer");
  const field = boxAt("composer-text");
  const send = boxAt("send");
  const reply = boxAt("reply");
  const typeAt = pointIn(field, { fx: 0, dx: 8 });
  const sendAt = pointIn(send);

  const camera: CameraKey[] = [
    { at: 0, x: 960, y: 540, scale: 1 },
    { at: timing.wideUntil, x: 960, y: 540, scale: 1 },
    { at: timing.composerCamera, ...fit(composer, { fill: 0.75, max: 1.9 }) },
    { at: timing.send + 4, ...fit(composer, { fill: 0.75, max: 1.9 }) },
    { at: timing.toolCamera, ...fit(reply) },
    { at: beats.duration, ...fit(reply) },
  ];
  const cursor: CursorKey[] = [
    { at: timing.cursorIn, x: 1380, y: 900 },
    { at: timing.focusCursor, ...typeAt },
    { at: timing.focus + 8, ...typeAt },
    { at: timing.focus + 24, x: typeAt.x + 120, y: typeAt.y + 110 },
    { at: timing.sendCursor - 12, x: typeAt.x + 120, y: typeAt.y + 110 },
    { at: timing.sendCursor, ...sendAt },
    { at: timing.send + 10, ...sendAt },
    // After send the person only watches; the cursor leaves the agent's reply.
    { at: timing.toolCamera, x: sendAt.x + 400, y: sendAt.y + 300 },
  ];
  assertFraming("Agent", { beats, camera, cursor, ready, boxAt });

  return (
    <AbsoluteFill>
      <Backdrop />
      <Headline text={copy.agent.headline} start={timing.headlineIn} out={timing.headlineOut} />
      <Camera keys={camera}>
        <Window title={demo.cwd} style={rise(enter)}>
          <ChatSurface title={copy.agent.title} bodyRef={bodyRef}>
            <UserBubble text={copy.agent.prompt} at={timing.reply} />
            <div data-anchor="reply" style={{ position: "absolute", left: CHAT.column.x, width: CHAT.column.w, top: 170 }}>
              <SkillUse at={timing.skill} label={copy.agent.skillLabel} name={copy.agent.skillName} file={copy.agent.skillFile} />
              <ToolCard at={timing.tool} verb={copy.agent.ran} command={demo.command} output={demo.lines.map((line) => ({ text: line }))} outputAt={timing.toolOutput} anchor="tool" />
              <AgentText at={timing.answer}>{copy.agent.answer}</AgentText>
            </div>
            {/* Both stay mounted, so the composer and Send are measured on every frame. */}
            <div style={{ visibility: sent ? "hidden" : "visible" }}>
              <Composer text={text} placeholder={copy.agent.placeholder} caret={caret} pressed={frame >= timing.send && frame < timing.send + 6} />
            </div>
            {sent && <WorkingBar label={copy.agent.working} />}
          </ChatSurface>
        </Window>
        <Cursor from={timing.cursorIn} presses={[timing.focus, timing.send]} keys={cursor} />
        <FramingOverlay boxes={{ "composer-text": field, send, reply }} cursor={cursor} />
      </Camera>
    </AbsoluteFill>
  );
}
