"""Synthesises a placeholder music bed and the UI effects into public/audio.

The bed follows src/scenes/durations.json: soft at the opening and the name,
a light groove under the product shots, half-time under the principles,
and a fade with the end card.
"""

import json
import pathlib
import re
import wave

import numpy as np

RATE = 44100
FPS = int(re.search(r"export const FPS = (\d+)", (pathlib.Path(__file__).resolve().parent.parent / "src" / "theme.ts").read_text()).group(1))
BPM = 116
BEAT = 60 / BPM
HERE = pathlib.Path(__file__).resolve().parent.parent
OUT = HERE / "public" / "audio"
OUT.mkdir(parents=True, exist_ok=True)

durations = json.loads((HERE / "src" / "scenes" / "durations.json").read_text())
starts, cursor = {}, 0
for name, frames in durations.items():
    starts[name] = cursor / FPS
    cursor += frames
TOTAL = cursor / FPS
# Scene ids from durations.json: the groove runs from the first product shot up to the
# principles, half-time under the principles. Missing ids fall back to the film's end.
FIRST_PRODUCT_SHOT = "Command"
PRINCIPLES = "Principles"
END_CARD = "End"
GROOVE = (starts[FIRST_PRODUCT_SHOT], starts.get(PRINCIPLES, TOTAL))
HALF = (starts.get(PRINCIPLES, TOTAL), starts.get(END_CARD, TOTAL))

rng = np.random.default_rng(11)


def seconds(length: float) -> np.ndarray:
    return np.arange(int(length * RATE)) / RATE


def smooth(signal: np.ndarray, cutoff: float) -> np.ndarray:
    """One-pole low-pass, vectorised with a short FIR approximation."""
    taps = max(3, int(RATE / cutoff))
    kernel = np.exp(-np.arange(taps) * 2 * np.pi * cutoff / RATE)
    kernel /= kernel.sum()
    return np.convolve(signal, kernel, mode="same")


def hz(midi: float) -> float:
    return 440 * 2 ** ((midi - 69) / 12)


def save(name: str, signal: np.ndarray, peak: float = 0.9) -> None:
    if signal.ndim == 1:
        signal = np.stack([signal, signal], axis=1)
    signal = signal / (np.max(np.abs(signal)) or 1) * peak
    with wave.open(str(OUT / name), "wb") as file:
        file.setnchannels(2)
        file.setsampwidth(2)
        file.setframerate(RATE)
        file.writeframes((signal * 32767).astype("<i2").tobytes())


def add(track: np.ndarray, sound: np.ndarray, at: float, gain: float) -> None:
    start = int(at * RATE)
    if start >= len(track):
        return
    end = min(len(track), start + len(sound))
    track[start:end] += sound[: end - start] * gain


# Effects ------------------------------------------------------------------
t = seconds(0.06)
save("click.wav", smooth(rng.standard_normal(len(t)), 4500) * np.exp(-t * 120))
t = seconds(0.035)
save("key.wav", smooth(rng.standard_normal(len(t)), 6500) * np.exp(-t * 220), 0.6)
t = seconds(0.2)
save("pop.wav", np.sin(2 * np.pi * (520 + 1500 * t) * t) * np.exp(-t * 24))
t = seconds(0.7)
save("whoosh.wav", smooth(rng.standard_normal(len(t)), 1100) * np.sin(np.pi * t / 0.7) ** 2)
t = seconds(0.25)
clap = smooth(rng.standard_normal(len(t)), 3000) * (np.exp(-t * 38) + 0.4 * np.exp(-np.maximum(0, t - 0.012) * 30) * (t > 0.012))
save("clap.wav", clap + 0.6 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30))
t = seconds(0.45)
save("buzz.wav", (np.sign(np.sin(2 * np.pi * 110 * t)) * 0.4 + np.sin(2 * np.pi * 116 * t)) * np.exp(-t * 7), 0.7)
t = seconds(1.3)
save("chime.wav", sum(np.sin(2 * np.pi * hz(m) * t) * np.exp(-t * (3 + i)) * (t >= d) for i, (m, d) in enumerate([(81, 0), (85, 0.08), (88, 0.16)])))

# Bed ----------------------------------------------------------------------
t = seconds(TOTAL)
pads = np.zeros(len(t))
progression = [
    [57, 61, 64, 68, 71],  # Amaj9
    [54, 61, 64, 66, 69],  # F#m11
    [50, 57, 61, 64, 66],  # Dmaj9 (6)
    [52, 59, 62, 64, 68],  # E6sus
]
bar = BEAT * 4
for index in range(int(TOTAL / bar) + 2):
    chord = progression[index % len(progression)]
    at = index * bar
    local = seconds(bar + 0.8)
    envelope = np.minimum(1, local / 1.0) * np.clip((bar + 0.8 - local) / 0.8, 0, 1)
    pad = sum(np.sin(2 * np.pi * hz(m) * local * (1 + d)) for m in chord for d in (-0.003, 0.003))
    add(pads, pad * envelope, at, 0.045)
    in_groove = GROOVE[0] - 0.1 <= at < HALF[1]
    bass = np.sin(2 * np.pi * hz(chord[0] - 12) * local) * envelope
    add(pads, bass, at, 0.11 if in_groove else 0.035)
    for step in range(8):
        pluck_t = seconds(0.5)
        pluck = np.sin(2 * np.pi * hz(chord[(step * 2) % len(chord)] + 12) * pluck_t) * np.exp(-pluck_t * 9)
        add(pads, pluck, at + step * BEAT / 2, 0.03 if in_groove else 0.018)
pads = smooth(pads, 3200)

drums = np.zeros(len(t))
duck = np.ones(len(t))
kick_t = seconds(0.32)
kick = np.sin(2 * np.pi * (46 + 85 * np.exp(-kick_t * 28)) * kick_t) * np.exp(-kick_t * 10)
hat_t = seconds(0.045)
hat = rng.standard_normal(len(hat_t)) * np.exp(-hat_t * 100)
hat = hat - smooth(hat, 5000)
step = 0
while step * BEAT < TOTAL:
    at = step * BEAT
    groove = GROOVE[0] <= at < GROOVE[1]
    half = HALF[0] <= at < HALF[1]
    if groove or (half and step % 2 == 0):
        add(drums, kick, at, 0.5)
        a, b = int(at * RATE), min(len(t), int((at + 0.22) * RATE))
        duck[a:b] = np.minimum(duck[a:b], np.linspace(0.6, 1, b - a))
    if groove:
        add(drums, hat, at + BEAT / 2, 0.1)
    step += 1

mix = pads * duck + drums
mix *= np.minimum(1, t / 1.0) * np.clip((TOTAL - t) / 2.2, 0, 1)
left = mix + 0.25 * np.roll(mix, int(0.012 * RATE))
right = mix + 0.25 * np.roll(mix, int(0.019 * RATE))
save("bed.wav", np.stack([left, right], axis=1), 0.55)
print(f"bed {TOTAL:.2f}s, effects in {OUT}")
