# Changelog

## 1.0.0 - 2026-10-11

- Public release on GitHub. Skill and Claude Code plugin metadata set to 1.0.0; behaviour matches 0.9.0.

## 0.9.0 - 2026-10-11

- **Rename to Launch Video Craft.** GitHub repo, Claude Code plugin, and Agent Skill are all `launch-video-craft` (was `launch-video-skills` / `launch-video-method`). Install with `npx skills add jammaru/launch-video-craft`. README includes a migration note from the old names.
- The skills-launch demo film (`video/skills-launch.mp4`) uses the new product name, tagline, install command, and skill id.

## 0.8.0 - 2026-10-11

Two films of a product with a web playground passed every check while showing a UI the agent wrote itself after reading the product's renderer: tabs and panels the product does not have.

- The kit renders the product's real page: `shootProduct` (capture/lib.mjs) copies the product's own build to `public/product/` and screenshots it with Remotion's headless browser at the window's size; `useProduct` and `<ProductFrame>` load that build in the window, find anchors in the product's own markup, and measure before `continueRender`.
- Every `Window` names its source in the beat sheet (`window.real`: the screenshot, or the captured JSON). `npm run verify` compares the landed window with the screenshot (`scripts/similar.py`, edge match 0.5 or more; the real page scored 0.88–0.98, the two lookalikes 0.16–0.19) and fails a scene that draws a web UI without `ProductFrame`.
- SKILL.md: "Do not write the product's UI yourself"; the iframe rule is replaced by `ProductFrame`'s measured, URL- or `prepare`-driven states.

## 0.7.4 - 2026-10-11

- Verify renders every result and hold-end frame again without the debug overlay and fails when type is cut by an edge of the frame (`scripts/edges.py`). Measured on a film: every frame with a sliced line scored 0.9–46% of an edge; clean frames 0.
- The kit's window title fades out while the camera is zoomed; centred or left, some zoom cut it.

## 0.7.3 - 2026-10-11

- `assertFraming` fails a hold under scale 1.4, so a result cannot be "read" in a wide shot by naming the whole page as `resultTarget`, and fails a cursor still in view while the result is read. Both were in a film that passed 0.7.2.

## 0.7.2 - 2026-10-11

- `Headline` lets its type leave before its field clears, so fading type never sits on the photograph; verify checks a still mid-exit for a plain field.
- `inspect` finds flat frames by their spread of values instead of ffmpeg's blackdetect, which flagged an ink field with type on it as black and pushed a film to change its ink colour to pass.
- New rejects: a logo layer trimmed through a letter, and changing a colour or timing only to get under a check's threshold.

## 0.7.1 - 2026-10-11

Found by inspecting a film made with 0.7.0 by another model, which passed every check:

- `Headline` picks its field from its tone (ink behind light type), so white principles no longer vanish on a paper field. The kit had introduced that.
- Blank frames fail: `contrast.py` rejects a still where almost nothing differs from the field, and `inspect` rejects any flat-colour stretch over 0.5s, not only black.
- `LogoLayers` draws logo layers cut on one canvas in one box with `objectFit: contain`; a layer given its own width and height was squashed. A cut through a letter is the wrong cut. A lockup is not followed by the name in type.
- New rejects: a zoom that slices a line of text at the frame edge, a surface that fills only the top half of the window.

## 0.7.0 - 2026-10-10

- The reference is a guide to the film's shape, not a template. Research writes what the reference is, its scenes as roles, and how this product fills each role (or drops it), and adds the roles this product needs. The product's nature decides the film.
- Length comes from the product: the sum of the shots it needs (a product shot about 7–11 seconds), not the reference's length within ±30%.
- Backdrop prompts name only a place and its light. No product name, "launch", "video", "app", or "AI", which image models paint into the picture. `npm run verify` reads the backdrop with tesseract (when installed) and fails on writing.
- The finished film is inspected every time: `npm run render` runs `npm run inspect`, which takes five stills per shot from the mp4 into `review/film-sheet.png` and fails on black stretches, a frozen picture over 4 seconds, a length mismatch, and missing or silent audio. `npm run finish` passes only when the last inspect is newer than the mp4 and NOTES.md "Film checked" has a written line for the backdrop and each shot.

## 0.6.0 - 2026-10-10

- Verification runs on every change, and the delivery render waits for it. `npm run verify` renders the headline, the landed window, and the press, result, and hold end of every action with each anchor outlined and the cursor tip marked, writes a sheet per shot, and fails on guessed coordinates, broken beat sheets, misses in space, and unreadable type. `npm run render` refuses until the last verify is clean, newer than every source file, and NOTES.md has a written "Stills checked" line per shot.
- `assertFraming` checks the beat sheet in space: the cursor tip is on the target at the press, the target is in view at scale 1.4+, a zoomed view shows the product and not the backdrop, the result is whole, readable, still, and uncovered. Errors print coordinates.
- Placement from measurement only: `fit`, `fitLeft`, `union`, and `pointIn` in `kit/src/lib/framing.ts`. `fit` keeps a zoomed view inside the window. Fallback positions are rejected.
- Each shot names its one proving element and its `data-anchor` before the scene is written; beats carry `target` and `resultTarget`, and `key: true` for a key press.
- Type and marks keep 3:1 contrast; headlines draw their own paper field; `contrast.py` fails type over the photograph and dark logos on ink.
- The window rises from 1000px below and is hidden until it moves, so it no longer peeks under the headline. Typed text keeps its full width for measurement.
- Iframes: render in the film's DOM instead; if unavoidable, measure before `continueRender`, put state in the URL, hide the product's demo chrome.
- `example-failures.md`: a delivered film analysed frame by frame (contrast per eighth of a headline, a click 150px off its card, a 9-second static shot, a scroll under a parked camera, a skipped review), each with its cause and the check that now catches it.

## 0.5.0 - 2026-10-10

- `kit/`: a starter film project to copy into `video/<name>/`. Stage, camera, cursor, headline, anchor measurement, terminal, agent chat with tool cards, player, capture helpers, sync script for `assertBeats`, synthesized sound, and a NOTES.md template. Two demo shots render with real captured output and pass the beat checks. SKILL.md lists the order of operations and the check after each step.
- Products with no UI: the command's real output is the screen. Capture in a scratch project with HOME moved (no personal paths), authenticate private repositories through `gh`, keep each spinner's last frame, assert the claim, and film rejections by running the real command on a failing input loaded with `lazyComponent`.
- Agent shots: the person types the install command and one prompt; after Send every step is the agent's, shown as tool cards with captured output, with no cursor.
- `assertBeats`: `cursor` is optional for read-only beats, and `proves: true` marks the action the headline names, so the 90-frame check follows it.
- `example-cli.md`: how this skill's own launch film was made, including the cut the user rejected and the framing fixes for terminal text.
- New review rejects: hand-typed terminal text, the person typing the agent's commands, personal paths in output, overlapping spinner states, framing a full-width row, an empty card before its first line, two cursors over a played film.

## 0.4.0 - 2026-10-10

- Each product shot has a beat sheet (`beats.ts`) that the scene, camera, cursor, and sound import. `assertBeats` fails the render when a headline is cut short, the window rises under it, a press happens before the window settles or at scale 1, presses come less than 30 frames apart, or the headline's action is far from the headline.
- Each headline names the first action the viewer sees, within 90 frames of its exit.
- The user's named order, payoff, length, and language outrank the default shape. The opening follows the reference.
- Length and shot count follow the reference, not the example film.
- The product's own gesture is shown: drag is dragged.
- Review adds a 4 fps sync strip per shot, and a noted problem is fixed before the delivery render.
- Film work stays out of git: `.git/info/exclude`, no `.gitignore` edit, no commit, push, or pull request unless asked. This repository ignores `video/` and `.product/`.

## 0.3.0 - 2026-10-10

- A full-size still of the landed window has to pass before the film is rendered.
- A product surface that is a screenshot is a failed proof. Fix the component import.
- The cursor is a child of the camera, and its coordinates come from measurement.

## 0.2.2 - 2026-10-10

- Default language is English. Another language is rendered only when the user names it.
- The product window, the zoom, and the cursor are minimums: 1620×930, scale 1.9 on a line to be read, a 44×50 cursor.
- The generated photograph sits behind the product windows only. Hook, logo, principles, and end card are a plain field.
- Review is a reject list. A film that fails it is repaired and re-sheeted before delivery.

## 0.2.1 - 2026-10-10

- The worked example now includes the capture harness: vitest rooted at the product repo, the host calls in order, the snapshot helper, and the tools each step used.
- Logo masks and crops from the sync script are recorded with the film they came from.

## 0.2.0 - 2026-10-10

- One skill is distributed: `launch-video-craft`.
- The finished-film record that was `remotion-launch-video` now lives in `skills/launch-video-craft/example.md`.
- The example states which of its facts must not be copied onto another product.

## 0.1.0 - 2026-10-09

- First public package of the launch-video skills.
- `launch-video-craft` is the general method.
- `remotion-launch-video` is the worked example from one finished film, with machine-specific paths removed.
