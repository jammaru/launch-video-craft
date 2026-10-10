"""Checks that a product shot shows the product's real page. Usage:
similar.py real.png still.png x,y,w,h [real.png still.png x,y,w,h ...]

Prints one JSON object per pair: {"file", "ok", "score", "problems": [...]}.

`real.png` is the page as the product's own build renders it in a headless browser
(capture/real/<Shot>.png). The window body of the film's landed still (the x,y,w,h box) should
be that page. Both are reduced to 162 px wide grey images; their edge maps (where type, cards,
and borders are) are compared by normalised correlation, allowing the body to sit up to
about 40 px off. The same page scores about 0.8; a lookalike rebuilt from the product's CSS
scored 0.14, one drawn from scratch 0.07.
"""

import json
import sys

import numpy as np

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from contrast import load  # noqa: E402

W = 162
SHIFT = 4
THRESHOLD = 0.5


def grey(rgb: np.ndarray, w: int) -> np.ndarray:
    h = round(rgb.shape[0] * w / rgb.shape[1])
    ys = (np.arange(h) * rgb.shape[0] / h).astype(int)
    xs = (np.arange(w) * rgb.shape[1] / w).astype(int)
    # Area average: mean of the block each output pixel covers.
    block_h, block_w = max(1, rgb.shape[0] // h), max(1, rgb.shape[1] // w)
    g = rgb.mean(axis=2)
    out = np.zeros((h, w))
    for dy in range(block_h):
        for dx in range(block_w):
            out += g[np.minimum(ys + dy, g.shape[0] - 1)][:, np.minimum(xs + dx, g.shape[1] - 1)]
    return out / (block_h * block_w)


def edges(a: np.ndarray) -> np.ndarray:
    e = np.abs(np.diff(a, axis=1))[:-1] + np.abs(np.diff(a, axis=0))[:, :-1]
    p = np.pad(e, 1, mode="edge")
    return sum(p[i : i + e.shape[0], j : j + e.shape[1]] for i in range(3) for j in range(3)) / 9


def ncc(a: np.ndarray, b: np.ndarray) -> float:
    a = a - a.mean()
    b = b - b.mean()
    d = np.sqrt((a * a).sum() * (b * b).sum())
    return float((a * b).sum() / d) if d > 0 else 0.0


def score(real: np.ndarray, film: np.ndarray) -> float:
    best = 0.0
    m = SHIFT
    core = real[m:-m, m:-m]
    for dy in range(-m, m + 1):
        for dx in range(-m, m + 1):
            window = film[m + dy : film.shape[0] - m + dy, m + dx : film.shape[1] - m + dx]
            if window.shape == core.shape:
                best = max(best, ncc(core, window))
    return best


def main() -> None:
    args = sys.argv[1:]
    for i in range(0, len(args), 3):
        real_path, still_path, box = args[i : i + 3]
        x, y, w, h = (int(v) for v in box.split(","))
        film = load(still_path)[y : y + h, x : x + w]
        real = load(real_path)
        a = edges(grey(real, W))
        b = edges(grey(film, W))
        rows = min(a.shape[0], b.shape[0])
        s = score(a[:rows], b[:rows])
        problems = []
        if s < THRESHOLD:
            problems.append(
                f"the window shows something other than the product's page ({real_path}): edge match {s:.2f}, needs {THRESHOLD}. "
                "Render the product's own build with ProductFrame instead of redrawing it, and land the window wide (scale 1) in the state that was shot"
            )
        print(json.dumps({"file": still_path, "ok": not problems, "score": round(s, 3), "problems": problems}))


if __name__ == "__main__":
    main()
