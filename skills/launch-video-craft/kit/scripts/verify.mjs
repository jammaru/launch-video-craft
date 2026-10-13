// npm run verify: renders the stills a reviewer needs, checks what a machine can check,
// and writes review/report.json. `npm run render` refuses to run until this passes.
//
// For every shot with a beat sheet it renders, with the framing overlay on:
//   headline (mid-read and mid-exit), landed (window at rest), and per action: press, result, hold end.
// A beat sheet with no clicks also gets the body after the headline, the middle, and near the end.
// Shots without a beat sheet (title, logo, end card) get 3 stills.
// Then it checks: no guessed fallback coordinates in scenes, every still rendered
// (assertBeats / assertFraming did not throw), type on flat fields is readable, held frames
// do not cut type, every window shows the product's real page or captured output, and the
// backdrop has no writing.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { build } from "esbuild";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
const filmFps = Number(readFileSync(join(here, "src/theme.ts"), "utf8").match(/export const FPS = (\d+)/)?.[1] ?? 60);
/** A duration designed at 30fps, in this film's frames. */
const span = (at30) => Math.round(at30 * (filmFps / 30));
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
  if (!b) return [["early", Math.round(d * 0.25)], ["middle", Math.round(d * 0.5)], ["late", d - span(10)]];
  const list = [];
  if (b.headline) list.push(["headline", Math.round((b.headline.in + b.headline.out) / 2) + span(8)]);
  // Mid-exit: the type is still visible; whatever is behind it must be its field, not the photograph.
  if (b.headline) list.push(["headline-exit", b.headline.out + span(4)]);
  if (b.window) list.push(["landed", b.window.landed + 2]);
  for (const a of b.actions) {
    if (a.press !== undefined) list.push([`${a.name}-press`, a.press]);
    list.push([`${a.name}-result`, a.resultCamera + 2]);
    list.push([`${a.name}-hold-end`, Math.min(a.holdUntil, d) - 2]);
  }
  // No click means the only proof of the shot is the picture after the title. Render that
  // picture. A readable headline on a flat field is not the shot.
  if (!b.actions.length) {
    const after = Math.min(d - span(12), Math.max((b.headline?.out ?? 0) + span(20), Math.round(d * 0.35)));
    const mid = Math.min(d - span(12), Math.max(after + 1, Math.round(d * 0.62)));
    const end = d - span(12);
    if (after < d) list.push(["body", after]);
    if (mid > after) list.push(["body-mid", mid]);
    if (end > mid) list.push(["body-end", end]);
  }
  return list;
}

const stillOptions = { chromiumOptions: { gl: "angle" } };

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
      await renderStill({ ...stillOptions, composition, serveUrl, frame, output, inputProps: { debug: true }, imageFormat: "png" });
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
const exits = stills.filter((s) => s.label === "headline-exit");
const contrast = (files, extra = []) => {
  if (!files.length) return;
  const out = execFileSync("python3", [join(here, "scripts/contrast.py"), ...extra, ...files.map((s) => join(here, s.file))], { encoding: "utf8" });
  for (const line of out.trim().split("\n").filter(Boolean)) {
    const result = JSON.parse(line);
    if (!result.ok) failures.push(`${relative(here, result.file)}: ${result.problems.join("; ")}`);
  }
};
contrast(flat);
contrast(exits, ["--busy-only"]);
// The body of a shot with no clicks may be a graph, a diff, or a network. Those are busy on
// purpose. The check is only that the frame is not an empty field.
contrast(stills.filter((s) => s.label.startsWith("body")), ["--blank-only"]);

// 5. Held frames end between rows, not through a line of type. The hold-end stills are rendered
// again without the debug overlay, whose outlines would read as cut strokes.
for (const [id, b] of Object.entries(sheets)) {
  const composition = await selectComposition({ serveUrl, id: `Shot-${id}` });
  const files = [];
  for (const a of b.actions) {
    for (const [label, frame] of [["result", a.resultCamera + 2], ["hold-end", a.holdUntil - 2]]) {
      const output = join(reviewDir, id, `clean-${String(frame).padStart(4, "0")}-${a.name}-${label}.png`);
      try {
        await renderStill({ ...stillOptions, composition, serveUrl, frame, output, imageFormat: "png" });
        files.push(output);
      } catch {
        // The framing error was already reported by the debug render of this shot.
      }
    }
  }
  if (!files.length) continue;
  const out = execFileSync("python3", [join(here, "scripts/edges.py"), ...files], { encoding: "utf8" });
  for (const line of out.trim().split("\n").filter(Boolean)) {
    const result = JSON.parse(line);
    if (!result.ok) failures.push(`${relative(here, result.file)}: ${result.problems.join("; ")}`);
  }
}

// 6. The window shows the product, not a lookalike. A web page must be the product's own build in
// ProductFrame, and its landed frame must match the screenshot shootProduct took of that build.
// A terminal or agent window must render the captured JSON it names.
const pairs = [];
const sceneText = (id) => ["tsx", "beats.ts"].map((ext) => join(scenesDir, `${id}.${ext}`)).filter(existsSync).map((f) => readFileSync(f, "utf8")).join("\n");
const sheetsLoaded = Object.keys(sheets).length === beatFiles.length;
for (const id of sheetsLoaded ? Object.keys(durations) : []) {
  if (/<Window\b/.test(sceneText(id)) && !sheets[id]?.window) failures.push(`${id}: the scene draws a Window but its beat sheet has no window (with window.real), so nothing checks what it shows`);
}
for (const [id, b] of Object.entries(sheets)) {
  const real = b.window?.real;
  if (!real) continue;
  const scene = sceneText(id);
  if (real.capture) {
    const name = real.capture.split("/").pop();
    if (!existsSync(join(here, real.capture))) failures.push(`${id}: window.real.capture ${real.capture} does not exist; run npm run capture`);
    else if (!new RegExp(`import .* from ["'][^"']*${name.replace(/\./g, "\\.")}["']`).test(scene)) failures.push(`${id}: the scene does not import ${real.capture}, so the window is not showing what was captured`);
    else if (!/from ["']\.\.\/components\/(Terminal|Chat)["']|from ["'][^"']*vendor\//.test(scene)) {
      failures.push(`${id}: window.real.capture is for a terminal, an agent, or a page drawn with the product's shipped CSS (src/vendor/); a web page the product builds is shot with shootProduct and shown with ProductFrame`);
    }
    continue;
  }
  const shot = join(here, real.screenshot);
  const record = existsSync(join(here, "capture/real/real.json")) ? JSON.parse(readFileSync(join(here, "capture/real/real.json"), "utf8")) : { shots: {} };
  if (!existsSync(shot) || !Object.values(record.shots).some((s) => s.screenshot === real.screenshot)) {
    failures.push(`${id}: ${real.screenshot} was not taken by shootProduct (capture/lib.mjs); shoot the product's built page in npm run capture`);
    continue;
  }
  if (!existsSync(join(here, "public/product"))) failures.push(`${id}: public/product/ is missing; shootProduct copies the product's build there`);
  if (!/<ProductFrame\b/.test(scene) || !/useProduct\(/.test(scene)) {
    failures.push(`${id}: the scene does not render the product's page with useProduct + <ProductFrame>; a redrawn copy of the UI is not the product`);
    continue;
  }
  const composition = await selectComposition({ serveUrl, id: `Shot-${id}` });
  const output = join(reviewDir, id, `clean-${String(b.window.landed + 2).padStart(4, "0")}-real.png`);
  try {
    await renderStill({ ...stillOptions, composition, serveUrl, frame: b.window.landed + 2, output, imageFormat: "png" });
    pairs.push(real.screenshot, relative(here, output), "150,137,1620,889");
  } catch {
    // Reported by the debug render.
  }
}
if (pairs.length) {
  const out = execFileSync("python3", [join(here, "scripts/similar.py"), ...pairs], { cwd: here, encoding: "utf8" });
  for (const line of out.trim().split("\n").filter(Boolean)) {
    const result = JSON.parse(line);
    if (!result.ok) failures.push(`${result.file}: ${result.problems.join("; ")}`);
  }
}

// 7. The backdrop photograph has no writing in it. Image models paint the words of their prompt
// (a product name, "launch") into skies and signs; tesseract finds them when it is installed.
const backdrop = join(here, "public/backdrop.jpg");
if (existsSync(backdrop)) {
  try {
    const tsv = execFileSync("tesseract", [backdrop, "-", "--psm", "11", "tsv"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const words = tsv
      .split("\n")
      .slice(1)
      .map((row) => row.split("\t"))
      .filter((cols) => Number(cols[10]) >= 75 && /[A-Za-z]{3,}/.test(cols[11] ?? ""))
      .map((cols) => cols[11]);
    if (words.length) failures.push(`public/backdrop.jpg has writing in it (${words.slice(0, 6).join(", ")}): generate it again from a prompt that names only a place`);
  } catch {
    console.log("tesseract is not installed: look at public/backdrop.jpg at full size for letters, signs, and logos yourself.");
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
