// `npm run finish`: the last step before the film is handed over. It passes only when
// `npm run inspect` ran on the current mp4 without failures, and NOTES.md under "Film checked"
// has a written line for the backdrop and for every shot, made after looking at review/film-sheet.png.
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const report = join(here, "review/film.json");

if (!existsSync(report)) {
  problems.push("review/film.json is missing: run `npm run render` (it runs inspect), or `npm run inspect`.");
} else {
  const { film, failures } = JSON.parse(readFileSync(report, "utf8"));
  const mp4 = resolve(here, film);
  if (failures.length) problems.push(`the last inspect had ${failures.length} failures: fix the shots, render, and inspect again.`);
  if (!existsSync(mp4)) problems.push(`${film} is gone.`);
  else if (statSync(mp4).mtimeMs > statSync(report).mtimeMs) problems.push("the film was rendered again after the last inspect: run `npm run inspect`.");
}

const durations = JSON.parse(readFileSync(join(here, "src/scenes/durations.json"), "utf8"));
const notes = existsSync(join(here, "NOTES.md")) ? readFileSync(join(here, "NOTES.md"), "utf8") : "";
const section = notes.split(/^## Film checked\s*$/m)[1]?.split(/^## /m)[0] ?? "";
for (const id of ["Backdrop", ...Object.keys(durations)]) {
  const line = section.split("\n").find((l) => l.startsWith(`- ${id}:`));
  if (!line || line.length < id.length + 40 || /^- \w+:\s*\(.*\)\s*$/.test(line.trim())) {
    problems.push(`NOTES.md "Film checked" has no real line for ${id}: open review/film-sheet.png${id === "Backdrop" ? " and public/backdrop.jpg at full size" : ""} and write what you saw.`);
  }
}

if (problems.length) {
  console.error(`Not finished:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("Finished: the film was inspected after its last render and every shot was looked at.");
