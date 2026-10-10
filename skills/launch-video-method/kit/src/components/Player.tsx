import { Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

import { BAR, WIN } from "./Stage";
import { fonts } from "../theme";

const BODY = { w: WIN.w, h: WIN.h - BAR };
export const VIDEO = (() => {
  const h = BODY.h;
  const w = Math.round((h * 16) / 9);
  return { x: Math.round((BODY.w - w) / 2), y: 0, w, h };
})();

/** A plain player: paused on `startSeconds` until `playAt`, then plays muted. */
export function Player({ src, startSeconds, playAt, totalSeconds, pressed }: { src: string; startSeconds: number; playAt: number; totalSeconds: number; pressed: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const playing = frame >= playAt;
  const seconds = startSeconds + Math.max(0, frame - playAt) / fps;
  const clock = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
  const video = <OffthreadVideo src={staticFile(src)} startFrom={Math.round(startSeconds * fps)} muted style={{ width: "100%", height: "100%" }} />;
  return (
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#0c0a0d" }}>
      <div style={{ position: "absolute", left: VIDEO.x, top: VIDEO.y, width: VIDEO.w, height: VIDEO.h, overflow: "hidden" }}>
        {playing ? <Sequence from={playAt} layout="none">{video}</Sequence> : <Freeze frame={0}>{video}</Freeze>}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 120,
          background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
          opacity: playing ? Math.max(0, 1 - (frame - playAt - 20) / 12) : 1,
        }}
      >
        <div
          data-anchor="play"
          style={{
            position: "absolute",
            left: 32,
            bottom: 26,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${pressed ? 0.9 : 1})`,
          }}
        >
          {playing ? (
            <svg width="22" height="22" viewBox="0 0 22 22">
              <rect x="4" y="3" width="5" height="16" rx="1.5" fill="#111" />
              <rect x="13" y="3" width="5" height="16" rx="1.5" fill="#111" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M7 4 L20 12 L7 20 Z" fill="#111" />
            </svg>
          )}
        </div>
        <div style={{ position: "absolute", left: 120, right: 170, bottom: 54, height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" }}>
          <div style={{ width: `${(seconds / totalSeconds) * 100}%`, height: "100%", borderRadius: 3, backgroundColor: "#fff" }} />
        </div>
        <div style={{ position: "absolute", right: 36, bottom: 44, fontFamily: fonts.ui, fontSize: 19, color: "#fff" }}>
          {clock(seconds)} / {clock(totalSeconds)}
        </div>
      </div>
    </div>
  );
}
