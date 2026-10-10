"""Finds type cut by the frame's edges. Usage: edges.py still.png [still.png ...]

Prints one JSON object per still: {"file", "ok", "problems": [...]}.

A held, zoomed frame should end in the space between rows, not through a line of text.
For each edge, the outermost 3 pixels are compared with their own median colour. Thin
high-contrast marks there (3:1 or more, as glyph strokes are) that continue inward are type
running off the frame. Flat card fills and soft borders do not count.
"""

import json
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from contrast import load, luminance, ratio  # noqa: E402

BAND = 3
DEPTH = 10


def cut(strip: np.ndarray, inner: np.ndarray) -> float:
    bg = float(np.median(strip))
    marks = ratio(strip, bg) >= 3
    deeper = ratio(inner, bg) >= 3
    # A stroke that touches the edge and continues inward along the same column (or row).
    hit = marks.any(axis=0) & deeper.any(axis=0)
    return float(hit.mean())


def check(path: str) -> dict:
    lum = luminance(load(path))
    edges = {
        "top": (lum[:BAND], lum[BAND:DEPTH]),
        "bottom": (lum[-BAND:], lum[-DEPTH:-BAND]),
        "left": (lum[:, :BAND].T, lum[:, BAND:DEPTH].T),
        "right": (lum[:, -BAND:].T, lum[:, -DEPTH:-BAND].T),
    }
    problems = []
    for name, (strip, inner) in edges.items():
        share = cut(strip, inner)
        if share > 0.005:
            problems.append(f"type is cut by the {name} edge ({share * 100:.1f}% of it); move the camera so the edge falls between rows, or zoom less")
    return {"file": path, "ok": not problems, "problems": problems}


if __name__ == "__main__":
    for file in sys.argv[1:]:
        print(json.dumps(check(file)))
