---
name: remotion-launch-video
description: >-
  Worked example of one finished launch film (EmDash Preflight): the
  capture script, the real UI renderer, scene timings, logo layers, and
  review commands. Use when a new launch film needs a concrete instance
  of the method, or when extending that film. For the general method,
  use launch-video-method.
license: MIT
compatibility: ffmpeg, python3, and Node. The Remotion project stays outside the product lockfile.
metadata:
  version: "0.1.0"
---

# Remotion launch videos

Make a short launch film (about 45–60 seconds, 1920×1080, 30fps) that shows the real product, timed like a reference clip. The worked example is the EmDash Preflight film, which lived in its product repository at `video/launch/`. Patterns, formulas, and the mistakes from that film are in [reference.md](reference.md). Read it before writing code.

The general method for the next film, not tied to this product, is the separate `launch-video-method` skill.

## Rules that are easy to get wrong

- The reference teaches pacing, camera, and cursor. It does not donate its graphics. After watching it, write down its signature motifs and do not draw them. Colored circles with corner squares, dashed tilted frames, and two-tone capsules were rejected from the Preflight film because they were another product's shape kit.
- Every number, label, and sentence inside the product UI comes from running the real product. Do not invent the JSON the UI displays.
- Draw that UI with the product's real renderer and its shipped CSS. Rebuild only the shell you cannot render (window chrome, navigation, dialogs that portal).
- The video is its own npm package, gitignored. Do not add Remotion, React, or fonts to the product's dependencies or lockfile.
- Typecheck before every render. A draft at half scale is for review; delivery is full resolution, both locales when the product is localized.

## Workflow

Copy this list and keep it updated:

```
- [ ] 1. Watch the reference and name what to borrow vs. what is off limits
- [ ] 2. Read the product UI and find a real way to execute the story
- [ ] 3. Capture real responses into JSON
- [ ] 4. Prove the real renderer paints those responses
- [ ] 5. Build scenes, then review contact sheets and hero frames
- [ ] 6. Add audio on the same beat grid and render delivery files
```

### 1. Reference

Download the clip. `ffprobe` it, then make contact sheets at about 2fps (`ffmpeg -vf "fps=1/2,scale=480:-1,tile=4x4"`). Write two lists:

- Borrow: shot length, window-on-wallpaper, zoom-on-click, cursor size, headline scale, ending cadence.
- Off limits: that brand's icons, illustrations, color shapes, and layout gags.

If a later review says a shot "looks like the reference," remove those assets and keep the timing. Do not refill the space by repeating the product logo. A shot can be type alone. Show the logo when it is introduced, and once more on the end card.

### 2. Story from the real product

How to arrive at the sentences is the `launch-video-method` skill: one argument, one sentence per shot, actors the product really serves, failure then recovery, the mode switch as its own shot, constraints as type, the logo only twice. This film's sentences are the shot list in [reference.md](reference.md).

Run that story through the product's real test host or dev server before designing frames. Record the failure you hit (wrong id, wrong locale, wrong field name) in the capture script's comments. Those failures are part of the method.

### 3. Capture

A small test, separate from the product suite, boots the real runtime and writes one JSON file per screen per locale via the test runner's file snapshot (`-u`). Assert the happy ending (`success: true`, the passing banner) so a later rerun cannot silently keep a stale failure.

Set the test runner's root to the product repo. Plugin builders resolve the manifest from that root, not from the test file's directory.

UI locale and content locale are different. Set both, or the admin will be translated while the rejection message stays in the default language. Give every created record (entry, byline, term) the locale you are capturing.

### 4. Prove the renderer

Before any scene, render one still of the captured JSON through the product's component and its compiled CSS. If it is unstyled, you imported the wrong stylesheet (source entry instead of the shipped build) or missed the theme attributes (`data-theme`, `data-mode`). Fix that still before building scenes.

### 5. Scenes

One component per shot. Register the full film per locale plus one composition per shot so a fix re-renders five seconds, not fifty.

Timing sits on a 120 BPM grid: 15 frames per beat, shot lengths are multiples of 15 frames. Headlines occupy the first beats; the window lands after the line has been read; clicks land on a beat.

Camera and cursor coordinates are in the same 1920×1080 space, and the cursor is a child of the camera. Keyframes name a frame number and an x/y (camera also has scale). Ease inside each segment; do not spring the camera.

Measure click targets from the DOM. Do not guess pixels. The measurement waits for `document.fonts.ready`, uses `delayRender`, and divides out any CSS transform on an ancestor. Details and the failure modes are in [reference.md](reference.md).

### 6. Audio and delivery

Synthesize a bed whose length equals total frames / fps, plus one-shot effects. Cue effects in scene-local frames, then add the scene's start frame. Render:

```bash
npx tsc --noEmit
npx remotion render src/index.ts <Composition> ../<name>.mp4
```

Draft with `--scale=0.5`. Review that file as contact sheets and as full-frame grabs of the click, the zoom, and the text. Then render full size. Check `ffprobe` (h264, 1920×1080, 30fps, aac) and that the bed is audible (mean volume roughly −20 dB, peak under 0 dB).

## Project layout

```
video/<name>/            # gitignored, own package.json, npm install
  capture/               # runs the product, writes JSON
  scripts/sync-assets.mjs
  scripts/make-audio.py
  public/                # logo layers, backdrop, audio
  src/vendor/            # copied compiled CSS, gitignored with the package
  src/captured/          # JSON from the capture
  src/scenes/  src/components/  src/lib/
video/<name>.mp4         # gitignored delivery file
```

Ignore `video/<name>/` and `video/*.mp4`. Copy the shipped CSS and split the logo in `sync`; do not commit `node_modules`.

## Review before you call it done

- [ ] Hero frames show the real component, not a lookalike of the reference
- [ ] Cursor tip sits on the control it clicks, including while zoomed
- [ ] Zoomed text is fully inside the frame, in both locales
- [ ] No shot is empty for more than about half a second
- [ ] The last shot fades out; audio fades with it
- [ ] Both locales rendered if the product has both
