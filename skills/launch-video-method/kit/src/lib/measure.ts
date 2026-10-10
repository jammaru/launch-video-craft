import { useLayoutEffect, useState, type RefObject } from "react";
import { continueRender, delayRender } from "remotion";

export type Box = { x: number; y: number; w: number; h: number; cx: number; cy: number };

/**
 * Reads every `[data-anchor]` inside `root`, in root's own layout pixels.
 * Ancestor transforms (camera, window entrance) are divided out, so the
 * numbers are the same on every frame.
 */
export function useAnchors(root: RefObject<HTMLElement | null>): Record<string, Box> {
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  useLayoutEffect(() => {
    const handle = delayRender("measure anchors");
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    document.fonts.ready.then(() =>
      requestAnimationFrame(() => {
        const element = root.current;
        if (element) {
          const origin = element.getBoundingClientRect();
          const scale = origin.width / element.offsetWidth || 1;
          const next: Record<string, Box> = {};
          element.querySelectorAll<HTMLElement>("[data-anchor]").forEach((node) => {
            const rect = node.getBoundingClientRect();
            const x = (rect.left - origin.left) / scale;
            const y = (rect.top - origin.top) / scale;
            const w = rect.width / scale;
            const h = rect.height / scale;
            next[node.dataset.anchor!] = { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
          });
          setBoxes(next);
        }
        finish();
      }),
    );
    return finish;
  }, [root]);
  return boxes;
}
