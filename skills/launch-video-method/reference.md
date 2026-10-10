# Techniques

Reusable pieces for the phases in [SKILL.md](SKILL.md). None are tied to one product. When a product's test host or renderer has its own API, follow that API; the point here is what each step is for. Numbers are starting values that worked at 1920×1080, 30fps. The finished film those values came from is [example.md](example.md). Use its numbers only when you are extending that film.

## Project

```
video/<name>/                 # own package.json, npm install; kept out of git
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
  src/scenes/<Shot>.beats.ts  # the shot's frame numbers, checked by assertBeats
  src/scenes/                 # one file per shot, exports its duration
  src/Video.tsx  src/Root.tsx
video/<name>.mp4              # delivery, never committed
video/<name>-<locale>.mp4
```

Keep the film out of git without a diff: if `git check-ignore -q video/x` fails, append `video/` and `.product/` to `.git/info/exclude`. Do not edit `.gitignore`, commit, push, or open a pull request unless asked. Do not add Remotion to the product.

```bash
git check-ignore -q video/x || printf 'video/\n.product/\n' >> .git/info/exclude
git status --short   # must show nothing from the film
```

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

The video package does not own the product's test runner. The runner, and the package that boots the product, stay in the product. A small config next to the capture file points the runner at the product repo, and the npm script changes into that repo before invoking the product's package manager. This film used vitest that way. The config and the calls are in [example.md](example.md).

The shape:

- `root` is the product repository, not `video/<name>/`. Builders that read a manifest from the working directory fail if the root is the video folder.
- `include` is only `video/<name>/capture/**/*.capture.ts`, so the product's own suite does not run.
- One test loops the locales. It boots the real host, drives the real admin and action APIs, and writes each response with the runner's file snapshot (`toMatchFileSnapshot`, update with `-u`). Do not `JSON.stringify` into a file yourself; a hand-written file will not be regenerated.
- Assert the outcome the film claims, in the test, both ways: the blocked attempt fails, the fixed attempt succeeds. A snapshot of a failure can otherwise be treated as the happy path on the next run.
- Created records get the content locale. The host gets the UI locale separately, including the locale list, not only a site language field.

Sequence when the product blocks something: empty state, submit the real form, install the failing record, load each surface in the permissive mode, switch mode through the real action, load again, attempt the action and expect failure, fix the record through the real update API, check again, attempt again and expect success. Save a snapshot at every load, not only at the end.

If there is no test host, drive the running app and save the network response or the rendered DOM. The bytes still come from the product.

Tools for the rest of the film, used as command-line programs rather than as libraries inside the scenes: ffmpeg (contact sheets, logo split, `ffprobe`, loudness), python3 with numpy (pixel counts and the synthesized bed; the standard-library `wave` module writes the files), and the product's own package manager for the capture. Remotion renders. The backdrop is generated, not cut from the reference.

## Proving the renderer

Find the compiled CSS the app serves (`dist/styles.css` or the built asset), not a Tailwind source entry. Copy it in the sync script and import it once. Wrap the surface in the theme attributes the CSS expects (`data-theme`, `data-mode`, a font variable). Render one still. Compare it with a screenshot of the real app. Then build scenes.

## Shell, portals, toasts

Rebuild the shell from screenshots with the design system's CSS variables, the product's icon set, and labels from the product's translation files. Use the design system's real components (button, input, card) inside it.

A portal positions against the browser viewport, so it cannot follow a camera. Read the dialog's title, body, and button labels from the capture. Render them in normal flow with the design system's button and surface, using the popup's classes from the package source minus `fixed` centering. A dimmer layer behind it at about 0.8 opacity. Same for toasts: the captured message, design-system colors, your own placement.

## Beat sheet

Text and picture drift apart when each layer keeps its own frame numbers: the headline exits at one number, the window springs in at another, the cursor and camera have their own lists, and nobody checks that the press is visible while the viewer still remembers the headline. One file per shot fixes that. Every other file imports from it.

```ts
// src/scenes/PublishBlocked.beats.ts
import { assertBeats } from "../lib/beats";

export const beats = assertBeats("PublishBlocked", {
  duration: 330,
  headline: { in: 2, out: 36, words: 6 },
  window: { in: 40, landed: 70 },
  actions: [
    { name: "publish", camera: 112, cursor: 110, press: 118, result: 126, resultCamera: 168, holdUntil: 214, scale: 2.1 },
  ],
});
```

```ts
// src/lib/beats.ts
export type Action = {
  name: string;
  camera: number;       // camera keyframe that lands on the control
  cursor: number;       // cursor keyframe that lands on the control
  press?: number;       // omit for a read-only beat
  result: number;       // the thing the press changed is visible
  resultCamera: number; // camera keyframe that lands on the result
  holdUntil: number;    // camera leaves the result after this
  scale: number;        // camera scale at the press
};
export type Beats = {
  duration: number;
  headline?: { in: number; out: number; words: number };
  window?: { in: number; landed: number };
  actions: Action[];
};

export function assertBeats(id: string, b: Beats): Beats {
  const errors: string[] = [];
  const fail = (message: string) => errors.push(message);
  const { headline: h, window: w } = b;
  if (h) {
    const need = Math.max(30, 3 * (h.words - 1) + 16);
    if (h.out - h.in < need) fail(`headline is up ${h.out - h.in} frames; needs ${need}`);
  }
  if (h && w && w.in < h.out) fail(`window rises at ${w.in}, while the headline is read until ${h.out}`);
  if (w && w.landed - w.in > 36) fail(`window takes ${w.landed - w.in} frames to land; use a stiffer spring`);
  const first = b.actions[0];
  if (h && first && first.result - h.out > 90 + 12) fail(`first result at ${first.result} is too far from the headline (${h.out})`);
  let lastPress = -Infinity;
  for (const a of b.actions) {
    const at = a.press ?? a.result;
    if (w && at < w.landed + 20) fail(`${a.name}: at ${at}, the window has not settled (${w.landed})`);
    if (a.press !== undefined) {
      if (a.scale < 1.4) fail(`${a.name}: press at scale ${a.scale}; zoom to 1.4 or more first`);
      if (a.press - a.camera < 2) fail(`${a.name}: camera arrives at ${a.camera}, after or on the press ${a.press}`);
      if (a.press - a.cursor < 4) fail(`${a.name}: cursor arrives at ${a.cursor}, too close to the press ${a.press}`);
      if (a.result - a.press > 12) fail(`${a.name}: result ${a.result - a.press} frames after the press`);
      if (a.press - lastPress < 30) fail(`${a.name}: press ${a.press - lastPress} frames after the previous one`);
      lastPress = a.press;
    }
    if (a.resultCamera - a.result > 50) fail(`${a.name}: camera reaches the result ${a.resultCamera - a.result} frames late`);
    if (a.holdUntil - a.resultCamera < 25) fail(`${a.name}: result held ${a.holdUntil - a.resultCamera} frames`);
    if (a.holdUntil > b.duration) fail(`${a.name}: hold runs past the shot`);
  }
  if (errors.length) throw new Error(`${id} beats:\n- ${errors.join("\n- ")}`);
  return b;
}
```

The scene builds its camera keyframes, cursor keyframes, `Headline start/end`, `pop(frame, fps, beats.window.in, 16, 0.9)`, and sound cues from `beats`. A number typed in a scene that is not in the beat sheet is how the two drift.

Write the sheet in words first, one row per action, and say what the headline promised:

| Frame | Picture | Text on screen |
| --- | --- | --- |
| 2–36 | Quiet field | "Bad publishes stop before they go live." |
| 40–70 | Window rises and lands | (none) |
| 72→112 | Camera travels to Publish, scale 2.1 | (none) |
| 118 | Press Publish | (none) |
| 126 | Toast: Failed to publish | the captured message |
| 168–214 | Camera on the toast, scale 2.2 | the captured message |

If the row the headline describes is not among the first three after the window lands, rewrite the headline or reorder the shot.

### How a test film drifted

A later film written from an earlier version of this skill had these numbers in its build shot. Read them as the shape to avoid.

| | That film | The example film |
| --- | --- | --- |
| Headline on screen | 0→28, 4 words | 2→36, 6 words |
| Window starts rising | 8, under the headline | 40, as the headline leaves |
| Window spring | stiffness 70, still drifting at 60 | stiffness 170, landed at ~70 |
| First press | 52, camera at scale 1 | 118, camera at 2.1 since 112 |
| Presses | 5, 16 frames apart | 1 (2 in the control shot, 38 apart) |
| Camera first zooms | 130, after every press | 72→112, before the press |
| Headline's action visible | "A tap with nowhere to go." then the tap at 178 | "Bad publishes stop" then the stop at 126 |

The viewer read a headline, watched an unrelated window drift in, saw small clicks at full width, then a zoom onto results they had not seen caused. That is what "the text and the screen are out of sync" means.

## Stage components

**Backdrop.** `objectFit: cover`, scale about 1.06 with a slow sine breath, and a translate of about 0.08px per frame. Movement you barely notice keeps a still from looking frozen.

**Window.** On the 1920×1080 stage, `{ x: 150, y: 96, w: 1620, h: 930 }`. Radius about 18, a soft two-layer shadow, a 40px title bar with traffic lights. Enters from about 820px below with a spring, scale 0.9 → 1, origin at top center. If a rendered frame shows meadow or sky wider than about 200px beside the window, the window is too small. Make it this size before you animate. The UI being demonstrated fills the window; do not center a small device in a large empty pane.

**Camera.** Frames point `(x, y)` at the center:

```
transform-origin: 0 0
transform: translate(960px, 540px) scale(s) translate(-x px, -y px)
```

Keyframes are `{ at, x, y, scale }`, interpolated per segment with an ease-in-out bezier. Copy this shape into every product shot, with new coordinates:

```
{ at: 0, scale: 1 }          // headline 2→36, window 40→~70
{ at: 72, scale: 1 }         // the landed window has been read
{ at: 112, scale: 2.1 }      // on the control; press at 118
{ at: 168, scale: 2.2 }      // on the result (appeared at 126); hold to 214
{ at: 250, scale: 1.95 }     // the sentence
```

Scale 1 is the establishing view only. A region is 1.4–1.6. A line the viewer must read is 1.9–2.2. Hold each read for 25–45 frames. A product shot whose maximum scale is 1 is unfinished.

**Cursor.** A child of the camera, in stage coordinates. The glyph is about 44×50px, black with a white stroke, tip at the keyframe. Keyframes `{ at, x, y }`. On a click frame: scale dips about 18% over 10 frames, and a ring expands and fades over about 18 frames. Hide it until it is needed. A product shot with no cursor did not borrow the reference.

**Headline.** Reveal word by word, about 3 frames apart, each word rising from below its line over 16 frames. Exit upward with a fade about 14 frames. The window's spring starts at the exit frame, not earlier. Shrink to fit about 1720px.

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

Generate, never copy. The photograph is only the world behind the product windows. Hook, logo, principles, and end card do not use it.

Do not generate rolling green hills with yellow and white wildflowers. That place is the worked example's, and a later film copied it onto every shot.

Keep the structure, change the place:

> Wide 16:9 photograph of [a place that fits this product], the subject in the lower third, a large empty sky, soft daylight, no people, no text, no logos.

Save as JPEG around 1920px wide.

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

## Review and repair

```bash
npx remotion render src/index.ts <Film> /tmp/draft.mp4 --scale=0.5 --log=error
ffmpeg -i /tmp/draft.mp4 -vf "fps=1,scale=480:-1,tile=4x4" sheet_%02d.png
ffmpeg -ss <seconds> -i /tmp/full.mp4 -frames:v 1 click.jpg
# sync strip for one shot: headline exit to first result, 4 fps
ffmpeg -ss <shotStart+headlineOut/30> -t 4 -i /tmp/draft.mp4 -vf "fps=4,scale=480:-1,tile=4x4" -frames:v 1 sync.png
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate:format=duration out.mp4
ffmpeg -i out.mp4 -af volumedetect -vn -f null -
```

Open the sheet and reject the film if any of these are true. Repair that shot, re-render it, and make a new sheet. Do not deliver past a reject.

| What you see | Repair |
| --- | --- |
| Copy is not English, and the user did not name another language | Rewrite the copy file. Do not infer the language from the chat. |
| The window is a small card with photograph on every side | Set the window to 1620×930 near (150, 96). Side gaps over about 200px fail. |
| The thing being demonstrated is a small device inside an empty window | Make that surface fill the window. |
| A product shot's frames all look alike | Add the scale pattern: hold 1, then 1.6 or more, and 1.9 or more on the sentence. |
| No cursor on the click | Add the 44×50 glyph as a child of the camera. Measure the tip onto the control after fonts load. Delete hand-written coordinates. |
| The product surface is a PNG or a screenshot from `docs/` | The import failed and was abandoned. Fix the import and render the component. A bitmap cannot be clicked and goes soft when the camera zooms. |
| The photograph is behind the hook, the logo, the principles, or the end card | Those shots are a plain field. Paper or ink. The photograph stays behind the product windows. |
| Principles has shapes, repeated logos, or the photograph | Type on ink, one line at a time. Keep the duration. |
| The backdrop is green hills and wildflowers | Generate a different place. That one is the example's. |
| The last row of the sheet is empty black for more than about a second | The fade is the last ~15 frames of the end card, not a dead tail. |
| A full-frame click still shows the cursor missing the control by more than a few pixels | Fix the measurement. Ancestor transforms must be divided out. Re-render that shot. |
| A headline describes something that appears seconds later | Rewrite the headline to name the first action, or move that action to within 90 frames of the headline's exit. |
| The window is rising while the headline is still on screen | Start the window spring at the headline's exit frame. |
| A press happens at scale 1, or while the window is still moving | Put the camera on the control first (scale 1.4+, 1.8+ for a small control), then the cursor, then the press. Zoom to the result afterwards. |
| Several presses within a second | Keep presses 30+ frames apart. Show one slowly; let repeats go by in one move. |
| A part appears after a click on a palette, in a product that uses drag | Drag it: cursor down on the palette item, the item follows the cursor, drops, lands. |
| The user asked for an order or a scene that is not in the film | Rebuild the shot list from the user's request. The default shape only fills gaps. |
| The film's length equals the example's while the reference is a different length | Recut to the reference's length and shot count. |
| A blank or half-built frame was noted in review and the delivery was rendered anyway | Fix it first. A noted problem that ships is a failed review. |
| Zoomed type is cut off | Frame the sentence, not the middle of a full-width banner. Shrink Japanese lines if that locale was requested. |

A bed around −20 dB mean, peak under 0 dB. The sheet cannot tell you a sound is late. Say so if you did not listen.

## Announcement post

Plain launch voice: what you made, what it does for the reader, the link. Not the film's headlines. Count with the platform's weighting: on X, 280 weighted characters, CJK and emoji count 2, a URL counts 23.

## Timing

30fps, 120 BPM, one beat = 15 frames. Shot lengths are multiples of 15. The example's lengths were hook 120, name 105, product shots 300–330, principles 150 (one line per 30 frames), end card 150, for a 49.5-second film. Scale them to the reference's total; do not copy the total.
