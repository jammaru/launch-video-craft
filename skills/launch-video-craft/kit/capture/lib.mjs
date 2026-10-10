// Capture helpers. For a product with no UI the command's real output is the screen;
// for a product with a web page, the page itself (shootProduct).
import { spawn, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, resolve } from "node:path";
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

/** The window body's size in the film (Stage WIN minus the title bar and its border). */
export const BODY = { width: 1620, height: 889 };

const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".txt": "text/plain" };

function chrome() {
  const root = join(filmDir, "node_modules/.remotion");
  const find = (dir) => {
    if (!existsSync(dir)) return undefined;
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        const found = find(path);
        if (found) return found;
      } else if (/^chrome-headless-shell(\.exe)?$/.test(name)) return path;
    }
    return undefined;
  };
  let path = find(root);
  if (!path) {
    spawnSync("npx", ["remotion", "browser", "ensure"], { cwd: filmDir, stdio: "inherit" });
    path = find(root);
  }
  if (!path) throw new Error("no headless browser: run `npx remotion browser ensure` in the film folder");
  return path;
}

/**
 * The product's real page, for shots that show a web UI (a playground, a dashboard).
 * `dist` is the product's own build output (run the product's build first). It is copied to
 * public/product/, which ProductFrame loads, and served as-is to a headless browser that
 * screenshots each shot's state at the window body's size into capture/real/<Shot>.png.
 * `npm run verify` compares those screenshots with the film's landed frames.
 * shots: { Playground: { path: "index.html", hash: "..." } }
 */
export async function shootProduct({ dist, shots }) {
  const root = resolve(filmDir, dist);
  if (!existsSync(join(root, "index.html")) && !Object.values(shots).every((s) => existsSync(join(root, s.path ?? "index.html")))) {
    throw new Error(`${dist} has no built page; run the product's own build first`);
  }
  const publicDir = join(filmDir, "public/product");
  rmSync(publicDir, { recursive: true, force: true });
  cpSync(root, publicDir, { recursive: true });
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = join(root, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
    if (!file.startsWith(root) || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const port = server.address().port;
  const outDir = join(filmDir, "capture/real");
  mkdirSync(outDir, { recursive: true });
  const browser = chrome();
  const record = { dist, shots: {} };
  try {
    for (const [shot, { path = "index.html", hash = "" }] of Object.entries(shots)) {
      const url = `http://127.0.0.1:${port}/${path}${hash ? `#${hash.replace(/^#/, "")}` : ""}`;
      const out = join(outDir, `${shot}.png`);
      rmSync(out, { force: true });
      // Async: the server above answers the browser's requests on this event loop.
      const stderr = await new Promise((done) => {
        const child = spawn(browser, ["--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", `--window-size=${BODY.width},${BODY.height}`, "--virtual-time-budget=4000", `--screenshot=${out}`, url]);
        let text = "";
        child.stderr.on("data", (chunk) => (text += chunk));
        child.on("close", () => done(text));
      });
      expect(existsSync(out), `no screenshot of ${url}`, [stderr]);
      record.shots[shot] = { path, hash, screenshot: `capture/real/${shot}.png` };
      console.log(`real ${shot}: ${path}${hash ? "#…" : ""} -> capture/real/${shot}.png`);
    }
  } finally {
    server.close();
  }
  writeFileSync(join(outDir, "real.json"), `${JSON.stringify(record, null, 2)}\n`);
  return record;
}
