import { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import demo from "../captured/demo.json";
import { AgentText, CHAT, ChatSurface, Composer, SkillUse, ToolCard, UserBubble, WorkingBar } from "../components/Chat";
import { Backdrop, BAR, Camera, Cursor, Headline, onStage, rise, WIN, Window } from "../components/Stage";
import { copy } from "../copy";
import { useAnchors } from "../lib/measure";
import { typed, windowSpring } from "../lib/motion";
import { beats, timing } from "./Agent.beats";

export function Agent() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bodyRef = useRef<HTMLDivElement>(null);
  const boxes = useAnchors(bodyRef);
  const enter = windowSpring(frame, fps, timing.windowIn);

  const sent = frame >= timing.send + 2;
  const text = sent ? "" : typed(frame, timing.typeStart, copy.agent.prompt, timing.typePerFrame);
  const caret = frame >= timing.focus && !sent && Math.floor((frame - timing.focus) / 9) % 2 === 0;

  const composer = onStage(boxes.composer);
  const field = boxes["composer-text"];
  const textStart = field ? { x: WIN.x + field.x + 6, y: WIN.y + BAR + field.y + 16 } : composer;
  const send = onStage(boxes.send);
  const tool = boxes.tool;
  // Left edge of the card just inside the view at scale 2 (the view is 960px wide).
  const toolView = tool ? { x: WIN.x + tool.x - 40 + 960 / 2, y: onStage(tool).y + 40 } : composer;

  return (
    <AbsoluteFill>
      <Backdrop />
      <Headline text={copy.agent.headline} start={timing.headlineIn} out={timing.headlineOut} />
      <Camera
        keys={[
          { at: 0, x: 960, y: 540, scale: 1 },
          { at: timing.wideUntil, x: 960, y: 540, scale: 1 },
          { at: timing.composerCamera, x: composer.x, y: composer.y - 40, scale: 1.9 },
          { at: timing.send + 4, x: composer.x, y: composer.y - 40, scale: 1.9 },
          { at: timing.toolCamera, ...toolView, scale: 2 },
          { at: beats.duration, ...toolView, scale: 2.05 },
        ]}
      >
        <Window title={demo.cwd} style={rise(enter)}>
          <ChatSurface title={copy.agent.title} bodyRef={bodyRef}>
            <UserBubble text={copy.agent.prompt} at={timing.reply} />
            <div style={{ position: "absolute", left: CHAT.column.x, width: CHAT.column.w, top: 170 }}>
              <SkillUse at={timing.skill} label={copy.agent.skillLabel} name={copy.agent.skillName} file={copy.agent.skillFile} />
              <ToolCard at={timing.tool} verb={copy.agent.ran} command={demo.command} output={demo.lines.map((line) => ({ text: line }))} outputAt={timing.toolOutput} anchor="tool" />
              <AgentText at={timing.answer}>{copy.agent.answer}</AgentText>
            </div>
            {sent ? (
              <WorkingBar label={copy.agent.working} />
            ) : (
              <Composer text={text} placeholder={copy.agent.placeholder} caret={caret} pressed={frame >= timing.send && frame < timing.send + 6} />
            )}
          </ChatSurface>
        </Window>
        <Cursor
          from={timing.cursorIn}
          presses={[timing.focus, timing.send]}
          keys={[
            { at: timing.cursorIn, x: 1380, y: 900 },
            { at: timing.focusCursor, x: textStart.x, y: textStart.y },
            { at: timing.focus + 8, x: textStart.x, y: textStart.y },
            { at: timing.focus + 24, x: textStart.x + 120, y: textStart.y + 110 },
            { at: timing.sendCursor - 12, x: textStart.x + 120, y: textStart.y + 110 },
            { at: timing.sendCursor, x: send.x + 2, y: send.y + 2 },
            { at: timing.send + 10, x: send.x + 2, y: send.y + 2 },
            // After send the person only watches; the cursor leaves the agent's reply.
            { at: timing.toolCamera, x: send.x + 400, y: send.y + 300 },
          ]}
        />
      </Camera>
    </AbsoluteFill>
  );
}
