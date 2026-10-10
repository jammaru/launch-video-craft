// Runs the commands the film shows and saves what they print, one JSON per screen.
// Replace the demo below with the product's own commands. Never edit the JSON by hand.
import { existsSync } from "node:fs";
import { join } from "node:path";

import { expect, run, save, scratchProject, squeeze } from "./lib.mjs";

const { dir, env } = scratchProject("my-product");

// The demo: one real command. A product's install, for example:
//   const install = run("npx", ["-y", "skills", "add", "<owner>/<repo>"], dir, env);
//   expect(install.status === 0 && existsSync(join(dir, ".agents/skills/<skill>/SKILL.md")), "install did not land", install.lines);
const command = ["node", "--version"];
const result = run(command[0], command.slice(1), dir, env);
expect(result.status === 0, "the demo command failed", result.lines);
expect(existsSync(dir), "scratch project missing");

save("demo.json", {
  cwd: "my-product",
  command: command.join(" "),
  lines: squeeze(result.lines).filter((line, index, all) => line || index < all.length - 1),
});
console.log(`captured demo.json from ${join(".scratch", "my-product")}`);
