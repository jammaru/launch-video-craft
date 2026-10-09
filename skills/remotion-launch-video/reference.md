# Reference: the Preflight launch film

Worked example: the EmDash Preflight launch film. In that product repository the project lived at `video/launch/`, and the deliveries were `video/preflight-launch.mp4` and `video/preflight-launch-ja.mp4`. All three were gitignored. Tools used: ffmpeg, python3 with numpy, and Node. The product kept its own package manager. The video package was installed with npm, so Remotion never entered the product lockfile. Paths below are inside that video package, not a personal machine.

The general method, not tied to this product, is the `launch-video-method` skill.

## Shot list (30fps, 120 BPM, 15 frames per beat)

| Shot | Frames | What it shows |
| --- | --- | --- |
| Hook | 120 | Four publishers, then "Who checks first?" |
| LogoReveal | 105 | Supplied logo assembles, then the tagline |
| PublishBlocked | 330 | Real editor panel; Publish is rejected |
| AgentCheck | 330 | Real `preflight__check_entry` JSON, block then allow |
| Dashboard | 300 | Real dashboard; confirm dialog; mode becomes enforce |
| Principles | 150 | Four lines of type, no decoration |
| EndCard | 150 | Logo, registry line, package name, fade to black |

Total 1485 frames, 49.5s. The audio bed is generated to that length. If you change a duration, regenerate the bed.

Why this order. The argument is one sentence: the same deterministic rules check a publish no matter who starts it, and they can stop it. Hook names the actors and asks the question before the brand appears. LogoReveal is the only assembly. PublishBlocked is the proof, failure included. AgentCheck is the second actor hitting the same rule, with captured tool JSON inside a chat the product does not ship. Dashboard is the control moving from observe to enforce. Principles are the four constraints, after the proof, type only. EndCard says where to get it.

Beat map from the reference (a ChatGPT × Figma promo) to this product:

| Reference beat | This film |
| --- | --- |
| Chat app window over a hillside | EmDash editor window over a generated meadow |
| Typing a prompt to ChatGPT, tool result | Typing to an agent, `preflight__check_entry` JSON |
| Figma frames being edited | Preflight panel and dashboard through `BlockRenderer` |
| Black field of colored geometry | Removed; principles as type on black |
| Figma × OpenAI logo lockup | Preflight logo, registry line, package name |

The reference clip was a Figma promo: windows on a hillside, a large cursor, zooms, then a black field of rainbow geometry. The hillside, windows, cursor, and zooms were borrowed. The rainbow geometry was removed after review. Repeating the product logo around that frame was also removed: the same mark stamped in the corners reads as decoration. That shot is type only. The logo appears when it is introduced, and once more on the end card.

The supplied logo was one flattened PNG, a mark above two words. The parts that already had their own shape were the frame, the dash, and the circular badge. The two words stay on one baseline (`PREFLIGHT_OFFSET`). Nothing else was cut out of the file.

## Capture

`capture/vitest.config.ts` sets `root` to the repo and `emdashPluginTest({ dir: repoRoot })`. The test file matches `video/launch/capture/**/*.capture.ts` so the product suite does not run it.

`capture/preflight.capture.ts` boots `createPluginRuntimeTestHost` per locale and writes snapshots with `expect(JSON.stringify(value, null, 2)).toMatchFileSnapshot(...)`. Run `npm run capture` (`vitest run -u`).

The story it executes, all through the host, not mocks:

1. Load the empty dashboard.
2. Submit the real rule form.
3. Install a policy and an entry that fails it (sponsored, no sponsor name, image with no alt, no byline, no term).
4. Open the editor panel in observe, then enable enforce, then open the panel again.
5. Call `check-entry` and `publish`. Publish must return `success: false` with the plugin's message.
6. Fix the entry through the real update API and publish again. This step asserts `success: true`.

Failures that happened, and the fix:

- `primaryBylineId` did not satisfy `byline.required`. Credits go in `bylines: [{ bylineId }]`, and `bylineId` is `translationGroup ?? id`.
- Taxonomy update rejected the term id. It wants the slug, and the term's locale must be the entry's locale. The UI locale does not change the entry locale.
- With only `site.locale` set, the panel was Japanese and the publish rejection stayed English. Pass `i18n: { defaultLocale, locales }` and set `locale` on the entry, the byline, and the term.
- A 1×1 PNG is enough for a media fixture. Alt text is a field on the fixture, not a later patch.

## Rendering the real UI

`@emdash-cms/blocks` `BlockRenderer` plus the admin package's compiled `dist/styles.css` (copied by `scripts/sync-assets.mjs` into `src/vendor/`). Wrap in an element with `data-theme="kumo"` and `data-mode="light"`, and set `--font-emdash` to the font you loaded.

First composition built was a throwaway still of the panel and the dashboard. It confirmed badges, table, form, and banner before any scene existed.

Icons in the shell are `@phosphor-icons/react`, the set the EmDash admin uses. The generated `backdrop.jpg` is also the post's featured image inside the editor, so the film has one world. Japanese sidebar labels come from the admin package's own translation catalog.

What is real versus rebuilt:

- Real: panel blocks, dashboard blocks, button and input components, confirm copy, toast message, check JSON, publish error.
- Rebuilt, from screenshots and the design-system source: sidebar, top bar, editor fields, the macOS window, the toast chrome.
- Rebuilt as static markup: the confirm dialog. `BlockRenderer` opens it in a portal after a click, and Kumo positions that popup `fixed` against the browser viewport, so a zoomed Remotion frame cannot show it. Read the `confirm` object off the captured button and render it with Kumo `Button` and `LayerCard`. `dialogVariants` is not a public export; the popup classes copied from the package source, minus the fixed centering, are:

```
shadow-m ring ring-kumo-line overflow-hidden rounded-xl bg-kumo-base text-kumo-default sm:min-w-96
```

The backdrop is a `bg-kumo-recessed` layer at opacity 0.8.

## Measuring click targets

`src/lib/anchors.ts`. Call `useAnchors(ref, finders)` and pass a `key` when the layout you measure changes.

- `delayRender` until `document.fonts.ready` and one animation frame. `continueRender` in the cleanup too, or a remount stalls the render.
- `getBoundingClientRect` includes ancestor CSS transforms. Divide by `rect.width / offsetWidth` of the measured root so a camera scale does not corrupt the numbers.
- `byText` returns the shortest matching element. A container that contains the label must not win.
- Elements that animate with `opacity` or `transform` still occupy their final box. Elements mounted only after a frame do not. Mount both states and hide one with `visibility`, then measure the one that stays put.
- Scroll is applied after measurement. Measure inside the scrolling element (its rects ignore its own translate... they do not: a transform on the scroller moves the children). Measure a copy that is not translated, or add the scroll offset back. The dashboard measures the page at `translateY(0)` by using the untranslated layout root and subtracting scroll when converting to stage coordinates.

Stage conversion, with the window at `(WIN.x, WIN.y)` and a title bar of `WINDOW_BAR`:

```
x = WIN.x + rect.cx + dx
y = WIN.y + WINDOW_BAR + rect.cy - scroll + dy
```

Camera keyframes use those points. While zoomed, bias the point toward the text you need in frame: a full-width banner's center is the middle of the page, not the start of its sentence. Offset by `-width / 2 + a margin`.

Cursor keyframes use the same points. The click frame is the keyframe where the cursor arrives, and the pressed scale lasts about 6 frames.

## Headlines and type

`Headline` reveals word by word. Latin splits on spaces. Japanese has no spaces, so it splits into chunks of about four characters. Set `whiteSpace: nowrap` per line and shrink the font so the widest line stays inside 1720px. Estimate width as 1em for a CJK character and 0.55em otherwise. Without this, the Japanese hook wrapped to a second line and the agent title ran off the frame.

Latin fonts come from `@remotion/google-fonts` with an explicit `subsets: ["latin"]` and the weights you use. Do not load `Noto Sans JP`: one weight is over a hundred files and the render spends its time fetching them. On macOS the Japanese fallback in this film was `"Hiragino Sans", "Hiragino Kaku Gothic ProN"`. Name that dependency in the project README or script header. Another machine will substitute a different face.

## Logo layers

`scripts/sync-assets.mjs`. The supplied file was 1448×1086 with two ink bands (the mark, then the words), found by counting dark pixels per row rather than by `cropdetect` (that returned nothing useful on this file).

Split with ffmpeg `geq`: black RGB, alpha from inverted luminance, times a mask, then crop. Masks used: the badge is a circle (`hypot` around its center), the dash is a rectangle, the frame is everything else in the mark crop. Word crops must share one vertical origin and one scale, or "EmDash" and "Preflight" will not sit on the same baseline. The horizontal offset between those crops is a constant next to the components (`PREFLIGHT_OFFSET`), not a guess at render time.

Animate the layers separately: frame scales in, dash wipes with `clip-path`, badge pops and rotates around its own center (`transform-origin` at the badge's center inside the crop).

How the parts were found: a grid laid over the mark crop showed the frame has a gap at its lower right where the badge sits, so a circle mask lifts the badge cleanly and leaves the frame whole. The layers were then composited on orange to check for fringes; on white they looked fine either way.

## Agent chat

`AgentCheck.tsx`. `REVEAL` is one frame array for every chat item. The same array drives the pop cues in `Video.tsx`. Each item is wrapped in `data-item={i}`, measured, and the log scrolls to `bottom_i - viewport + 24` over 18 frames once item `i` appears. The camera reads the same scroll when it frames the `block` pill, the fixes, the `allow` pill, and the published row. The fix list names the four fields the capture's update call changed.

## After the film

The mark crop, squared and padded on white at 256×256, became `icon.png` for the registry; the lockup became `docs/logo.png` at the top of the README. The icon is a release artifact, so it shipped as version 0.1.1 rather than an overwrite of 0.1.0.

The launch post that worked was plain: "EmDashの公開前チェック、Preflightを作りました！！", who it checks, that it can stop or just record, no AI or external service, the plugin page link, with the locale's mp4 attached. A first draft that reused the film's hook lines was rejected as not sounding like an announcement.

## Audio

`scripts/make-audio.py` writes 44.1kHz stereo WAVs into `public/audio/`: `bed.wav` for the whole film, plus `click`, `tick`, `pop`, `whoosh`, `thud`, `chime`. Scene components do not know about audio. `Video.tsx` holds cues as `[sceneLocalFrame, sound, volume]` and adds each scene's start frame. `Html5Audio` plays them. Remotion resamples to 48kHz AAC.

Regenerate the bed whenever the total frame count changes. The script's `PRODUCT_START`, `PRINCIPLES_START`, and `END_START` are the same sums as `scenes` in `Video.tsx`; they duck and thin the drums so the opening and the end card stay quieter.

## Review commands

```bash
# half scale, whole film
npx remotion render src/index.ts PreflightLaunch /tmp/draft.mp4 --scale=0.5 --log=error
ffmpeg -i /tmp/draft.mp4 -vf "fps=1,scale=480:-1,tile=4x4" sheet_%02d.png

# one shot, full size
npx remotion render src/index.ts Scene-Principles /tmp/principles.mp4

# delivery
npx remotion render src/index.ts PreflightLaunch ../preflight-launch.mp4
ffprobe -show_entries stream=codec_name,width,height,r_frame_rate:format=duration
ffmpeg -i ../preflight-launch.mp4 -af volumedetect -vn -f null -
```

Look at the sheets for empty frames and late text. Then open full-frame grabs of every click and every zoom. The half-scale sheet hides a cursor that misses by 20 pixels and a banner whose sentence starts off screen.

## Scene composition ids

`Root.tsx` registers `PreflightLaunch` (`locale: "en"`), `PreflightLaunchJa`, and `Scene-<id>` for each shot with `defaultProps.scene`. `calculateMetadata` is unnecessary while durations are constants.
