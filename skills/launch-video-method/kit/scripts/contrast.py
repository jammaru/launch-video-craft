"""Checks that type on a flat field can be read. Usage: contrast.py still.png [still.png ...]

Prints one JSON object per still: {"file", "ok", "problems": [...]}.

The frame is cut into a 12×8 grid. In each cell the background is the median colour.
Pixels that differ from it are something drawn there (type, a logo). Two failures:
- busy: the cell's background is not flat (under 55% of pixels near the median), so type
  sits on a photograph or texture. Headlines, title cards, and end cards sit on a plain field.
- faint: a visible mark whose strongest pixels reach under 3:1 against the background,
  like a dark logo on a dark card.
- blank: almost nothing differs from the frame's median colour, so nothing can be read,
  like white type on a white field.
"""

import json
import subprocess
import sys

import numpy as np

COLS, ROWS = 12, 8


def load(path: str) -> np.ndarray:
    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    ).stdout.strip().split(",")
    w, h = int(probe[0]), int(probe[1])
    raw = subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-i", path, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True, check=True,
    ).stdout
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(float) / 255


def luminance(rgb: np.ndarray) -> np.ndarray:
    c = np.where(rgb <= 0.03928, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def ratio(a, b):
    return (np.maximum(a, b) + 0.05) / (np.minimum(a, b) + 0.05)


def check(path: str) -> dict:
    lum = luminance(load(path))
    h, w = lum.shape
    problems = []
    drawn = float((ratio(lum, float(np.median(lum))) >= 1.06).mean())
    if drawn < 0.002:
        return {"file": path, "ok": False, "problems": [f"blank: only {drawn * 100:.2f}% of the frame differs from its field; the type may be the same colour as its field"]}
    busy, faint = [], []
    for row in range(ROWS):
        for col in range(COLS):
            cell = lum[row * h // ROWS:(row + 1) * h // ROWS, col * w // COLS:(col + 1) * w // COLS]
            bg = float(np.median(cell))
            r = ratio(cell, bg)
            near = float((r < 1.06).mean())
            marks = r[r >= 1.06]
            if near < 0.55:
                busy.append((col, row, round(near, 2)))
                continue
            if marks.size >= cell.size * 0.02:
                strongest = float(np.percentile(marks, 90))
                if strongest < 3:
                    faint.append((col, row, round(strongest, 2)))
    if busy:
        problems.append(f"busy field behind type in {len(busy)} of {ROWS * COLS} cells (e.g. column {busy[0][0]}, row {busy[0][1]}: only {int(busy[0][2] * 100)}% flat); put type on a plain field")
    if faint:
        worst = min(faint, key=lambda c: c[2])
        problems.append(f"faint mark in {len(faint)} cells, as low as {worst[2]}:1 (column {worst[0]}, row {worst[1]}); it needs 3:1 against its background")
    return {"file": path, "ok": not problems, "problems": problems}


if __name__ == "__main__":
    for file in sys.argv[1:]:
        print(json.dumps(check(file)))
