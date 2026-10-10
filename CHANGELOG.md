# Changelog

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

- One skill is distributed: `launch-video-method`.
- The finished-film record that was `remotion-launch-video` now lives in `skills/launch-video-method/example.md`.
- The example states which of its facts must not be copied onto another product.

## 0.1.0 - 2026-10-09

- First public package of the launch-video skills.
- `launch-video-method` is the general method.
- `remotion-launch-video` is the worked example from one finished film, with machine-specific paths removed.
