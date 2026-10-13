import { useRef } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import demo from "../captured/demo.json";
import { FramingOverlay } from "../components/Debug";
import { Backdrop, BAR, Camera, Cursor, Headline, rise, WIN, Window, type CameraKey, type CursorKey } from "../components/Stage";
import { Terminal, terminalScroll, type Row } from "../components/Terminal";
import { copy } from "../copy";
import { assertFraming, fitLeft, pointIn, stageBox, union } from "../lib/framing";
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
  const { boxes, ready } = useAnchors(contentRef);
  const enter = windowSpring(frame, fps, timing.windowIn);
  const viewport = WIN.h - BAR;
  const scroll = terminalScroll(frame, rows, boxes, viewport);

  // Every position comes from a measured anchor, at the scroll of the frame it is used on.
  const boxAt = (name: string, at: number) => {
    const s = terminalScroll(at, rows, boxes, viewport);
    if (name === "result") return union(stageBox(boxes["prompt-ps1"], s), stageBox(boxes["prompt-text"], s), stageBox(boxes.output, s));
    return stageBox(boxes[name], s);
  };
  const ps1 = boxAt("prompt-ps1", timing.focus);
  // The typed line grows, so frame where it will end up: the whole command after Enter.
  const line = union(ps1, boxAt("prompt-text", timing.enter));
  const result = boxAt("result", timing.outputCamera);

  const camera: CameraKey[] = [
    { at: 0, x: 960, y: 540, scale: 1 },
    { at: timing.wideUntil, x: 960, y: 540, scale: 1 },
    { at: timing.focusCamera, ...fitLeft(line, { max: 2 }) },
    { at: timing.enter, ...fitLeft(line, { max: 2 }) },
    { at: timing.outputCamera, ...fitLeft(result) },
    { at: beats.duration, ...fitLeft(result) },
  ];
  const click = pointIn(ps1, { fx: 1, dx: -8 });
  const cursor: CursorKey[] = [
    { at: timing.cursorIn, x: 1300, y: 760 },
    { at: timing.focusCursor, ...click },
    { at: timing.focus + 12, ...click },
    // Typing: the cursor steps aside so it does not cover the text.
    { at: timing.focus + 52, x: click.x + 40, y: click.y + 120 },
    { at: timing.enter + 12, x: click.x + 40, y: click.y + 120 },
    // While the output is read, the cursor leaves the view.
    { at: timing.outputCamera, x: click.x + 700, y: click.y + 420 },
  ];
  assertFraming("Command", { beats, camera, cursor, ready, boxAt });

  return (
    <AbsoluteFill>
      <Backdrop />
      <Headline text={copy.command.headline} start={timing.headlineIn} out={timing.headlineOut} />
      <Camera keys={camera}>
        <Window title={`${demo.cwd} — zsh`} style={rise(enter)}>
          <Terminal rows={rows} scroll={scroll} contentRef={contentRef} />
        </Window>
        <Cursor from={timing.cursorIn} presses={[timing.focus]} keys={cursor} />
        <FramingOverlay boxes={{ "prompt-ps1": boxAt("prompt-ps1", frame), result: boxAt("result", frame) }} cursor={cursor} />
      </Camera>
    </AbsoluteFill>
  );
}
