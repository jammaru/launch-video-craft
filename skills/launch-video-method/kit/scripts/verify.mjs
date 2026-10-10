// npm run verify: renders the stills a reviewer needs, checks what a machine can check,
// and writes review/report.json. `npm run render` refuses to run until this passes.
//
// For every shot with a beat sheet it renders, with the framing overlay on:
//   headline (mid-read), landed (window at rest), and per action: press, result, hold end.
// Shots without a beat sheet (title, logo, end card) get 3 stills.
// Then it checks: no guessed fallback coordinates in scenes, every still rendered
// (assertBeats / assertFraming did not throw), and type on flat fields is readable.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { build } from "esbuild";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
const reviewDir = join(here, "review");
rmSync(reviewDir, { recursive: true, force: true });
mkdirSync(reviewDir, { recursive: true });
const failures = [];
const seen = new Set();
/** The reasons from an assertBeats / assertFraming error, once per shot. */
function report(where, error) {
  const lines = String(error?.message ?? error).split("\n");
  const start = lines.findIndex((l) => /(beats|framing):/.test(l));
  let end = start + 1;
  while (start >= 0 && end < lines.length && lines[end].startsWith("- ")) end += 1;
  const reasons = start >= 0 ? lines.slice(start, end) : lines.slice(0, 6);
  const text = reasons.filter(Boolean).join("\n    ");
  const key = `${where.split(" ")[0]}|${text}`;
  if (seen.has(key)) return;
  seen.add(key);
  failures.push(`${where}: ${text}`);
}

// 1. Scenes must not hide a failed measurement behind a guessed position.
const scenesDir = join(here, "src/scenes");
const sources = readdirSync(join(here, "src"), { recursive: true }).filter((f) => /\.tsx?$/.test(f));
for (const file of sources) {
  const text = readFileSync(join(here, "src", file), "utf8");
  text.split("\n").forEach((line, index) => {
    if (/\?\?\s*\{\s*x:\s*-?\d/.test(line) || /\?.*:\s*\{\s*x:\s*-?\d/.test(line)) {
      failures.push(`src/${file}:${index + 1}: a guessed fallback position (\`?? { x: … }\` or \`? … : { x: … }\`); use pointIn(box) so a missing anchor fails instead of landing somewhere plausible`);
    }
  });
}

// 2. The beat sheets, loaded through esbuild (they are TypeScript and import JSON).
const durations = JSON.parse(readFileSync(join(scenesDir, "durations.json"), "utf8"));
const beatFiles = readdirSync(scenesDir).filter((f) => f.endsWith(".beats.ts"));
const entry = beatFiles.map((f, i) => `export * as b${i} from "./src/scenes/${f}";`).join("\n");
const beatsOut = join(reviewDir, ".beats.mjs");
const sheets = {};
try {
  await build({ stdin: { contents: entry, resolveDir: here, loader: "ts" }, bundle: true, format: "esm", platform: "node", packages: "external", outfile: beatsOut, logLevel: "silent" });
  const loaded = await import(pathToFileURL(beatsOut).href);
  beatFiles.forEach((f, i) => (sheets[f.replace(".beats.ts", "")] = loaded[`b${i}`].beats));
} catch (error) {
  failures.push(`beat sheets: ${String(error.message ?? error).split("\n").slice(0, 8).join(" / ")}`);
}

function framesFor(id) {
  const b = sheets[id];
  const d = durations[id];
  if (!b) return [["early", Math.round(d * 0.25)], ["middle", Math.round(d * 0.5)], ["late", d - 10]];
  const list = [];
  if (b.headline) list.push(["headline", Math.round((b.headline.in + b.headline.out) / 2) + 8]);
  if (b.window) list.push(["landed", b.window.landed + 2]);
  for (const a of b.actions) {
    if (a.press !== undefined) list.push([`${a.name}-press`, a.press]);
    list.push([`${a.name}-result`, a.resultCamera + 2]);
    list.push([`${a.name}-hold-end`, Math.min(a.holdUntil, d) - 2]);
  }
  return list;
}

// 3. Render every still with the overlay on.
const serveUrl = await bundle({ entryPoint: join(here, "src/index.ts") });
const stills = [];
for (const id of Object.keys(durations)) {
  const dir = join(reviewDir, id);
  mkdirSync(dir, { recursive: true });
  let composition;
  try {
    composition = await selectComposition({ serveUrl, id: `Shot-${id}`, inputProps: { debug: true } });
  } catch (error) {
    report(id, error);
    continue;
  }
  for (const [label, frame] of framesFor(id)) {
    const output = join(dir, `${String(frame).padStart(4, "0")}-${label}.png`);
    try {
      await renderStill({ composition, serveUrl, frame, output, inputProps: { debug: true }, imageFormat: "png" });
      stills.push({ shot: id, label, frame, file: relative(here, output) });
    } catch (error) {
      report(`${id} frame ${frame} (${label})`, error);
    }
  }
  const pngs = readdirSync(dir).filter((f) => f.endsWith(".png"));
  if (pngs.length) {
    execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-pattern_type", "glob", "-i", join(dir, "*.png"), "-vf", `scale=640:-1,tile=3x${Math.ceil(pngs.length / 3)}`, "-frames:v", "1", join(reviewDir, `${id}-sheet.png`)]);
  }
}

// 4. Type on flat fields: headline frames and shots without a beat sheet (title, logo, end card).
const flat = stills.filter((s) => s.label === "headline" || !sheets[s.shot]);
if (flat.length) {
  const out = execFileSync("python3", [join(here, "scripts/contrast.py"), ...flat.map((s) => join(here, s.file))], { encoding: "utf8" });
  for (const line of out.trim().split("\n").filter(Boolean)) {
    const result = JSON.parse(line);
    if (!result.ok) failures.push(`${relative(here, result.file)}: ${result.problems.join("; ")}`);
  }
}

writeFileSync(join(reviewDir, "report.json"), `${JSON.stringify({ at: new Date().toISOString(), failures, stills }, null, 2)}\n`);
console.log(`${stills.length} stills in review/, one sheet per shot (review/<Shot>-sheet.png).`);
if (failures.length) {
  console.log(`\n${failures.length} failed:`);
  for (const f of failures) console.log(`- ${f}`);
  process.exit(1);
}
console.log("\nMachine checks passed. Now open every review/<Shot>-sheet.png and write what you saw in NOTES.md under \"Stills checked\".");
