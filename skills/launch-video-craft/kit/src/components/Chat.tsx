import { ArrowUp, BookOpen, CheckCircle, NotePencil, Sparkle, TerminalWindow, Wrench } from "@phosphor-icons/react";
import type { ReactNode, Ref } from "react";
import { useCurrentFrame } from "remotion";

import type { Box } from "../lib/measure";
import { keyed, ramp, span } from "../lib/motion";
import { color, fonts } from "../theme";
import { BAR, WIN } from "./Stage";

/**
 * A quiet agent chat for products with no chat of their own; the captured words inside are the point.
 * The log column is narrow enough that a card stays whole at scale 1.8 (a 1066px view).
 */
export const CHAT = { log: { x: 310, w: 1000, top: 28 }, composerH: 150 };
export const CHAT_VIEWPORT = WIN.h - BAR - CHAT.composerH - CHAT.log.top;

/** The white surface inside the window. Put the composer's anchors under `bodyRef`. */
export function ChatSurface({ children, bodyRef }: { children: ReactNode; bodyRef?: Ref<HTMLDivElement> }) {
  return (
    <div ref={bodyRef} style={{ position: "absolute", inset: 0, backgroundColor: "#fff", fontFamily: fonts.chat, color: color.ink }}>
      {children}
    </div>
  );
}

/**
 * The scrolling log. Anchors inside it are measured on `logRef`, unscrolled, so they hold on every
 * frame; place them on stage with `logStageBox`. Items stack 22px apart.
 */
export function ChatLog({ scroll, logRef, children, opacity = 1 }: { scroll: number; logRef: Ref<HTMLDivElement>; children: ReactNode; opacity?: number }) {
  return (
    <div style={{ position: "absolute", left: CHAT.log.x, width: CHAT.log.w, top: CHAT.log.top, height: CHAT_VIEWPORT, overflow: "hidden", opacity }}>
      <div
        ref={logRef}
        style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", flexDirection: "column", gap: 22, fontSize: 22, lineHeight: 1.5, transform: `translateY(${-scroll}px)` }}
      >
        {children}
      </div>
    </div>
  );
}

/** One item of the log: mounted from the start, fades in and rises 26px over about half a second from `at`. */
export function Reveal({ at, anchor, children }: { at: number; anchor: string; children: ReactNode }) {
  const frame = useCurrentFrame();
  const progress = ramp(frame, at, at + span(14));
  return (
    <div data-anchor={anchor}>
      <div style={{ opacity: progress, transform: `translateY(${(1 - progress) * 26}px)` }}>{children}</div>
    </div>
  );
}

export function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", paddingLeft: 200 }}>
      <div style={{ padding: "14px 22px", borderRadius: 24, backgroundColor: "#f0f0ef" }}>{text}</div>
    </div>
  );
}

export function AgentText({ children }: { children: ReactNode }) {
  return <div style={{ color: "#333" }}>{children}</div>;
}

export type ToolLine = { text: ReactNode; tone?: "plain" | "error" | "strong"; anchor?: string };

const icons = { run: TerminalWindow, write: NotePencil, read: BookOpen, tool: Wrench };

/**
 * A step the agent took: gray header with an icon, the verb, and the command, file, or tool name in
 * mono; the captured output below, each line fading in 2 frames after the one above from `start`.
 * Without lines it is the header alone (a file written, a file read).
 */
export function ToolCard({ kind = "run", verb, name, lines = [], start = 0 }: { kind?: keyof typeof icons; verb: string; name: ReactNode; lines?: ToolLine[]; start?: number }) {
  const frame = useCurrentFrame();
  const Icon = icons[kind];
  return (
    <div style={{ border: "1px solid #e4e4e4", borderRadius: 18, overflow: "hidden", backgroundColor: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 20px",
          borderBottom: lines.length ? "1px solid #efefef" : "none",
          backgroundColor: "#fafafa",
          fontSize: 17,
          color: "#666",
        }}
      >
        <Icon size={18} />
        <span>{verb}</span>
        <span style={{ fontFamily: fonts.mono, color: color.ink, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
      </div>
      {lines.length > 0 && (
        <div style={{ padding: "16px 22px", fontFamily: fonts.mono, fontSize: 18, lineHeight: 1.65, color: "#333" }}>
          {lines.map((line, index) => (
            <div
              key={index}
              data-anchor={line.anchor}
              style={{
                whiteSpace: "pre-wrap",
                color: line.tone === "error" ? color.rose : undefined,
                fontWeight: line.tone === "strong" ? 700 : 400,
                opacity: ramp(frame, start + index * span(2), start + index * span(2) + span(8)),
              }}
            >
              {line.text || " "}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** The closing line when the agent's work passed: green, with the captured detail on the right. */
export function Done({ label, detail }: { label: string; detail: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px", borderRadius: 18, backgroundColor: "#eafaf0", color: "#0d6b36", fontWeight: 600 }}>
      <CheckCircle size={28} weight="fill" />
      {label}
      <span style={{ marginLeft: "auto", fontFamily: fonts.mono, fontSize: 16, fontWeight: 400, padding: "4px 12px", borderRadius: 8, backgroundColor: "#12a15022" }}>{detail}</span>
    </div>
  );
}

/** The composer: one line that keeps its end in view while typing, a chip naming the skill or tool, and Send. */
export function Composer({ text, placeholder, chip, caret, pressed }: { text: string; placeholder: string; chip?: string; caret: boolean; pressed: boolean }) {
  return (
    <div
      data-anchor="composer"
      style={{
        position: "absolute",
        left: CHAT.log.x - 20,
        width: CHAT.log.w + 40,
        bottom: 28,
        height: CHAT.composerH - 44,
        borderRadius: 26,
        border: "1px solid #e2e2e2",
        boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
        backgroundColor: "#fff",
        padding: "18px 24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div data-anchor="composer-text" style={{ display: "flex", justifyContent: "flex-end", fontSize: 22, whiteSpace: "nowrap", overflow: "hidden", color: text ? color.ink : "#9a9a9a" }}>
        <span style={{ flexShrink: 0, minWidth: "100%" }}>
          {text || placeholder}
          <span style={{ opacity: caret ? 1 : 0 }}>|</span>
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 16, color: "#777" }}>
        {chip && (
          <span style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999, backgroundColor: "#f3f3f2" }}>
            <Sparkle size={16} /> {chip}
          </span>
        )}
        <div
          data-anchor="send"
          style={{
            marginLeft: "auto",
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: color.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: pressed ? "scale(0.9)" : undefined,
          }}
        >
          <ArrowUp size={22} color="#fff" weight="bold" />
        </div>
      </div>
    </div>
  );
}

export type ScrollKey = { at: number; s: number };

/**
 * Scroll keys that follow each new item: when an item appears, the log eases for about 0.6s until
 * its bottom sits 24px above the composer. An item at or before frame 0 is already there when the
 * shot opens (a conversation continued from the shot before).
 */
export function chatScroll(items: { at: number; anchor: string }[], boxes: Record<string, Box>): ScrollKey[] {
  const target = (anchor: string) => {
    const box = boxes[anchor];
    return box ? Math.max(0, box.y + box.h - CHAT_VIEWPORT + 24) : 0;
  };
  const opened = items.reduce((s, item) => (item.at <= 0 ? Math.max(s, target(item.anchor)) : s), 0);
  const keys: ScrollKey[] = [{ at: 0, s: opened }];
  items.forEach((item, index) => {
    if (item.at <= 0) return;
    const next = items.slice(index + 1).find((later) => later.at > item.at)?.at ?? item.at + span(30);
    const from = keys[keys.length - 1].s;
    keys.push({ at: item.at, s: from }, { at: Math.min(item.at + span(18), next), s: Math.max(from, target(item.anchor)) });
  });
  return keys;
}

/** Stage box of an anchor measured on the log, at the scroll it has on `frame`. */
export function logStageBox(box: Box | undefined, keys: ScrollKey[], frame: number) {
  if (!box) return undefined;
  const scroll = keyed(frame, keys, "s");
  return { x: WIN.x + CHAT.log.x + box.x, y: WIN.y + BAR + CHAT.log.top + box.y - scroll, w: box.w, h: box.h };
}
