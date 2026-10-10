import { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import demo from "../captured/demo.json";
import { Backdrop, BAR, Camera, Cursor, Headline, onStage, rise, WIN, Window } from "../components/Stage";
import { Terminal, terminalScroll, type Row } from "../components/Terminal";
import { copy } from "../copy";
import { useAnchors } from "../lib/measure";
import { windowSpring } from "../lib/motion";
import { beats, timing } from "./Command.beats";

const rows: Row[] = [
  {
    kind: "prompt",
    cwd: `~/${demo.cwd}`,
    command: demo.command,
    at: 0,
    focus: timing.focus,
    typeStart: timing.typeStart,
    perFrame: timing.typePerFrame,
    enter: timing.enter,
    anchor: "prompt",
  },
  ...demo.lines.map((text, index): Row => ({ kind: "out", text, at: timing.firstLine + index * timing.lineEvery, anchor: index === 0 ? "output" : undefined })),
];

export function Command() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const contentRef = useRef<HTMLDivElement>(null);
  const boxes = useAnchors(contentRef);
  const enter = windowSpring(frame, fps, timing.windowIn);
  const viewport = WIN.h - BAR;
  const scroll = terminalScroll(frame, rows, boxes, viewport);

  // Measure the prompt (stable width), not the typed text (changes every frame).
  const ps1 = boxes["prompt-ps1"];
  const prompt = onStage(boxes.prompt);
  const typeFrom = ps1 ? { x: WIN.x + ps1.x + ps1.w, y: prompt.y } : prompt;
  // Frame the left of the line, so the whole command fits at scale 2: the view is 960px wide.
  const lineView = { x: (ps1 ? WIN.x + ps1.x - 40 : WIN.x) + 960 / 2, y: prompt.y + 60 };
  const output = onStage(boxes.output, 0, -terminalScroll(timing.outputCamera, rows, boxes, viewport));
  const outputView = { x: (ps1 ? WIN.x + ps1.x - 40 : WIN.x) + 960 / 2.2, y: output.y };

  return (
    <AbsoluteFill>
      <Backdrop />
      <Headline text={copy.command.headline} start={timing.headlineIn} out={timing.headlineOut} />
      <Camera
        keys={[
          { at: 0, x: 960, y: 540, scale: 1 },
          { at: timing.wideUntil, x: 960, y: 540, scale: 1 },
          { at: timing.focusCamera, ...lineView, scale: 2 },
          { at: timing.enter, ...lineView, scale: 2 },
          { at: timing.outputCamera, ...outputView, scale: 2.2 },
          { at: beats.duration, ...outputView, scale: 2.3 },
        ]}
      >
        <Window title={`${demo.cwd} — zsh`} style={rise(enter)}>
          <Terminal rows={rows} scroll={scroll} contentRef={contentRef} />
        </Window>
        <Cursor
          from={timing.cursorIn}
          presses={[timing.focus]}
          keys={[
            { at: timing.cursorIn, x: 1300, y: 760 },
            { at: timing.focusCursor, x: typeFrom.x + 6, y: typeFrom.y + 4 },
            { at: timing.focus + 6, x: typeFrom.x + 6, y: typeFrom.y + 4 },
            // Typing: the cursor steps aside so it does not cover the text.
            { at: timing.focus + 26, x: typeFrom.x + 60, y: typeFrom.y + 90 },
            { at: timing.enter + 6, x: typeFrom.x + 60, y: typeFrom.y + 90 },
            // While the output is read, the cursor leaves the view.
            { at: timing.outputCamera, x: typeFrom.x + 700, y: typeFrom.y + 420 },
          ]}
        />
      </Camera>
    </AbsoluteFill>
  );
}
