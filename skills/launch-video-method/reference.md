# Techniques

Reusable pieces for the phases in [SKILL.md](SKILL.md). None are tied to one product. When a product's test host or renderer has its own API, follow that API; the point here is what each step is for. Numbers are starting values that worked at 1920×1080, 30fps.

## Project

```
video/<name>/                 # gitignored, own package.json, npm install
  capture/                    # runs the product, writes JSON
  scripts/sync-assets.mjs     # copy shipped CSS, split the logo
  scripts/make-audio.py       # placeholder bed and effects
  public/                     # logo layers, backdrop, audio
  src/vendor/                 # the copied stylesheet
  src/captured/               # one file per screen per locale
  src/copy.ts                 # all film copy, keyed by locale
  src/theme.ts                # fonts, palette, fps, size
  src/lib/motion.ts           # tween, track, pop, appear
  src/lib/anchors.ts          # DOM measurement
  src/components/             # Stage (backdrop, camera, window, cursor, headline), shell, logo
  src/scenes/                 # one file per shot, exports its duration
  src/Video.tsx  src/Root.tsx
video/<name>.mp4              # gitignored delivery
video/<name>-<locale>.mp4
```

Ignore `video/<name>/` and `video/*.mp4`. Do not add Remotion to the product.

```bash
npx tsc --noEmit
npx remotion still src/index.ts <Composition> /tmp/still.png --frame=<n>
npx remotion render src/index.ts <Composition> /tmp/draft.mp4 --scale=0.5 --log=error
npx remotion render src/index.ts <Composition> ../<name>.mp4 --log=error
```

`Video.tsx` holds `scenes = [{ id, duration, Component }]` and sums the total. `Root.tsx` registers the film per locale through `defaultProps` and `Scene-<id>` per shot. Every scene receives `{ copy, data }`: film copy and captured data for the locale.

## Reading a reference

```bash
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate ref.mp4
ffmpeg -i ref.mp4 -vf "fps=1/2,scale=480:-1,tile=4x4" sheet_%02d.png
ffmpeg -ss 30 -i ref.mp4 -vf "fps=1,scale=640:-1,tile=3x4" -frames:v 1 end.png
ffmpeg -ss 12 -t 3 -i ref.mp4 -vf "fps=6,scale=480:-1,tile=6x3" -frames:v 1 move.png
```

If the clip URL is behind a proxy page, download the media URL it wraps, not the page.

Write three lists in the project's notes before coding:

| Borrow | Do not draw | Beat map |
| --- | --- | --- |
| Window rises over a landscape | Their colored geometry | Their app window → this product's main screen |
| Big black cursor, zoom on click | Their icons and illustrations | Their AI chat → this product's agent or API |
| Headline alone, then UI | Their color capsules and frames | Their logo lockup → this end card |

The beat map is how the reference shapes the story without donating content. A beat with no honest equivalent is dropped.

## Building the shot list

On paper, after research, before a composition exists.

1. The argument in one sentence. If you cannot name the action a viewer will see succeed, return to the screens and the test host.
2. The actors the product really serves. Each kept actor needs a shot where it hits the same rule. An actor you cannot execute is cut.
3. The hook from those actors: one short line per actor, same verb, then one question. Four lines and a question fill about four seconds.
4. The failure and the reason in the proof shot. A film with only the happy path has not shown the product.
5. The mode switch in its own shot when the product has one.
6. Constraints as one line each. Four is enough. Type on a plain field. No shapes, no logo.
7. Count the reference's shots. More sentences than breaths means delete sentences.
8. Mark the logo: the name shot, and the end card. Nothing else.

## Capturing real output

Prefer the product's own test host or a scripted session. One file per screen per locale, written by the test runner's file snapshot so `-u` regenerates them. Assert the outcomes the film claims. Point the runner's root at the product repo when the builder resolves the manifest from the working directory.

Typical sequence for a product that blocks something: empty state, configure the rule through the real form, create the failing record, load each surface in the permissive mode, switch mode through the real action, load again, attempt the action (expect failure), fix the record through the real update API, check again, attempt again (expect success).

Give every created record the content locale. Set the UI locale separately.

If there is no test host, drive the running app and save the network response or the rendered DOM. The bytes still come from the product.

## Proving the renderer

Find the compiled CSS the app serves (`dist/styles.css` or the built asset), not a Tailwind source entry. Copy it in the sync script and import it once. Wrap the surface in the theme attributes the CSS expects (`data-theme`, `data-mode`, a font variable). Render one still. Compare it with a screenshot of the real app. Then build scenes.

## Shell, portals, toasts

Rebuild the shell from screenshots with the design system's CSS variables, the product's icon set, and labels from the product's translation files. Use the design system's real components (button, input, card) inside it.

A portal positions against the browser viewport, so it cannot follow a camera. Read the dialog's title, body, and button labels from the capture. Render them in normal flow with the design system's button and surface, using the popup's classes from the package source minus `fixed` centering. A dimmer layer behind it at about 0.8 opacity. Same for toasts: the captured message, design-system colors, your own placement.

## Stage components

**Backdrop.** `objectFit: cover`, scale about 1.06 with a slow sine breath, and a translate of about 0.08px per frame. Movement you barely notice keeps a still from looking frozen.

**Window.** Absolute position on the 1920×1080 stage, radius about 18, a soft two-layer shadow, a 40px title bar with traffic lights. Enters from about 820px below with a spring, scale 0.9 → 1, origin at top center.

**Camera.** Frames point `(x, y)` at the center:

```
transform-origin: 0 0
transform: translate(960px, 540px) scale(s) translate(-x px, -y px)
```

Keyframes are `{ at, x, y, scale }`, interpolated per segment with an ease-in-out bezier. Scale 1 for the establishing view, 1.4–1.5 for a region, 1.7–2.2 to read a line. Hold each read for 25–45 frames.

**Cursor.** A child of the camera, in stage coordinates. Keyframes `{ at, x, y }`. On a click frame: scale dips about 18% over 10 frames, and a ring expands and fades over about 18 frames. Hide it until it is needed.

**Headline.** Reveal word by word, about 3 frames apart, each word rising from below its line over 16 frames. Exit upward with a fade about 14 frames, finished before the window lands. Shrink to fit about 1720px.

## Click targets

Measure in layout space after `document.fonts.ready` and one animation frame, inside `delayRender`. Call `continueRender` in cleanup too, or a remount stalls the render.

`getBoundingClientRect` includes ancestor transforms. Divide by `root.getBoundingClientRect().width / root.offsetWidth`.

Find the innermost element whose text matches; the shortest match wins. Or put `data-anchor` on the element you will click.

Mount every state you will measure and hide inactive ones with `visibility`. A translated scroller moves its children: measure the untranslated layout and subtract scroll yourself.

With the window at `(winX, winY)` and a title bar of height `bar`:

```
x = winX + rect.cx + dx
y = winY + bar + rect.cy - scroll + dy
```

A full-width banner's center is the middle of the page, not its sentence. Offset toward the text (`-width / 2` plus a margin).

## Chat and logs

A chat or log grows over time. Put each message in a wrapper with an index, give the reveals one frame array, and measure each wrapper's bottom. Scroll target for item `i` is `max(0, bottom_i - viewport + margin)`. Hold the scroll until the item appears, then ease to its target over about 18 frames. The camera reads the same scroll value when it frames an item.

Type the prompt into the composer character by character, with a blinking caret, and a tick sound every few frames. The send click lands on a beat; the message appears in the log a few frames later.

Render captured JSON as code lines that appear two frames apart. Color keys and strings, and pill the decisive value (`block`, `allow`) so the camera has one thing to read.

## Type

Latin splits on spaces. Japanese has none, so split into chunks of about four characters with trailing punctuation kept. Keep each line `white-space: nowrap` and shrink so the widest line fits about 1720px, estimating 1em per CJK character and 0.55em otherwise.

Load Latin from `@remotion/google-fonts` with `subsets: ["latin"]` and only the weights you use. For Japanese on macOS, fall back to `"Hiragino Sans", "Hiragino Kaku Gothic ProN"` and say so in the report.

## Backdrop prompt

Generate, never copy. A prompt that works:

> Wide 16:9 landscape photograph, rolling green hills with wildflowers in the lower third, large soft blue sky with a few light clouds, gentle daylight, shallow haze at the horizon, no people, no buildings, no text, no logos.

Change the place to suit the product, keep the structure: content low, empty sky high. Save as JPEG around 1920px wide.

## Logo layers

Decide the parts first. Then measure. Then cut.

Dump grayscale pixels and count dark pixels per row and column (`ffmpeg -i logo.png -f rawvideo -pix_fmt gray logo.gray`, then numpy). Rows that go quiet separate mark and words; columns that go quiet separate words. `cropdetect` often returns nothing on white.

Overlay a grid on the mark crop to read the geometry: where a badge's circle sits, where a bar starts and ends, where the frame has a gap. Measure the badge center and radius from that.

Split with ffmpeg `geq`: black RGB, alpha from inverted luminance, times a mask, then crop.

```
format=rgba,geq=r='0':g='0':b='0':a='clip((250-g(X,Y))*1.07,0,255)*MASK',crop=W:H:X:Y
```

- Circle: `lte(hypot(X-cx,Y-cy),r)`
- Rectangle: `between(X,x0,x1)*between(Y,y0,y1)`
- Remainder: `not(circle)*not(rectangle)`

Composite all layers on a strong color and look. Fringes or missing strokes show there, not on white.

Word crops share one vertical origin and one scale. Store the horizontal offset between them as a constant.

Animate: frame scales 0.6 → 1 with a spring, bar wipes with `clip-path: inset(0 X% 0 0)`, badge springs from 0 and rotates from about -120° around its own center (`transform-origin` at the badge center inside the crop). Words rise into an overflow-hidden line, the second about 6 frames after the first.

If a region has no edge of its own, it stays in the parent part.

## Audio

Stereo 44.1kHz WAVs. Bed length is total frames / fps, computed from the same durations as `Video.tsx`. Pads on a short chord loop, a bass that lifts when the product shots start, light plucks, a kick with sidechain ducking and offbeat hats during the product shots, kick on every other beat under the principles, fade-in and a 2.5s fade-out.

Effects: click (short filtered noise), tick (shorter), pop (rising sine), whoosh (noise under a sine window), thud (two low sines), chime (three notes). Cues per scene are `[localFrame, sound, volume]`; add each scene's start; play each in a `Sequence` with `Html5Audio`. Import reveal arrays from the scene so cues follow the picture.

Regenerate the bed when any duration changes.

## Review

```bash
ffmpeg -i /tmp/draft.mp4 -vf "fps=1,scale=480:-1,tile=4x4" sheet_%02d.png
ffmpeg -ss <seconds> -i /tmp/draft.mp4 -frames:v 1 hero.jpg
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration out.mp4
ffmpeg -i out.mp4 -af volumedetect -vn -f null -
```

Sheets for rhythm. Full frames for the cursor, the zoomed sentence, and each locale. A bed around −20 dB mean, peak under 0 dB. Sheets cannot tell you a sound is late; say if you did not listen.

## Announcement post

Plain launch voice: what you made, what it does for the reader, the link. Not the film's headlines. Count with the platform's weighting: on X, 280 weighted characters, CJK and emoji count 2, a URL counts 23.

## Timing

30fps, 120 BPM, one beat = 15 frames. Shot lengths are multiples of 15. Typical lengths: hook 120, name 105, product shots 300–330, principles 150 (one line per 30 frames), end card 150.
