// Runs after the delivery render (`npm run render` calls it). Reviews the finished mp4 itself,
// because a composition that passed verify can still render wrong: a font or asset that did
// not load, a cut that lands on black, a shot where nothing moves.
// - review/film/<shot>-<label>.png at the start, a quarter, half, three quarters, and end of
//   every shot, and review/film-sheet.png with one row per shot
// - fails on black or any flat colour over 0.5s before the final fade, the same picture for
//   over 4s, and missing or silent audio
// Then open the sheet and write what each row shows under "Film checked" in NOTES.md;
// `npm run finish` checks that before the film is handed over.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
const film = resolve(here, process.argv[2] ?? "../launch.mp4");
const fpsFrom = (rate) => {
  const [num, den] = String(rate ?? "30/1").split("/").map(Number);
  return den ? num / den : num;
};
const failures = [];

if (!existsSync(film)) {
  console.error(`${film} does not exist: run \`npm run render\` first.`);
  process.exit(1);
}

// Shot order comes from Film.tsx; lengths from durations.json.
const durations = JSON.parse(readFileSync(join(here, "src/scenes/durations.json"), "utf8"));
const order = [...readFileSync(join(here, "src/Film.tsx"), "utf8").matchAll(/\{\s*id:\s*"(\w+)"/g)].map((m) => m[1]);
const shots = [];
let start = 0;
for (const id of order) {
  shots.push({ id, start, length: durations[id] });
  start += durations[id];
}

const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate", "-of", "json", film], { encoding: "utf8" }));
const seconds = Number(probe.format.duration);
const video = probe.streams.find((stream) => stream.codec_type === "video");
const fps = fpsFrom(video?.r_frame_rate);
if (Math.abs(seconds - start / fps) > 0.2) failures.push(`the film is ${seconds.toFixed(2)}s; the shots add up to ${(start / fps).toFixed(2)}s`);

// 1. Stills from the film, five per shot.
const outDir = join(here, "review/film");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const stills = [];
shots.forEach((shot, index) => {
  const points = [
    ["start", 8],
    ["quarter", Math.round(shot.length / 4)],
    ["half", Math.round(shot.length / 2)],
    ["three-quarters", Math.round((shot.length * 3) / 4)],
    ["end", shot.length - 8],
  ];
  points.forEach(([label, local], k) => {
    const file = join(outDir, `${String(index).padStart(2, "0")}${k}-${shot.id}-${label}.png`);
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-ss", ((shot.start + local) / fps).toFixed(3), "-i", film, "-frames:v", "1", file]);
    stills.push({ shot: shot.id, label, frame: shot.start + local, file: relative(here, file) });
  });
});
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-pattern_type", "glob", "-i", join(outDir, "*.png"), "-vf", `scale=480:-1,tile=5x${shots.length}`, "-frames:v", "1", join(here, "review/film-sheet.png")]);

// 2. Flat (black, white, or any one colour), frozen, silent. blank.py finds flat frames by their
// spread of values, so an ink field with type on it is not mistaken for black.
const detect = (filter, extra = []) => spawnSync("ffmpeg", ["-hide_banner", "-i", film, ...extra, "-vf", filter, "-an", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const shotAt = (t) => shots.find((s) => t * fps >= s.start && t * fps < s.start + s.length)?.id ?? "end";

for (const run of JSON.parse(execFileSync("python3", [join(here, "scripts/blank.py"), film], { encoding: "utf8" }))) {
  failures.push(`nothing on screen from ${run.from}s to ${run.to}s (${shotAt(run.from)}): a flat frame, often type the same colour as its field`);
}
const freezes = detect("freezedetect=n=0.002:d=4");
for (const m of freezes.matchAll(/freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g)) {
  const [from, length] = [Number(m[1]), Number(m[2])];
  failures.push(`the picture does not change for ${length.toFixed(1)}s from ${from.toFixed(2)}s (${shotAt(from)}): show the next thing sooner`);
}

const hasAudio = probe.streams.some((s) => s.codec_type === "audio");
if (!hasAudio) failures.push("the film has no audio stream");
else {
  const volume = spawnSync("ffmpeg", ["-hide_banner", "-i", film, "-af", "volumedetect", "-vn", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const mean = Number(volume.match(/mean_volume: (-?[\d.]+) dB/)?.[1] ?? -91);
  if (mean < -45) failures.push(`the audio is nearly silent (mean ${mean} dB)`);
}

writeFileSync(join(here, "review/film.json"), `${JSON.stringify({ at: new Date().toISOString(), film: relative(here, film), seconds, failures, stills }, null, 2)}\n`);
console.log(`${stills.length} stills from the finished film in review/film/, sheet at review/film-sheet.png (one row per shot).`);
if (failures.length) {
  console.log(`\n${failures.length} failed:`);
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
console.log('\nMachine checks passed. Open review/film-sheet.png, write one line per shot under "Film checked" in NOTES.md, then `npm run finish`.');
