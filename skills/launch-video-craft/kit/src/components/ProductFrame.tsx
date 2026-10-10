import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

import type { Box } from "../lib/measure";

/** Finds one element of the product's own page; the key becomes the anchor name. */
export type Find = (doc: Document) => Element | null | undefined;

/** The product's built page, copied to public/product/ by `shootProduct` in capture/lib.mjs. */
export function productPage(path = "index.html", hash = "") {
  return `${staticFile(`product/${path}`)}${hash ? `#${hash.replace(/^#/, "")}` : ""}`;
}

/** The first element matching `selector` whose text includes `text`. */
export function byText(selector: string, text: string): Find {
  return (doc) => [...doc.querySelectorAll(selector)].find((node) => node.textContent?.includes(text));
}

export function bySelector(selector: string): Find {
  return (doc) => doc.querySelector(selector);
}

type Product = {
  src: string;
  boxes: Record<string, Box>;
  ready: boolean;
  error?: string;
  onLoad: (frame: HTMLIFrameElement) => void;
};

const still = "*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}";

/**
 * The product's real page in the window body, measured inside its own document.
 * Boxes are in window-body pixels, like useAnchors, so fit/pointIn/assertFraming work unchanged.
 * `prepare` may drive the page first (select an example, click a tab) with the page's own controls.
 * The frame is held until the page, its fonts, and every `find` are ready; a missing one fails the render.
 */
export function useProduct({
  src,
  find,
  prepare,
}: {
  src: string;
  find: Record<string, Find>;
  prepare?: (doc: Document, win: Window) => void | Promise<void>;
}): Product {
  const [handle] = useState(() => delayRender(`product page ${src}`, { timeoutInMilliseconds: 60000 }));
  const [state, setState] = useState<{ boxes: Record<string, Box>; ready: boolean; error?: string }>({ boxes: {}, ready: false });
  const started = useRef(false);
  const onLoad = useCallback(
    (frame: HTMLIFrameElement) => {
      if (started.current) return;
      started.current = true;
      const doc = frame.contentDocument;
      const win = frame.contentWindow;
      if (!doc || !win) {
        setState({ boxes: {}, ready: true, error: `${src} is not same-origin; serve it from public/product/` });
        return;
      }
      const style = doc.createElement("style");
      style.textContent = still;
      doc.head.append(style);
      const frames = () => new Promise<void>((resolve) => win.requestAnimationFrame(() => win.requestAnimationFrame(() => resolve())));
      (async () => {
        await doc.fonts.ready;
        await prepare?.(doc, win);
        await doc.fonts.ready;
        await frames();
        const boxes: Record<string, Box> = {};
        const missing: string[] = [];
        for (const [name, findOne] of Object.entries(find)) {
          const node = findOne(doc);
          if (!node) {
            missing.push(name);
            continue;
          }
          const r = node.getBoundingClientRect();
          boxes[name] = { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        }
        setState({ boxes, ready: true, error: missing.length ? `nothing on ${src} matches ${missing.join(", ")}` : undefined });
      })().catch((error) => setState({ boxes: {}, ready: true, error: String(error?.message ?? error) }));
    },
    [find, prepare, src],
  );
  useEffect(() => {
    if (state.ready) requestAnimationFrame(() => continueRender(handle));
  }, [handle, state.ready]);
  return { src, ...state, onLoad };
}

export function ProductFrame({ product, style }: { product: Product; style?: CSSProperties }) {
  if (product.error) throw new Error(`ProductFrame: ${product.error}`);
  return (
    <iframe
      src={product.src}
      ref={(frame) => {
        if (frame?.contentDocument?.readyState === "complete" && frame.contentWindow?.location.href !== "about:blank") product.onLoad(frame);
      }}
      onLoad={(event) => product.onLoad(event.currentTarget)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, ...style }}
    />
  );
}
