import type { ReactNode, Ref } from "react";
import { useCurrentFrame } from "remotion";

import { ramp } from "../lib/motion";
import { color, fonts } from "../theme";

/** A quiet agent chat for products with no chat of their own; the captured words inside are the point. */
export const CHAT = { column: { x: 310, w: 1000 }, composer: { y: 752, h: 118 } };

export function ChatSurface({ title, children, bodyRef }: { title: string; children: ReactNode; bodyRef?: Ref<HTMLDivElement> }) {
  return (
    <div ref={bodyRef} style={{ position: "absolute", inset: 0, backgroundColor: "#fff", fontFamily: fonts.ui, color: color.ink }}>
      <div
        style={{
          height: 54,
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingLeft: 28,
          borderBottom: `1px solid ${color.line}`,
          fontSize: 17,
          fontWeight: 600,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color.violet }} />
        {title}
      </div>
      {children}
    </div>
  );
}

export function Composer({
  text,
  placeholder,
  caret,
  pressed,
}: {
  text: string;
  placeholder: string;
  caret: boolean;
  pressed: boolean;
}) {
  return (
    <div
      data-anchor="composer"
      style={{
        position: "absolute",
        left: CHAT.column.x,
        width: CHAT.column.w,
        top: CHAT.composer.y,
        height: CHAT.composer.h,
        borderRadius: 22,
        border: "1px solid #e2dce7",
        boxShadow: "0 6px 24px rgba(40, 20, 50, 0.07)",
        backgroundColor: "#fff",
      }}
    >
      <div data-anchor="composer-text" style={{ position: "absolute", left: 26, top: 16, right: 26, fontSize: 23, lineHeight: "32px" }}>
        {text ? <span>{text}</span> : <span style={{ color: "#a69dac" }}>{placeholder}</span>}
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: 26,
            marginLeft: 1,
            verticalAlign: "middle",
            backgroundColor: color.ink,
            opacity: caret ? 1 : 0,
          }}
        />
      </div>
      <div style={{ position: "absolute", left: 24, bottom: 16, fontSize: 28, color: "#8f8695", lineHeight: 1 }}>+</div>
      <div
        data-anchor="send"
        style={{
          position: "absolute",
          right: 16,
          bottom: 14,
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: color.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pressed ? 0.9 : 1})`,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <path d="M10 16 V4 M4.5 9.5 L10 4 L15.5 9.5" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export function UserBubble({ text, at }: { text: string; at: number }) {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, at + 12);
  return (
    <div
      style={{
        position: "absolute",
        top: 76,
        left: CHAT.column.x + 180,
        width: CHAT.column.w - 180,
        display: "flex",
        justifyContent: "flex-end",
        visibility: frame >= at ? "visible" : "hidden",
        opacity: t,
        transform: `translateY(${(1 - t) * 16}px)`,
      }}
    >
      <div style={{ backgroundColor: "#f2eef5", borderRadius: 20, padding: "14px 20px", fontSize: 21, lineHeight: "30px" }}>{text}</div>
    </div>
  );
}

/** One line of the agent's reply; mounted from the start and shown at `at`. */
export function ReplyLine({ at, children, gap = 0 }: { at: number; children: ReactNode; gap?: number }) {
  const frame = useCurrentFrame();
  const t = ramp(frame, at, at + 10);
  return (
    <div style={{ marginTop: gap, visibility: frame >= at ? "visible" : "hidden", opacity: t, transform: `translateY(${(1 - t) * 10}px)` }}>
      {children}
    </div>
  );
}

const mono = { fontFamily: fonts.mono } as const;

/** The agent announcing the skill it picked up, and the file it read. */
export function SkillUse({ at, label, name, file, lines }: { at: number; label: string; name: string; file?: string; lines?: number }) {
  return (
    <ReplyLine at={at}>
      <div data-anchor="skill" style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
        <div style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 10px", borderRadius: 999, backgroundColor: "#efe7fb", fontSize: 18 }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M9 1.5 L10.9 7.1 L16.5 9 L10.9 10.9 L9 16.5 L7.1 10.9 L1.5 9 L7.1 7.1 Z" fill={color.violet} />
          </svg>
          <span style={{ color: color.muted }}>{label}</span>
          <span style={{ fontWeight: 600, color: color.ink }}>{name}</span>
        </div>
        {file && (
          <div style={{ ...mono, fontSize: 15, color: color.muted, paddingLeft: 12 }}>
            Read {file} {lines !== undefined && <span style={{ color: "#a79fae" }}>({lines} lines)</span>}
          </div>
        )}
      </div>
    </ReplyLine>
  );
}

export type ToolLine = { text: string; tone?: "plain" | "error" | "strong" };

/** A command the agent ran, with what it printed. Lines appear `every` frames apart from `outputAt`. */
export function ToolCard({
  at,
  verb,
  command,
  output,
  outputAt,
  every = 2,
  anchor,
  gap = 12,
}: {
  at: number;
  verb: string;
  command: string;
  output: ToolLine[];
  outputAt: number;
  every?: number;
  anchor?: string;
  gap?: number;
}) {
  const frame = useCurrentFrame();
  const running = frame >= at && frame < outputAt;
  return (
    <ReplyLine at={at} gap={gap}>
      <div data-anchor={anchor} style={{ border: `1px solid ${color.line}`, borderRadius: 14, overflow: "hidden", backgroundColor: "#fcfbfd" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: 15, borderBottom: output.length ? `1px solid ${color.line}` : "none" }}>
          <span style={{ ...mono, color: color.violet, fontWeight: 600 }}>{">_"}</span>
          <span style={{ color: color.muted }}>{running ? "Running" : verb}</span>
          <span style={{ ...mono, color: color.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{command}</span>
        </div>
        {output.length > 0 && (
          <div style={{ padding: "8px 14px 10px", ...mono, fontSize: 15.5, lineHeight: "23px" }}>
            {output.map((line, index) => (
              <div
                key={index}
                data-anchor={anchor ? `${anchor}-${index}` : undefined}
                style={{
                  visibility: frame >= outputAt + index * every ? "visible" : "hidden",
                  whiteSpace: "pre-wrap",
                  color: line.tone === "error" ? color.rose : color.ink,
                  fontWeight: line.tone === "strong" ? 600 : 400,
                }}
              >
                {line.text || " "}
              </div>
            ))}
          </div>
        )}
      </div>
    </ReplyLine>
  );
}

export function AgentText({ at, children, gap = 12, anchor }: { at: number; children: ReactNode; gap?: number; anchor?: string }) {
  return (
    <ReplyLine at={at} gap={gap}>
      <div data-anchor={anchor} style={{ fontSize: 20, lineHeight: "29px" }}>
        {children}
      </div>
    </ReplyLine>
  );
}

/** The bottom bar while the agent works: no typing, a quiet status. */
export function WorkingBar({ label }: { label: string }) {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: CHAT.column.x,
        width: CHAT.column.w,
        top: CHAT.composer.y + 30,
        height: 64,
        borderRadius: 22,
        border: "1px solid #e2dce7",
        display: "flex",
        alignItems: "center",
        gap: 12,
        paddingLeft: 22,
        fontSize: 18,
        color: color.muted,
      }}
    >
      {[0, 1, 2].map((dot) => (
        <div key={dot} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color.violet, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - dot * 5) / 6)) }} />
      ))}
      {label}
    </div>
  );
}
