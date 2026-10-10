import type { CSSProperties } from "react";
import { Img, staticFile } from "remotion";

/**
 * Logo layers cut on one shared canvas: every PNG in public/logo/ is the size of the original
 * file, transparent outside its part. All of them are drawn in the same box, so they line up
 * without offsets, and `objectFit: contain` keeps the original proportions. Animate a layer
 * with `transform` (scale, translate, rotate, clip-path); never give a layer its own width
 * and height, which squashes it.
 */
export function LogoLayers({
  width,
  aspect,
  layers,
}: {
  width: number;
  aspect: number; // original width / height
  layers: { src: string; style?: CSSProperties }[];
}) {
  return (
    <div style={{ position: "relative", width, height: width / aspect }}>
      {layers.map(({ src, style }) => (
        <Img
          key={src}
          src={staticFile(src)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", ...style }}
        />
      ))}
    </div>
  );
}
