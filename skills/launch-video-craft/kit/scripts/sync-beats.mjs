// Writes src/lib/beats.ts from the `assertBeats` block in the skill's reference.md,
// so every film checks its beat sheets with the published rules, not a local copy.
// Set SKILL_DIR when the skill is installed somewhere else.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(here, "..", "..");
const skill = "launch-video-craft";
const candidates = [
  process.env.SKILL_DIR,
  join(here, ".."),
  join(repo, ".agents/skills", skill),
  join(repo, ".claude/skills", skill),
  join(repo, ".cursor/skills", skill),
  join(repo, "skills", skill),
  join(homedir(), ".agents/skills", skill),
  join(homedir(), ".claude/skills", skill),
  join(homedir(), ".cursor/skills", skill),
].filter(Boolean);
const dir = candidates.find((path) => existsSync(join(path, "reference.md")));
if (!dir) throw new Error(`reference.md not found; set SKILL_DIR. Looked in:\n${candidates.join("\n")}`);

const block = readFileSync(join(dir, "reference.md"), "utf8").match(/```ts\n\/\/ src\/lib\/beats\.ts\n([\s\S]*?)```/);
if (!block) throw new Error(`${dir}/reference.md has no src/lib/beats.ts block`);
mkdirSync(join(here, "src/lib"), { recursive: true });
writeFileSync(join(here, "src/lib/beats.ts"), `// Copied from the ${skill} skill's reference.md by scripts/sync-beats.mjs. Do not edit.\n${block[1]}`);
console.log(`beats.ts from ${dir}`);
