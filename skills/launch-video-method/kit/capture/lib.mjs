// Helpers for products with no UI: the command's real output is the screen.
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const filmDir = join(dirname(fileURLToPath(import.meta.url)), "..");
export const capturedDir = join(filmDir, "src/captured");

/** Terminal bytes to the lines a person saw: a spinner keeps its last frame, colors go. */
export function screenLines(bytes) {
  return bytes
    .split("\n")
    .map((line) => line.split("\x1b[1G\x1b[J").pop())
    .map((line) => line.split("\r").pop())
    .map((line) => line.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "").replace(/\x1b\][^\x07]*\x07/g, "").trimEnd());
}

/** Drops runs of blank lines down to one. */
export function squeeze(lines) {
  return lines.filter((line, index) => !(line === "" && lines[index - 1] === ""));
}

export function run(command, args, cwd, env = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1", CI: "", ...env },
  });
  return { status: result.status, lines: screenLines(`${result.stdout ?? ""}${result.stderr ?? ""}`) };
}

/**
 * An empty project under video/<name>/.scratch/<project>, with an environment whose HOME is
 * the scratch folder, so paths print as ~/<project> instead of the real home directory.
 * npm keeps its real cache. With `gh: true`, git authenticates through the GitHub CLI,
 * because moving HOME hides the keychain and ~/.gitconfig (needed for private repositories).
 */
export function scratchProject(project, { git = true, gh = false } = {}) {
  const home = join(filmDir, ".scratch");
  const dir = join(home, project);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  if (git) spawnSync("git", ["init", "-q"], { cwd: dir });
  const env = {
    HOME: home,
    npm_config_cache: spawnSync("npm", ["config", "get", "cache"], { encoding: "utf8" }).stdout.trim(),
  };
  if (gh) {
    Object.assign(env, {
      GH_TOKEN: spawnSync("gh", ["auth", "token"], { encoding: "utf8" }).stdout.trim(),
      GIT_CONFIG_COUNT: "1",
      GIT_CONFIG_KEY_0: "credential.helper",
      GIT_CONFIG_VALUE_0: "!gh auth git-credential",
    });
  }
  return { dir, env };
}

/** Fails the capture when the film's claim is not what happened. */
export function expect(condition, message, lines = []) {
  if (!condition) throw new Error(`${message}\n${lines.join("\n")}`);
}

export function save(name, data) {
  mkdirSync(capturedDir, { recursive: true });
  writeFileSync(join(capturedDir, name), `${JSON.stringify(data, null, 2)}\n`);
}
