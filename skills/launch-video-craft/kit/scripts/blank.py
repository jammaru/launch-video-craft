"""Finds stretches of a rendered film where the frame is one flat colour. Usage: blank.py film.mp4

Prints JSON: [{"from": seconds, "to": seconds}, ...] for runs of at least 0.5 seconds,
ignoring the first 0.3 seconds and the final fade (last 1.2 seconds). A run means nothing is
on screen: a shot whose type matches its field, a scene that did not mount, a gap between shots.
"""

import json
import subprocess
import sys

import numpy as np

W, H, RATE = 96, 54, 10

film = sys.argv[1]
raw = subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-i", film, "-vf", f"fps={RATE},scale={W}:{H}:flags=area,format=gray", "-f", "rawvideo", "-"],
    capture_output=True, check=True,
).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(float)
end = len(frames) / RATE
runs, start = [], None
for i, frame in enumerate(list(frames) + [None]):
    flat = frame is not None and frame.std() < 1.5
    if flat and start is None:
        start = i
    if not flat and start is not None:
        a, b = start / RATE, i / RATE
        if b - a >= 0.5 and b > 0.3 and a < end - 1.2:
            runs.append({"from": round(a, 2), "to": round(b, 2)})
        start = None
print(json.dumps(runs))
