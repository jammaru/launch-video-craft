import { getInputProps, useCurrentFrame } from "remotion";

import type { StageBox } from "../lib/framing";
import { keyed } from "../lib/motion";
import type { CursorKey } from "./Stage";

/** True when rendered with --props='{"debug":true}' (npm run verify does this). */
export const debug = Boolean((getInputProps() as { debug?: boolean }).debug);

/**
 * Inside <Camera>: outlines every named target and marks the cursor tip, so a still shows
 * at a glance whether the press lands on the thing and the camera frames it.
 */
export function FramingOverlay({ boxes, cursor }: { boxes: Record<string, StageBox | undefined>; cursor?: CursorKey[] }) {
  const frame = useCurrentFrame();
  if (!debug) return null;
  const tip = cursor ? { x: keyed(frame, cursor, "x"), y: keyed(frame, cursor, "y") } : undefined;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 200 }}>
      {Object.entries(boxes).map(([name, box], index) =>
        box ? (
          <div key={name} style={{ position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, outline: "3px solid #ff2d55", outlineOffset: 2 }}>
            {/* Alternate labels above and below, so boxes that share an edge do not hide each other's names. */}
            <div style={{ position: "absolute", left: 0, ...(index % 2 ? { bottom: -24 } : { top: -24 }), font: "600 16px monospace", color: "#fff", background: "#ff2d55", padding: "1px 6px", whiteSpace: "nowrap" }}>{name}</div>
          </div>
        ) : null,
      )}
      {tip && (
        <>
          <div style={{ position: "absolute", left: tip.x - 18, top: tip.y - 1, width: 36, height: 2, background: "#00c2ff" }} />
          <div style={{ position: "absolute", left: tip.x - 1, top: tip.y - 18, width: 2, height: 36, background: "#00c2ff" }} />
        </>
      )}
    </div>
  );
}
