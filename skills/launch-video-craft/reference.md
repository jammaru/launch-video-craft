# Techniques

Reusable pieces for the phases in [SKILL.md](SKILL.md). None are tied to one product. When a product's test host or renderer has its own API, follow that API; the point here is what each step is for. The kit is 1920×1080 at 60fps. Frame counts in the procedure are for that rate. `assertBeats` stores its limits as 30fps frame counts and multiplies by `FPS / 30`, so a one-second hold is 60 frames here. `npm run inspect` reads the mp4's frame rate. The finished film those older numbers came from is [example.md](example.md), which is 30fps. Use its integers only when you are extending that film.

## Project

`kit/` is this layout, ready to run: copy it to `video/<name>/`, `npm install`, `npm run sync`. Its two demo shots (`Command`, `Agent`) render with real captured output and pass `assertBeats`; replace them with this product's shots.

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

First write what the reference is and how this product fits it, as roles, not pictures:

| Reference scene | What it is for | In this product |
| --- | --- | --- |
| A phone rises with the app open | shows the product exists where you are | the playground, or the terminal for a CLI |
| A prompt is typed, the agent works | shows the main gesture and its result | the one command, or the one prompt to an agent |
| A second device picks up the task | shows a second way in | drop, if the product has one way in |
| Logo and tagline | names it | the name shot |

Then add the roles this product needs that the reference lacks, and drop the ones it cannot honestly fill. The reference's length and shot count are not targets.

Then three lists before coding:

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

## Capturing a product with no UI

When the product is a command, a library, or an agent skill, the terminal and the agent's tool cards are the shell, and the bytes inside them are the product. `kit/capture/lib.mjs` has the helpers below.

**A clean place to run.** An empty project under `video/<name>/.scratch/<project>`, `git init`ed if the tool expects a repository. Run with `HOME` set to `.scratch`, so the tool prints `~/<project>` instead of a personal path. Keep `npm_config_cache` pointed at the real cache, or every run downloads everything.

**Private repositories.** Moving HOME hides the keychain and the git config, so `git clone` asks for credentials and fails. Authenticate through the GitHub CLI for that process only:

```js
const env = {
  HOME: scratchHome,
  npm_config_cache: realNpmCache,
  GH_TOKEN: execSync("gh auth token").toString().trim(),
  GIT_CONFIG_COUNT: "1",
  GIT_CONFIG_KEY_0: "credential.helper",
  GIT_CONFIG_VALUE_0: "!gh auth git-credential",
};
```

**What a person saw, not the bytes.** Interactive CLIs redraw: a spinner rewrites its line with `ESC[1G ESC[J` or `\r`. Split each line on those and keep the last piece, then strip color codes (`\x1b\[[0-9;?]*[A-Za-z]`) and OSC links. Set `FORCE_COLOR=0`. Squeeze runs of blank lines. Do not reword, reorder, or shorten the lines; choose which lines to frame instead.

**Assert the claim.** After an install, the installed file exists. A rejection exits non-zero and prints the reason; the fix exits zero. A capture that does not assert can silently record a failure as the happy path.

**Filming a rejection.** Build the failing input inside the film project (a drifting beat sheet, a bad config) and run the real command on it. If the command is the film's own renderer, register the failing composition with `lazyComponent`, so its error is raised only when that composition renders, not when the film bundles. Run with the default log level; `--log=error` hides the lines a person sees. Keep the output up to the error header, then the message and the reasons; drop the stack trace.

**The agent's steps.** Capture what the agent would read and run: the skill file's path and line count, each command and its output. Text the agent writes in its own words (a diagnosis, a plan) is film copy, but any list it shows that came from a file (notes, a plan) is parsed from that file.

Tools for the rest of the film, used as command-line programs rather than as libraries inside the scenes: ffmpeg (contact sheets, logo split, `ffprobe`, loudness), python3 with numpy (pixel counts and the synthesized bed; the standard-library `wave` module writes the files), and the product's own package manager for the capture. Remotion renders. The backdrop is generated, not cut from the reference.

## Showing the real UI

The window shows the product's own UI, and `npm run verify` checks it. Reading the product's renderer and stylesheet and then writing your own JSX that looks like it is a lookalike: one film rebuilt a playground's result cards as tabs that do not exist in the product, another kept the product's CSS but rebuilt the markup. Both passed every other check. Measured against a screenshot of the real page, their windows scored 0.07 and 0.14; the real page scores about 0.8 or more.

Decide by what the product ships:

| The product ships | The window shows | `window.real` |
| --- | --- | --- |
| A web page it builds to static files (a playground, a demo, a dashboard that runs without a server) | that build, in `<ProductFrame>` | `{ screenshot: "capture/real/<Shot>.png" }` |
| React components and compiled CSS for an app that needs a server | the components, imported, with the shipped CSS from `src/vendor/` and captured data | `{ capture: "src/captured/<file>.json" }` |
| A command, a library, an agent skill | `Terminal` or the agent chat, with captured output | `{ capture: "src/captured/<file>.json" }` |
| A screen that cannot be mounted here, which the user asked to see | a drawing of the captured rows only. No `Window` | none. Say in NOTES.md which parts are drawn |

**A web page the product builds.** Run the product's own build (with a relative base, such as vite's `base: "./"`, so the page loads from a subfolder). In `capture/`, call `shootProduct`:

```js
import { shootProduct } from "./lib.mjs";
await shootProduct({
  dist: "../../.product/<name>/packages/playground/dist",
  shots: { Playground: { path: "index.html", hash: "" } },   // the state the window lands on
});
```

It copies the build to `public/product/`, serves the same files to the headless browser Remotion installed, and screenshots each shot's state at the window body's size (1620×889) into `capture/real/<Shot>.png`. In the scene:

```tsx
import { byText, bySelector, ProductFrame, productPage, useProduct } from "../components/ProductFrame";

const find = { gemini: byText(".overview-item", "Gemini"), cards: bySelector(".target-overview") };

const product = useProduct({ src: productPage("index.html", hash), find });
const boxAt = (name: string) => stageBox(product.boxes[name]);
// camera, cursor, assertFraming exactly as with useAnchors, with ready: product.ready
<Window title="…"><ProductFrame product={product} /></Window>
```

`useProduct` holds the frame until the page, its fonts, and every `find` are ready, measures inside the page before `continueRender`, and turns off the page's CSS transitions so every frame is settled. A `find` that matches nothing fails the render. Anchors are the product's own markup: its classes and its text; nothing is added to the product.

State comes from the frame, never from a click sent into the page: a frame is a fresh page. If the page keeps state in its URL, pass it as `hash`. Otherwise `prepare(doc, win)` drives the page's own controls before measuring (choose an example in its select, click its tab). For a change the viewer sees, mount one `useProduct` per state and switch with `visibility` at the result frame. Hide the product's demo chrome with the camera, not by editing its page.

`npm run verify` renders the landed frame (window at rest, camera at scale 1) and compares the window body with the screenshot (`scripts/similar.py`, edge match 0.5 or more). It also fails when a scene draws a `Window` without `window.real`, when a screenshot shot does not use `useProduct` and `<ProductFrame>`, and when a `capture` shot does not import its capture file or renders it outside `Terminal`, the chat, or the shipped CSS. The window lands in the state that was shot; a later state is reached by the film.

**Components and CSS.** Find the compiled CSS the app serves (`dist/styles.css` or the built asset), not a Tailwind source entry. Copy it in the sync script and import it once. Wrap the surface in the theme attributes the CSS expects (`data-theme`, `data-mode`, a font variable). Render one still and put it beside a screenshot of the real app. Then build scenes.

### When the screen cannot be mounted

Use this only after the three rows above are impossible: the product's page will not build or serve in this environment, its components will not import, and the thing the user asked to see is not a terminal. A pull request, an editor, or a job list can be that case.

Capture the real data the drawing will show: the diff, the commits, the job names, the file text. Assert it, the same way as any other capture. In the scene, draw only those rows. Do not invent a filename, a count, a status, or an edge that is not in the JSON.

Do not wrap the drawing in `Window` and do not set `window.real`. Those tell verify the page is the product's own, and a drawing will fail that comparison. Under "How the product's UI is shown" in NOTES.md, name each part: the real page or the real command output, and the parts drawn from the capture. A drawn card is not `ProductFrame`.

## A scene in Three.js

The kit is DOM and CSS. A film whose picture is one object changing shape can add a spatial scene. Install, inside `video/<name>/` only:

```
npm install three@0.172.0 @react-three/fiber@9.1.2 @remotion/three@4.0.531
npm install -D @types/three@0.172.0
```

Match `@remotion/three` to the film's Remotion version. `ThreeCanvas` needs `width` and `height`. During a render its frameloop is `"never"` and it advances in an effect, so set the camera in the component body (through `useThree`) before that effect. `useFrame` and `requestAnimationFrame` do not run in time with the frame being drawn.

```tsx
<ThreeCanvas
  width={1920}
  height={1080}
  dpr={1}
  gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.NoToneMapping }}
>
```

Headless Chrome's SwiftShader fails with `Could not create a WebGL context` (`BindToCurrentSequence failed`). The kit sets `Config.setChromiumOpenGlRenderer("angle")`. `npm run verify` passes `chromiumOptions: { gl: "angle" }` to every `renderStill`. The CLI render loads `remotion.config.ts`; a script that calls `renderStill` itself does not, so it must pass the same option.

Readable type and UI (a diff, an editor, a button) do not go on a mesh as an afterthought. Draw them into a canvas texture with the film's loaded face, or as HTML in front of the canvas. HTML behind the canvas is covered. White on the brand green is about 2.5:1; ink on that green is about 7.6:1.

Do not add a sphere, a ring, or a bar so `blank.py` or `freezedetect` passes. A frame is empty only when every tile is flat, so a visible line is enough. If a moving shot still fails the 4-second freeze check, the subject is too small in the frame: move the camera or enlarge that subject.

## Shell, portals, toasts

Rebuild the shell from screenshots with the design system's CSS variables, the product's icon set, and labels from the product's translation files. Use the design system's real components (button, input, card) inside it.

A portal positions against the browser viewport, so it cannot follow a camera. Read the dialog's title, body, and button labels from the capture. Render them in normal flow with the design system's button and surface, using the popup's classes from the package source minus `fixed` centering. A dimmer layer behind it at about 0.8 opacity. Same for toasts: the captured message, design-system colors, your own placement.

## Beat sheet

Text and picture drift apart when each layer keeps its own frame numbers: the headline exits at one number, the window springs in at another, the cursor and camera have their own lists, and nobody checks that the press is visible while the viewer still remembers the headline. One file per shot fixes that. Every other file imports from it.

The sheet below is the 30fps example film. On this kit those seconds are twice the frames, and `assertBeats` will say how many this `FPS` needs.

```ts
// src/scenes/PublishBlocked.beats.ts
import { assertBeats } from "../lib/beats";

export const beats = assertBeats("PublishBlocked", {
  duration: 330,
  headline: { in: 2, out: 36, words: 6 },
  window: { in: 40, landed: 70, real: { screenshot: "capture/real/PublishBlocked.png" } },
  actions: [
    { name: "publish", target: "publish", resultTarget: "toast", camera: 112, cursor: 110, press: 118, result: 126, resultCamera: 168, holdUntil: 214, scale: 2.1, proves: true },
  ],
});
```

```ts
// src/lib/beats.ts
import { FPS } from "../theme";

/** A duration written at 30fps, in this film's frames. One second is 30 frames there and 60 here. */
const span = (at30: number) => at30 * (FPS / 30);

export type Action = {
  name: string;
  camera: number;       // camera keyframe that lands on the control (or on the output, for a read)
  cursor?: number;      // cursor keyframe that lands on the control; omit when nobody presses (an agent's step)
  press?: number;       // omit for a read-only beat
  result: number;       // the thing the press changed is visible
  resultCamera: number; // camera keyframe that lands on the result
  holdUntil: number;    // camera leaves the result after this
  scale: number;        // camera scale at the press
  proves?: boolean;     // this is what the headline names; defaults to the first action
  target?: string;      // data-anchor pressed (or read, for a read-only beat); assertFraming checks it in space
  resultTarget?: string; // data-anchor of what the press changed; framed and uncovered during the hold
  playing?: boolean;    // the held picture moves by itself (a video plays), so a long hold is allowed
  key?: boolean;        // the press is a key (Enter), not a click: no cursor needs to be on the target
};
export type Beats = {
  duration: number;
  headline?: { in: number; out: number; words: number };
  window?: { in: number; landed: number; real: Real };
  actions: Action[];
};
/**
 * What the window shows, and where it came from. A web page the product builds: the screenshot
 * shootProduct took of it, compared with the landed frame by npm run verify. A terminal, an agent,
 * or an app that needs a server: the captured JSON file the scene renders.
 */
export type Real = { screenshot: string } | { capture: string };

export function assertBeats(id: string, b: Beats): Beats {
  const errors: string[] = [];
  const fail = (message: string) => errors.push(message);
  const { headline: h, window: w } = b;
  if (h) {
    const need = Math.max(span(30), span(3) * (h.words - 1) + span(16));
    if (h.out - h.in < need) fail(`headline is up ${h.out - h.in} frames; needs ${need} at ${FPS}fps`);
  }
  if (h && w && w.in < h.out) fail(`window rises at ${w.in}, while the headline is read until ${h.out}`);
  if (w && !w.real) fail(`the window shows the product; name where it came from (window.real: the screenshot shootProduct took, or the captured JSON)`);
  if (w && w.landed - w.in > span(36)) fail(`window takes ${w.landed - w.in} frames to land; use a stiffer spring`);
  const proof = b.actions.find((a) => a.proves) ?? b.actions[0];
  if (h && proof && proof.result - h.out > span(90) + span(12)) fail(`${proof.name}: what the headline names shows at ${proof.result}, ${proof.result - h.out} frames after it leaves (${h.out})`);
  let lastPress = -Infinity;
  for (const a of b.actions) {
    const at = a.press ?? a.result;
    if (w && at < w.landed + span(20)) fail(`${a.name}: at ${at}, the window has not settled (${w.landed})`);
    if (a.press !== undefined) {
      if (a.scale < 1.4) fail(`${a.name}: press at scale ${a.scale}; zoom to 1.4 or more first`);
      if (a.press - a.camera < span(2)) fail(`${a.name}: camera arrives at ${a.camera}, after or on the press ${a.press}`);
      if (a.cursor === undefined) {
        if (!a.key) fail(`${a.name}: a press needs a cursor keyframe`);
      }
      else if (a.press - a.cursor < span(4)) fail(`${a.name}: cursor arrives at ${a.cursor}, too close to the press ${a.press}`);
      if (a.result - a.press > span(12)) fail(`${a.name}: result ${a.result - a.press} frames after the press`);
      if (a.press - lastPress < span(30)) fail(`${a.name}: press ${a.press - lastPress} frames after the previous one`);
      lastPress = a.press;
    }
    if (a.resultCamera - a.result > span(50)) fail(`${a.name}: camera reaches the result ${a.resultCamera - a.result} frames late`);
    if (a.holdUntil - a.resultCamera < span(25)) fail(`${a.name}: result held ${a.holdUntil - a.resultCamera} frames`);
    if (a.holdUntil > b.duration) fail(`${a.name}: hold runs past the shot`);
    if (!a.playing && a.holdUntil - a.resultCamera > span(120)) fail(`${a.name}: the same picture is held ${a.holdUntil - a.resultCamera} frames; nothing changes for over 4 seconds`);
    if (!a.target) fail(`${a.name}: name the data-anchor it lands on (target), so assertFraming can check the camera and cursor`);
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

**Window.** On the 1920×1080 stage, `{ x: 150, y: 96, w: 1620, h: 930 }`. Radius about 18, a soft two-layer shadow, a 40px title bar with traffic lights. Enters from about 1000px below with a spring, scale 0.9 → 1, origin at top center, and is hidden until it starts to move. From 820px a 930px window still peeks above the bottom edge while the headline is read. If a rendered frame shows meadow or sky wider than about 200px beside the window, the window is too small. Make it this size before you animate. The UI being demonstrated fills the window; do not center a small device in a large empty pane.

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

Scale 1 is the establishing view only. A region is 1.4–1.6. A line the viewer must read is 1.9–2.2. Hold each read for 50–90 frames at 60fps. A product shot whose maximum scale is 1 is unfinished.

**Cursor.** A child of the camera, in stage coordinates. The glyph is about 44×50px, black with a white stroke, tip at the keyframe. Keyframes `{ at, x, y }`. On a click frame: scale dips about 18% over 10 frames, and a ring expands and fades over about 18 frames. Hide it until it is needed. A product shot with no cursor did not borrow the reference.

**Headline.** Reveal word by word, about 6 frames apart at 60fps, each word rising from below its line over 32 frames. Exit upward with a fade about 28 frames. The window's spring starts at the exit frame, not earlier. Shrink to fit about 1720px. The component scales these with `FPS`, so the rise stays about half a second. `cover` defaults to true and paints the field across the frame. Pass `cover={false}` when one object continues through the title: the field is then a plate behind the words, and the object stays visible around it. The words still sit on the plate.

## Click targets

Every position the camera or cursor uses comes from a measured `data-anchor`. The kit does the measuring and the arithmetic:

```ts
const { boxes, ready } = useAnchors(bodyRef);       // measured after fonts, inside delayRender
const boxAt = (name: string, frame = 0) => stageBox(boxes[name], scrollAt(frame)); // scrollAt: the scene's own scroll
const [focus, send] = beats.actions;
const composer = boxAt("composer");
const camera: CameraKey[] = [
  { at: 0, x: 960, y: 540, scale: 1 },
  { at: beats.window!.landed, x: 960, y: 540, scale: 1 },
  { at: focus.camera, ...fit(composer, { fill: 0.75, max: 1.9 }) },
  { at: send.resultCamera, ...fit(boxAt("reply", send.resultCamera)) },
];
const cursor: CursorKey[] = [
  { at: focus.cursor!, ...pointIn(boxAt("composer-text"), { fx: 0, dx: 8 }) },
  { at: send.cursor!, ...pointIn(boxAt("send")) },
];
assertFraming("Agent", { beats, camera, cursor, ready, boxAt });
```

- `fit(box)` centres the box, scales it to fill about 62% of the frame (clamped 1.4–2.4), and keeps a zoomed view inside the window so the backdrop does not fill half the frame. `fitLeft` frames a line of text by its left edge. `union` frames a command and its output together.
- **No fallback position.** `boxes.send ?? { x: 1200, y: 800 }` is the bug that put a film's click 150px beside its button: the measurement failed silently and the guess shipped. `pointIn(box)` returns an off-stage point until the box exists, and `assertFraming` names the missing anchor. `npm run verify` rejects `?? { x: <number>` and `? … : { x: <number>` in a scene. If an anchor is missing, fix the anchor.
- **Anchor the thing, not its container.** A full-width row centres the camera on empty space. Anchor the sentence, the button, the one card. A box larger than the view fails `assertFraming`.
- **Anchors must keep their size.** `useAnchors` measures once. Text being typed is measured at its first frame, when it is empty. The kit's terminal lays out the untyped rest of the command invisibly, so `prompt-text` has the full width on every frame. Do the same for any text that grows: mount it whole, hide what has not appeared.

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

**The product's page, measured.** `useProduct` (above) measures inside the page in the same `delayRender` that waits for its `load`, so no frame renders before the boxes exist. Each frame is rendered in a fresh page, possibly out of order: a click sent into the page on frame 120 does not exist on frame 121. Derive the state from the frame (a `hash`, or `prepare`) and switch states with `visibility`. Keep the product's demo or capture-mode chrome (a banner, a debug summary) out of the frame with the camera. A summary line that prints the answer before the shot shows it gives the shot away.

## Framing check

`assertBeats` checks the beat sheet in time. `assertFraming` (`kit/src/lib/framing.ts`) checks it in space, against the measured boxes, and throws while rendering so the still fails with the reason:

| Check | Fails when |
| --- | --- |
| Measured | an action's `target` or `resultTarget` has no measured `data-anchor` |
| On target | at the press, the cursor tip is more than 4px outside the target (skipped for `key: true`) |
| In view | at the press, the target is not wholly inside the view, or the scale is under 1.4 |
| Product, not backdrop | a zoomed view at the press or on the result is more than 10% backdrop outside the window |
| Readable | the result is larger than the view, cut by the frame (8px margin), or fills under 35% of the view's width and height |
| Still | the result moves more than 6px while the camera holds it (a scroll that did not stop) |
| Zoomed hold | the camera is under scale 1.4 while the result is held |
| Clean edges | a held frame (rendered without the overlay) has type cut by its top, bottom, left, or right edge (`scripts/edges.py`) |
| Uncovered | the cursor sits on the result after the press, or is still in view once the camera is on the result |
| Real UI | a `Window` without `window.real`; a screenshot shot not drawn with `ProductFrame`, or whose landed window body matches the screenshot under 0.5 (`scripts/similar.py`); a capture shot that does not import its capture (verify, not `assertFraming`) |

Errors name the coordinates (`the cursor presses at (408, 297), 113px off "prompt-ps1" (186, 165, 190×24)`), so the fix is arithmetic, not guessing. Do not loosen a check to pass it; fix the anchor, the camera, or the timing.

`npm run verify` renders, for every shot, the headline mid-read and mid-exit, the landed window, and for each action the press, the result, and the hold end, with `debug: true`. A beat sheet with no clicks also gets three body stills: after the headline has cleared, around 62% of the shot, and near the end. In debug, `FramingOverlay` outlines each named anchor in red with its name and marks the cursor tip with a blue cross. It writes `review/<Shot>/<frame>-<label>.png`, a sheet per shot, and `review/report.json`. It also fails on:

- a fallback coordinate in a scene,
- a beat sheet that `assertBeats` or `assertFraming` rejects,
- type that is hard to read: `scripts/contrast.py` splits headline stills (and stills of shots without beats: name, principles, end card) into a 12×8 grid. A flat cell under 3:1 fails when no flat cell reaches 3:1, which is type that is too light, such as a dark logo on ink. Marks that exist only inside picture cells fail too, because the words have no plate. A picture or a smooth object in other cells does not fail the headline once the words read at 3:1 on their plate. An empty headline (under 0.2% of pixels differing from the field) fails. Body stills are checked with `--blank-only`: a cell with a mark is enough, so one line of type counts, a graph is allowed, and an empty field after the title fails. A dark logo on an ink end card still fails.

`npm run render` runs `scripts/gate.mjs` first. It refuses when `review/report.json` is missing, lists failures, or is older than any file in `src/`, `public/`, or `capture/`, and when `NOTES.md` under "Stills checked" lacks a written line for a shot (the template's parenthesised placeholder does not count). Write what the stills show, not that you looked: "crosshair on the $ of prompt-ps1 at 104; command and v26.4.0 whole at 166 and 208, cursor out of view".

## Chat and logs

A chat or log grows over time. Each message is one item, mounted from the start, with the frame it appears at. `chatScroll` in `kit/src/components/Chat.tsx` measures each item's bottom: the scroll target for an item is `max(0, bottom - viewport + 24)`, held until the item appears, then eased to over 18 frames. An item at or before frame 0 is already there, so a shot can continue the conversation of the shot before. The camera reads the same scroll (`logStageBox(box, keys, frame)`) when it frames an item.

Type the prompt into the composer character by character, with a blinking caret, and a tick sound every few frames. The send click lands on a beat; the message appears in the log a few frames later.

**An agent doing the work.** `Chat.tsx` has the pieces, and they look one way in every film: Inter Tight for what is said, JetBrains Mono for commands and output (`fonts.chat`, `fonts.mono`), Phosphor icons. The person's part is the composer: cursor to the field, type, cursor to Send, press. After that, each item sits in a `Reveal` that fades in and rises 26px over about half a second, inside `ChatLog`:

| Piece | Shows | Source |
| --- | --- | --- |
| `UserBubble` | the prompt, right-aligned on a gray bubble | film copy |
| `AgentText` | one or two sentences in the agent's voice: which skill it uses, what it found, what it will change | film copy |
| `ToolCard kind="run"` | gray header: terminal icon, `Ran`, the command in mono; the output lines below, 2 frames apart | capture |
| `ToolCard kind="read" \| "write"` with no lines | `Read <file>` or `Wrote <file>`, the header alone | the file read or changed |
| `ToolCard kind="tool"` | an MCP or API call: `Tool call`, the tool name, its arguments as code lines | capture |
| `Done` | green line with a check: what passed, and the captured detail on the right | capture |
| `Composer` | the field, a chip naming the skill or tool, and Send; it stays after Send with its placeholder | film copy |

These beats are read-only in the beat sheet: no `cursor`, no `press`. The cursor leaves the reply after Send. Show at most about six lines of a long output and end with `… N more`, the way agent UIs collapse it, so the next step stays in the window. The log column is 1000px, so a card stays whole at scale 1.8; frame a card with `fit` on its item. Color keys and strings, and pill the decisive value (`block`, `allow`) so the camera has one thing to read. The terminal (`Terminal.tsx`) uses the same mono face, so a film that has both reads as one set.

## Type

Latin splits on spaces. Japanese has none, so split into chunks of about four characters with trailing punctuation kept. Keep each line `white-space: nowrap` and shrink so the widest line fits about 1720px, estimating 1em per CJK character and 0.55em otherwise.

Load Latin from `@remotion/google-fonts` with `subsets: ["latin"]` and only the weights you use. For Japanese on macOS, fall back to `"Hiragino Sans", "Hiragino Kaku Gothic ProN"` and say so in the report.

## Backdrop prompt

Generate, never copy. The photograph is only the world behind the product windows. Hook, logo, principles, and end card do not use it.

The prompt is a place and a light, nothing else. Words in the prompt end up painted in the picture: "backdrop photograph for <product> launch video" gives a sky with the product's name in it, or a billboard. Leave out the product's name and every word about software, launches, or video.

Do not generate rolling green hills with yellow and white wildflowers. That place is the worked example's, and a later film copied it onto every shot.

Keep the structure, change the place:

> Wide 16:9 landscape photograph of [a natural place: a coastline, a dune field, a lake under mountains, a moor], the land in the lower third, a large empty sky, [soft morning light], no people, no buildings, no signs, no writing.

Save as JPEG around 1920px wide. Open it at full size. Any letter, sign, logo, screen, or person means generate again; `npm run verify` fails on writing that tesseract can read. Write what you saw as the "Backdrop" line under "Film checked".

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

Word crops share one vertical origin and one scale. Store the horizontal offset between them as a constant. Simplest: keep every layer on the full canvas and draw them all with `LogoLayers` (kit/src/components/Logo.tsx), so there is no offset to store.

Animate: frame scales 0.6 → 1 with a spring, bar wipes with `clip-path: inset(0 X% 0 0)`, badge springs from 0 and rotates from about -120° around its own center (`transform-origin` at the badge center inside the crop). Words rise into an overflow-hidden line, the second about 6 frames after the first.

If a region has no edge of its own, it stays in the parent part.

## Audio

Stereo 44.1kHz WAVs. Bed length is total frames / fps, computed from the same durations as `Video.tsx`. Pads on a short chord loop, a bass that lifts when the product shots start, light plucks, a kick with sidechain ducking and offbeat hats during the product shots, kick on every other beat under the principles, fade-in and a 2.5s fade-out.

Effects: click (short filtered noise), tick (shorter), pop (rising sine), whoosh (noise under a sine window), thud (two low sines), chime (three notes). Cues per scene are `[localFrame, sound, volume]`; add each scene's start; play each in a `Sequence` with `Html5Audio`. Import reveal arrays from the scene so cues follow the picture.

Regenerate the bed when any duration changes.

## Review and repair

`npm run verify` first, after every change to a scene, a beat sheet, or a capture. After the delivery render, `npm run inspect` (run by `npm run render`) does the same for the finished mp4, and `npm run finish` is the last check before the user sees it. Open each `review/<Shot>-sheet.png`. The machine checks catch a miss by coordinates; the sheet is where you see a frame that is legal and still wrong (the camera on an empty half of the window, a banner from the product's demo mode, a card whose header is cut). Then the draft film:

```bash
npx remotion render src/index.ts <Film> /tmp/draft.mp4 --scale=0.5 --log=error
ffmpeg -i /tmp/draft.mp4 -vf "fps=1,scale=480:-1,tile=4x4" sheet_%02d.png
ffmpeg -ss <seconds> -i /tmp/full.mp4 -frames:v 1 click.jpg
# sync strip for one shot: headline exit to first result, 4 fps
ffmpeg -ss <shotStart+headlineOut/fps> -t 4 -i /tmp/draft.mp4 -vf "fps=4,scale=480:-1,tile=4x4" -frames:v 1 sync.png
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
| The window shows a UI written for the film: its own JSX or inline styles imitating the product, tabs or panels the product does not have | Delete it. Shoot the product's build with `shootProduct` and show it in `ProductFrame`, or import its components with the shipped CSS. `npm run verify` compares the landed frame with the real page. |
| The product surface is a PNG or a screenshot from `docs/` | The import failed and was abandoned. Fix the import and render the component. A bitmap cannot be clicked and goes soft when the camera zooms. |
| The photograph is behind the hook, the logo, the principles, or the end card | Those shots are a plain field. Paper or ink. The photograph stays behind the product windows. |
| Principles has shapes, repeated logos, or the photograph | Type on ink, one line at a time. Keep the duration. |
| The backdrop is green hills and wildflowers | Generate a different place. That one is the example's. |
| The last row of the sheet is empty black for more than about a second | The fade is the last ~15 frames of the end card, not a dead tail. |
| A full-frame click still shows the cursor missing the control by more than a few pixels | Fix the measurement. Ancestor transforms must be divided out. Re-render that shot. |
| A headline describes something that appears seconds later | Rewrite the headline to name the first action, or move that action to within 180 frames of the headline's exit at 60fps. |
| The window is rising while the headline is still on screen | Start the window spring at the headline's exit frame. |
| A press happens at scale 1, or while the window is still moving | Put the camera on the control first (scale 1.4+, 1.8+ for a small control), then the cursor, then the press. Zoom to the result afterwards. |
| Several presses within a second | Keep presses 60+ frames apart at 60fps. Show one slowly; let repeats go by in one move. |
| A part appears after a click on a palette, in a product that uses drag | Drag it: cursor down on the palette item, the item follows the cursor, drops, lands. |
| The user asked for an order or a scene that is not in the film | Rebuild the shot list from the user's request. The default shape only fills gaps. |
| The film is padded to match the reference's length, or a needed proof was cut to match it | Recut to the shots this product needs. The reference gives the shape, not the length. |
| A logo part is narrower or taller than in the original file | The layer was given its own width and height. Draw every layer in one box with `LogoLayers`; animate with `transform`. |
| A letter at the edge of a logo layer is cut (the last letter of the words, the end of a bar) | The layer was trimmed through the part. Recut on the full canvas with a margin; trim only empty pixels. |
| Headline type fades out over the photograph | The type leaves before its field clears (the kit's `Headline` does this); `npm run verify` checks a still mid-exit. |
| A check fails and the fix changes a colour or a timing only to get under its threshold | That is loosening the check from the other side. Fix what the check found; if the check is wrong, report it. |
| The lockup is followed by the name in type, or the name appears three times in a row | The lockup is the name. Remove the typed copy. |
| A zoomed frame slices a line of text along its top or bottom edge | Move the camera so the frame's edges fall in the gaps between rows, or include the line whole. A half line at the edge reads as a mistake. |
| The demonstrated surface fills only the top half of the window | Make it fill the window (larger type in the surface, more rows, or a shorter window body); the empty half is what the viewer sees at scale 1. |
| A shot is a flat field with nothing on it (`blank` in verify, `nothing on screen` in inspect) | The type is the same colour as its field, or the scene did not mount. A light `tone` on `Headline` gets an ink field. A frame is empty only when every tile is flat, so do not add a disc or a bar to keep a thin line. |
| Inspect says the film is about twice as long as the shots | The check used to assume 30fps. It reads `r_frame_rate` from the file. Replace `scripts/inspect.mjs` if it still says `const fps = 30`. |
| A headline hides the object that is supposed to continue into the scene | Pass `cover={false}` on `Headline`. The words keep a plate. The object stays in the frame. |
| A moving shot fails the 4-second freeze check, so a ring or a sphere was added | Delete the added shape. Move the camera or enlarge the subject that is already in the storyboard. Do not lower `n` or `d` on `freezedetect`. |
| `ThreeCanvas` throws `Could not create a WebGL context` | Set the OpenGL renderer to `angle` (the kit's `remotion.config.ts` does). A direct `renderStill` also needs `chromiumOptions: { gl: "angle" }`. |
| The backdrop has letters, a sign, a logo, or a screen in it | Generate it again from a prompt that names only a place and the light: no product name, no "launch", "video", "app", "AI". |
| A blank or half-built frame was noted in review and the delivery was rendered anyway | Fix it first. A noted problem that ships is a failed review. |
| Terminal or tool-card text is typed into a scene | Capture it from the real command and read the JSON. |
| The person types the agent's commands, or the cursor presses during the agent's steps | After the prompt is sent, every step is a tool card with no cursor. |
| A personal path or username shows in captured output | Capture again with HOME pointed at the scratch folder. |
| A spinner line shows overlapping states | Keep only the last redraw of each line. |
| The camera frames the middle of the window for a line of text | Anchor the text span, not the full-width row; for text being typed, measure the stable prompt. |
| An empty card or box is visible before its first line | Hide the container with its first line. |
| Two cursors during a played film | Move your cursor out of the view while the film inside plays. |
| Zoomed type is cut off | Frame the sentence, not the middle of a full-width banner. Shrink Japanese lines if that locale was requested. |
| A scene has `?? { x: ... }` or other guessed coordinates | Delete the fallback; fix the `data-anchor` so it is measured. `npm run verify` fails on it. |
| The cursor presses beside the button, or the camera zooms onto empty space | Read the `assertFraming` message; take positions from `boxAt` and the camera from `fit()`. In an iframe, measure before `continueRender`. |
| A click inside an iframe has no effect on the next frames | Each frame is a fresh page. Put the state in the iframe's URL, keyed from the beat sheet. |
| Headline or end-card type sits on the photograph, or a logo is dark on ink | Headlines, name, principles, and end card are on a plain field. Text and marks contrast at least 3:1 with what is behind them (`contrast.py`). |
| The window's top edge shows under the headline | Start it about 1000px below and hidden until it moves (the kit's `rise`). |
| Terminal text is still scrolling while the camera holds it | Stop the scroll before the camera lands; `assertFraming` reports the movement. |
| Long terminal lines run past the right edge of a zoomed view | Frame lines whole with `fitLeft`, or wrap or shorten the capture (`… N more`). |
| The product's own demo banner or step summary appears | Hide it with a flag the page reads, or frame around it. It is not part of the product a user sees. |
| Half of a zoomed frame is backdrop below or beside the window | Use `fit()`, which keeps the view inside the window. |
| The same picture for more than 4 seconds | Show the next thing, or mark the hold `playing: true` only if something in it moves by itself. |
| The product's name appears three times in a row (title, logo, end card) | Name once in the name shot and once on the end card. |
| `NOTES.md` says "Stills checked: (pending)" and a delivery exists | The review was skipped. Run verify, read every sheet, write the lines, then render. `npm run render` refuses otherwise. |

A bed around −20 dB mean, peak under 0 dB. The sheet cannot tell you a sound is late. Say so if you did not listen.

## Announcement post

Plain launch voice: what you made, what it does for the reader, the link. Not the film's headlines. Count with the platform's weighting: on X, 280 weighted characters, CJK and emoji count 2, a URL counts 23.

## Timing

60fps, 120 BPM, one beat = 30 frames. Shot lengths are multiples of one beat. The example film was 30fps, so its lengths (hook 120, name 105, product shots 300–330, principles 150, end card 150, 49.5 seconds) are half as many frames as the same seconds at 60fps. Use them as sizes for one shot of each kind; the total is the sum of the shots this product needs.
