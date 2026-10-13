"""Finds stretches of a rendered film where the frame is one flat colour. Usage: blank.py film.mp4

Prints JSON: [{"from": seconds, "to": seconds}, ...] for runs of at least 0.5 seconds,
ignoring the first 0.3 seconds and the final fade (last 1.2 seconds). A run means nothing is
on screen: a shot whose type matches its field, a scene that did not mount, a gap between shots.

A frame is flat only when every tile is flat. A thin line or a small node makes its own tile
busy, so the check does not require a disc or a bar added just to survive the downscale.
"""

import json
import subprocess
import sys

import numpy as np

W, H, RATE, TILE = 480, 270, 10, 24

film = sys.argv[1]
raw = subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-i", film, "-vf", f"fps={RATE},scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"],
    capture_output=True, check=True,
).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(float)
end = len(frames) / RATE


def flat(frame: np.ndarray) -> bool:
    for y in range(0, H, TILE):
        for x in range(0, W, TILE):
            if frame[y:y + TILE, x:x + TILE].std() >= 1.5:
                return False
    return True


runs, start = [], None
for i, frame in enumerate(list(frames) + [None]):
    is_flat = frame is not None and flat(frame)
    if is_flat and start is None:
        start = i
    if not is_flat and start is not None:
        a, b = start / RATE, i / RATE
        if b - a >= 0.5 and b > 0.3 and a < end - 1.2:
            runs.append({"from": round(a, 2), "to": round(b, 2)})
        start = None
print(json.dumps(runs))
