import type { Ref } from "react";
import { useCurrentFrame } from "remotion";

import { keyed, span, typed } from "../lib/motion";
import type { Box } from "../lib/measure";
import { color, fonts } from "../theme";

export const TERM = { font: 21, line: 31, padX: 36, padY: 26 };

export type Row =
  | { kind: "prompt"; cwd: string; command: string; at: number; focus: number; typeStart: number; perFrame: number; enter: number; anchor?: string }
  | { kind: "out"; text: string; at: number; tone?: "plain" | "error" | "strong"; anchor?: string };

const BOX = /[│├─╮╯╭╰└◇●◒◐◓◑■]/;

function Glyphs({ text, tone }: { text: string; tone: "plain" | "error" | "strong" }) {
  if (tone === "error") return <span style={{ color: color.rose }}>{text}</span>;
  return (
    <>
      {[...text].map((char, index) =>
        BOX.test(char) ? (
          <span key={index} style={{ color: "#b6abbd" }}>{char}</span>
        ) : char === "✓" ? (
          <span key={index} style={{ color: color.green, fontWeight: 600 }}>{char}</span>
        ) : (
          char
        ),
      )}
    </>
  );
}

export function Terminal({ rows, scroll = 0, contentRef }: { rows: Row[]; scroll?: number; contentRef?: Ref<HTMLDivElement> }) {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#fcfbfd", overflow: "hidden" }}>
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          padding: `${TERM.padY}px ${TERM.padX}px`,
          fontFamily: fonts.mono,
          fontSize: TERM.font,
          lineHeight: `${TERM.line}px`,
          color: color.ink,
          transform: `translateY(${-scroll}px)`,
        }}
      >
        {rows.map((row, index) => {
          const visible = frame >= row.at;
          if (row.kind === "prompt") {
            const text = typed(frame, row.typeStart, row.command, row.perFrame);
            const caretOn = frame >= row.focus && frame < row.enter && Math.floor((frame - row.focus) / span(8)) % 2 === 0;
            return (
              <div key={index} data-anchor={row.anchor ?? `row-${index}`} style={{ visibility: visible ? "visible" : "hidden", whiteSpace: "pre" }}>
                <span data-anchor={`${row.anchor ?? `row-${index}`}-ps1`}>
                  <span style={{ color: color.violet, fontWeight: 600 }}>{row.cwd}</span>
                  <span style={{ color: color.muted }}> $ </span>
                </span>
                {/* The untyped rest is laid out but invisible, so this anchor has the full command's width on every frame. */}
                <span data-anchor={`${row.anchor ?? `row-${index}`}-text`}>
                  {text}
                  <span
                    style={{
                      display: "inline-block",
                      width: TERM.font * 0.6,
                      height: TERM.line - 6,
                      verticalAlign: "middle",
                      backgroundColor: color.ink,
                      opacity: caretOn || (frame >= row.typeStart && frame < row.enter && text.length < row.command.length) ? 0.85 : 0,
                    }}
                  />
                  <span style={{ visibility: "hidden" }}>{row.command.slice(text.length)}</span>
                </span>
              </div>
            );
          }
          return (
            <div
              key={index}
              style={{
                visibility: visible ? "visible" : "hidden",
                whiteSpace: "pre-wrap",
                minHeight: TERM.line,
                fontWeight: row.tone === "strong" ? 600 : 400,
              }}
            >
              <span data-anchor={row.anchor ?? `row-${index}`}>
                <Glyphs text={row.text.trimEnd()} tone={row.tone ?? "plain"} />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Scroll that keeps the newest visible row inside the viewport, eased over about a quarter of a second.
 * `boxes` are measured on the unscrolled content, so they hold on every frame.
 */
export function terminalScroll(frame: number, rows: Row[], boxes: Record<string, Box>, viewport: number): number {
  const keys: { at: number; s: number }[] = [{ at: 0, s: 0 }];
  let current = 0;
  rows.forEach((row, index) => {
    const box = boxes[row.anchor ?? `row-${index}`];
    if (!box) return;
    const need = Math.max(0, box.y + box.h + TERM.padY - viewport);
    if (need > current) {
      keys.push({ at: row.at, s: current }, { at: row.at + span(8), s: need });
      current = need;
    }
  });
  return keyed(frame, keys, "s");
}
