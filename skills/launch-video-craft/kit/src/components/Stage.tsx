import { createContext, useContext, type CSSProperties, type ReactNode, type Ref } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

import { keyed, ramp, span, type Key } from "../lib/motion";
import { color, fonts } from "../theme";

export const WIN = { x: 150, y: 96, w: 1620, h: 930 };
export const BAR = 40;

/** Stage point of a box measured inside the window body. */
export function onStage(box: { cx: number; cy: number } | undefined, dx = 0, dy = 0) {
  if (!box) return { x: WIN.x + WIN.w / 2, y: WIN.y + WIN.h / 2 };
  return { x: WIN.x + box.cx + dx, y: WIN.y + BAR + box.cy + dy };
}

export function Backdrop() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#e9d9e6" }}>
      <Img
        src={staticFile("backdrop.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.07 + 0.015 * Math.sin(frame / 90)}) translateX(${-frame * 0.07}px)`,
        }}
      />
    </AbsoluteFill>
  );
}

export type CameraKey = Key<"x" | "y" | "scale">;

/** The camera's scale at this frame, for children that should change when zoomed. */
const CameraScale = createContext(1);

export function Camera({ keys, children }: { keys: CameraKey[]; children: ReactNode }) {
  const frame = useCurrentFrame();
  const x = keyed(frame, keys, "x");
  const y = keyed(frame, keys, "y");
  const scale = keyed(frame, keys, "scale");
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        transform: `translate(960px, 540px) scale(${scale}) translate(${-x}px, ${-y}px)`,
      }}
    >
      <CameraScale.Provider value={scale}>{children}</CameraScale.Provider>
    </AbsoluteFill>
  );
}

/**
 * Translate and scale for a window rising from below; `progress` is the window spring.
 * At 0 the window is fully below the frame (96 + 1000 > 1080), so it never peeks under a headline.
 */
export function rise(progress: number): CSSProperties {
  return {
    transform: `translateY(${(1 - progress) * 1000}px) scale(${0.9 + 0.1 * progress})`,
    transformOrigin: "50% 0%",
    visibility: progress > 0.001 ? "visible" : "hidden",
  };
}

export function Window({
  title,
  dark = false,
  style,
  bodyRef,
  children,
}: {
  title: string;
  dark?: boolean;
  style?: CSSProperties;
  bodyRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  const zoom = useContext(CameraScale);
  return (
    <div
      style={{
        position: "absolute",
        left: WIN.x,
        top: WIN.y,
        width: WIN.w,
        height: WIN.h,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: dark ? "#141015" : "#fff",
        boxShadow: "0 50px 120px rgba(60, 30, 70, 0.30), 0 10px 30px rgba(60, 30, 70, 0.14), 0 0 0 1px rgba(0,0,0,0.07)",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      <div
        style={{
          height: BAR,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingLeft: 16,
          position: "relative",
          backgroundColor: dark ? "#221c24" : "#f5f3f6",
          borderBottom: `1px solid ${dark ? "#2e2731" : color.line}`,
        }}
      >
        {["#ff5f57", "#febc2e", "#28c840"].map((dot) => (
          <div key={dot} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dot }} />
        ))}
        {/* Gone while zoomed: wherever it sits, some zoom cuts it at the frame's edge. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 1 - ramp(zoom, 1.1, 1.3),
            fontFamily: fonts.ui,
            fontSize: 14,
            fontWeight: 500,
            color: dark ? "#b9afbd" : color.muted,
          }}
        >
          {title}
        </div>
      </div>
      <div ref={bodyRef} style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

export type CursorKey = Key<"x" | "y">;

/** A 44×50 arrow. Render it inside <Camera> so zooms carry it. */
export function Cursor({ keys, presses = [], from = 0 }: { keys: CursorKey[]; presses?: number[]; from?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dip = span(10, fps);
  const ring = span(18, fps);
  if (frame < from) return null;
  const x = keyed(frame, keys, "x");
  const y = keyed(frame, keys, "y");
  const squash = presses.reduce((value, at) => {
    const t = frame - at;
    return t >= 0 && t <= dip ? Math.min(value, 1 - 0.2 * Math.sin((t / dip) * Math.PI)) : value;
  }, 1);
  const show = ramp(frame, from, from + span(8, fps));
  return (
    <div style={{ position: "absolute", left: x, top: y, zIndex: 100, opacity: show }}>
      {presses
        .filter((at) => frame >= at && frame < at + ring)
        .map((at) => {
          const t = (frame - at) / ring;
          return (
            <div
              key={at}
              style={{
                position: "absolute",
                left: -28,
                top: -28,
                width: 56,
                height: 56,
                borderRadius: 28,
                border: `3px solid ${color.ink}`,
                opacity: 0.55 * (1 - t),
                transform: `scale(${0.35 + t * 1.2})`,
              }}
            />
          );
        })}
      <svg
        width={44}
        height={50}
        viewBox="0 0 44 50"
        style={{
          position: "absolute",
          left: -5,
          top: -3,
          transform: `scale(${squash})`,
          transformOrigin: "5px 3px",
          filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.3))",
        }}
      >
        <path
          d="M5 3 L5 40 L14.5 31.5 L21 46.5 L28.5 43.5 L22 28.5 L35 28.5 Z"
          fill={color.ink}
          stroke="#fff"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Words rise one by one, a tenth of a second apart; the rise takes about half a second.
 * At 60fps that is 6 frames apart and 32 frames of rise. Exits upward over about half a second.
 * The headline sits on its own plain field, never on the photograph: type over a photo
 * loses contrast wherever the picture is dark or busy. The field fades as the headline leaves.
 */
/** Paper behind dark type, ink behind light type, so a headline never matches its field. */
function fieldFor(tone: string) {
  const hex = tone.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return color.paper;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140 ? color.ink : color.paper;
}

export function Headline({
  text,
  start,
  out,
  size = 116,
  tone = color.ink,
  field = fieldFor(tone),
  cover = true,
}: {
  text: string;
  start: number;
  out?: number;
  size?: number;
  tone?: string;
  field?: string;
  /** False draws a plate behind the words only, so the object stays visible around the title. */
  cover?: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The type is gone before its field starts to clear, so a fading headline never sits on the photograph.
  const leave = out === undefined ? 0 : ramp(frame, out, out + span(8, fps));
  const clear = out === undefined ? 0 : ramp(frame, out + span(6, fps), out + span(14, fps));
  const words = text.split(" ");
  const fitted = Math.min(size, 1700 / (text.length * 0.56));
  const plate: CSSProperties | undefined = cover
    ? undefined
    : { backgroundColor: field, padding: `${fitted * 0.28}px ${fitted * 0.55}px ${fitted * 0.4}px` };
  return (
    <AbsoluteFill>
    {cover ? <AbsoluteFill style={{ backgroundColor: field, opacity: 1 - clear }} /> : null}
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: 1 - leave,
        transform: `translateY(${-leave * 70}px)`,
      }}
    >
    <div style={plate}>
      <div
        style={{
          display: "flex",
          gap: `0 ${fitted * 0.25}px`,
          fontFamily: fonts.display,
          fontWeight: 800,
          fontSize: fitted,
          letterSpacing: "-0.04em",
          color: tone,
          whiteSpace: "nowrap",
          overflow: "hidden",
          padding: `0 0 ${fitted * 0.12}px`,
        }}
      >
        {words.map((word, index) => {
          const t = ramp(frame, start + index * span(3, fps), start + index * span(3, fps) + span(16, fps));
          return (
            <span key={index} style={{ display: "inline-block", transform: `translateY(${(1 - t) * 115}%)`, opacity: t }}>
              {word}
            </span>
          );
        })}
      </div>
    </div>
    </AbsoluteFill>
    </AbsoluteFill>
  );
}
