// Runs before `npm run render`. The delivery render is refused unless:
// - `npm run verify` passed after the last change to src/, public/, or capture/
// - NOTES.md has a "Stills checked" line for every shot, written after looking at its sheet
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
const problems = [];
const report = join(here, "review/report.json");

const newest = (dir) => {
  if (!existsSync(dir)) return 0;
  return Math.max(0, ...readdirSync(dir, { recursive: true }).map((f) => statSync(join(dir, f)).mtimeMs));
};

if (!existsSync(report)) {
  problems.push("review/report.json is missing: run `npm run verify`.");
} else {
  const { failures } = JSON.parse(readFileSync(report, "utf8"));
  if (failures.length) problems.push(`the last verify had ${failures.length} failures: fix them and run \`npm run verify\` again.`);
  const changed = Math.max(newest(join(here, "src")), newest(join(here, "public")), newest(join(here, "capture")));
  if (changed > statSync(report).mtimeMs) problems.push("files changed after the last verify: run `npm run verify` again.");
}

const durations = JSON.parse(readFileSync(join(here, "src/scenes/durations.json"), "utf8"));
const notes = existsSync(join(here, "NOTES.md")) ? readFileSync(join(here, "NOTES.md"), "utf8") : "";
const section = notes.split(/^## Stills checked\s*$/m)[1]?.split(/^## /m)[0] ?? "";
for (const id of Object.keys(durations)) {
  const line = section.split("\n").find((l) => l.startsWith(`- ${id}:`));
  if (!line || line.length < id.length + 40 || /^- \w+:\s*\(.*\)\s*$/.test(line.trim())) {
    problems.push(`NOTES.md "Stills checked" has no real line for ${id}: open review/${id}-sheet.png and write what each still shows (the press on its target, the result in view, the type readable).`);
  }
}

if (problems.length) {
  console.error(`Render refused:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
