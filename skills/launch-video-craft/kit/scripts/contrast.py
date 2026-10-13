"""Checks that type on a flat field can be read. Usage: contrast.py [--busy-only | --blank-only] still.png [...]

--busy-only checks that exiting type still has a plain field behind it.
--blank-only checks that the frame is not an empty field. Use it on the body of a shot,
where the picture is supposed to be busy.

Prints one JSON object per still: {"file", "ok", "problems": [...]}.

The frame is cut into a 12×8 grid. In each cell the background is the median colour.
Pixels that differ from it are something drawn there (type, a logo, the object). Failures:
- type on a picture: the only marks sit in cells whose background is not flat. The words
  need their own plain plate. The rest of the frame may keep the object.
- faint: no flat cell reaches 3:1, so the type itself is too light (a dark logo on an ink card).
  A smooth object beside type that already reads at 3:1 is not a failed headline.
- blank: a headline where almost nothing differs from the frame's median colour, or a body
  still (--blank-only) where no cell has a mark. One word is enough for the body.
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


def check(path: str, busy_only: bool = False, blank_only: bool = False) -> dict:
    lum = luminance(load(path))
    h, w = lum.shape
    problems = []
    drawn = float((ratio(lum, float(np.median(lum))) >= 1.06).mean())
    if blank_only:
        # One word or one line is the shot. Fail only when no cell has a mark, which is an
        # empty field. A whole-frame percentage treats that word as nothing.
        for row in range(ROWS):
            for col in range(COLS):
                cell = lum[row * h // ROWS:(row + 1) * h // ROWS, col * w // COLS:(col + 1) * w // COLS]
                marks = ratio(cell, float(np.median(cell)))
                if float((marks >= 1.06).mean()) >= 0.005:
                    return {"file": path, "ok": True, "problems": []}
        return {"file": path, "ok": False, "problems": ["blank: no cell has a mark; the body after the headline is an empty field"]}
    if drawn < 0.002 and not busy_only:
        return {"file": path, "ok": False, "problems": [f"blank: only {drawn * 100:.2f}% of the frame differs from its field; nothing is on screen"]}
    readable, faint, on_picture = [], [], []
    for row in range(ROWS):
        for col in range(COLS):
            cell = lum[row * h // ROWS:(row + 1) * h // ROWS, col * w // COLS:(col + 1) * w // COLS]
            bg = float(np.median(cell))
            r = ratio(cell, bg)
            near = float((r < 1.06).mean())
            marks = r[r >= 1.06]
            if marks.size < cell.size * 0.02:
                continue
            if near < 0.55:
                on_picture.append((col, row, round(near, 2)))
                continue
            strongest = float(np.percentile(marks, 90))
            if strongest < 3:
                faint.append((col, row, round(strongest, 2)))
            else:
                readable.append((col, row))
    # Words need one flat cell at 3:1 or more. A picture, or a smooth object under 3:1,
    # may fill the rest of the frame. Faint cells fail only when nothing on a flat field reads.
    if on_picture and not readable and not (busy_only and faint):
        sample = on_picture[0]
        problems.append(f"type sits on a picture (column {sample[0]}, row {sample[1]} is only {int(sample[2] * 100)}% flat); give the words a plain plate. The rest of the frame may keep the object")
    if not busy_only and faint and not readable:
        worst = min(faint, key=lambda c: c[2])
        problems.append(f"faint mark in {len(faint)} cells, as low as {worst[2]}:1 (column {worst[0]}, row {worst[1]}); it needs 3:1 against its background")
    return {"file": path, "ok": not problems, "problems": problems}


if __name__ == "__main__":
    args = sys.argv[1:]
    busy_only = "--busy-only" in args
    blank_only = "--blank-only" in args
    flags = {"--busy-only", "--blank-only"}
    for file in (a for a in args if a not in flags):
        print(json.dumps(check(file, busy_only, blank_only)))
