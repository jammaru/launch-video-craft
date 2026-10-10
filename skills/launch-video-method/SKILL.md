---
name: launch-video-method
description: >-
  Makes a product launch motion-graphics video in Remotion. Covers how to
  research a reference clip, how to build the story from what the product
  actually does, how to split a supplied logo into moving parts, and how to
  render real UI with the product's own components and CSS. Use when the user
  asks for a launch video, promo, motion graphics, Remotion video, ローンチ動画,
  or モーショングラフィック, including a localized second cut.
license: MIT
compatibility: ffmpeg, python3, and Node. The Remotion project stays outside the product lockfile.
metadata:
  version: "0.7.0"
---

# Launch videos in Remotion

The method for a short film (1920×1080, 30fps, as long as this product needs: usually 20–60 seconds) that borrows the shape of a reference clip and shows the real product. Follow the phases in order. Commands and starting numbers are in [reference.md](reference.md). Two finished films are evidence, not scripts: [example.md](example.md) for a product with screens (capture failures, the logo split, a shot whose graphics were removed twice), and [example-cli.md](example-cli.md) for a product with no UI, where the agent does the work on screen. Read the one closer to your product after the phases. [example-failures.md](example-failures.md) is a film that went wrong, measured frame by frame: clicks beside their buttons, unreadable type on the photograph, a camera on empty space, and a review that never happened. Read it before phase 5.

Start the project from [kit/](kit/), not from an empty folder. It already has the stage, camera, cursor, headline, measurement, beat sheets, the framing check, the verify and render gate, terminal, agent chat with tool cards, player, capture helpers, and sound. The steps are in [Starting from the kit](#starting-from-the-kit). Rewriting those parts by hand is where films drift.

## Why this shape

A reference clip is someone else's product. Tracing its graphics makes the film look like that product. Drawing the UI by hand makes it look unlike the thing being launched. So split the job:

- From the reference: the shape of the story (what each scene is for, and in what order), and its film grammar (how windows enter, when the camera zooms, a cursor that presses). Not its length, not its shot count, not its content.
- From the product: every screen, number, and sentence, drawn by the product's own renderer.
- New: the backdrop photograph, the music, and the logo animation. Nothing is lifted from the reference.

## Phases

Work in this order. Each phase writes something down before the next starts.

```
- [ ] 0. Inputs and prior work
- [ ] 1. Research: the reference, then the product
- [ ] 2. Story: argument, actors, shot sentences, copy
- [ ] 3. Capture: run the story on the real product
- [ ] 4. Visual system: renderer, shell, backdrop, logo, type
- [ ] 5. Motion and cut
- [ ] 6. Sound
- [ ] 7. Review loop
- [ ] 8. Delivery and report
- [ ] 9. After the film: icon, README, announcement
```

### 0. Inputs and prior work

Collect the reference clip and the logo file. If either is missing, ask for that one only.

Language defaults to English. Render one film, in English. Do not ask which language. Do not translate because the request was written in Japanese. Another language is a second cut, and only when the user names it.

Look for an earlier attempt before creating files: an existing `video/` folder, an old mp4, a past conversation. Reuse its decisions or delete it deliberately. Do not build a second project beside a half-finished one.

**Where files go, and git.** The film is its own npm package at `video/<name>/`. If the product is not the repository you are in, clone it to `.product/<name>/`. Keep both out of git without changing a tracked file: append `video/` and `.product/` to `.git/info/exclude` unless the repository already ignores them. Do not edit `.gitignore`, do not commit, do not push, and do not open a pull request for film work unless the user asks. A test run in a cloud agent should leave the repository's diff empty. Remotion, React, and fonts never enter the product's dependencies or lockfile.

**The user's request outranks this file.** If the user names an order ("logo first"), a payoff ("show the finished app"), a length, or a scene, that is the plan. The shape in phase 2 fills only what the user left open. Write the user's requests as the first lines of the notes and check them off in review.

### Starting from the kit

Do these in order. Each line ends with a check that must pass before the next.

1. `cp -R <skill>/kit video/<name>` and `npm install` inside it. The folder is ignored by git (see above).
2. `npm run sync`: copies `assertBeats` from this skill's reference.md into `src/lib/beats.ts`. Set `SKILL_DIR` if it cannot find the skill. Check: the file exists.
3. Fill `NOTES.md` through phase 2 before touching a scene. Check: every section up to Shots has content.
4. Replace `capture/capture.mjs` with the product's real commands (phase 3). `npm run capture`. Check: it exits 0 and each claim is asserted.
5. Put the backdrop at `public/backdrop.jpg` (phase 4), the logo layers in `public/logo/`, and `npm run audio`.
6. One shot at a time: fill its row in NOTES.md "What each shot shows" (the one thing, its `data-anchor`, the gesture), copy the closer demo (`Command` for a person typing, `Agent` for an agent working), write its `beats.ts` with `target` and `resultTarget`, then the scene. Register it in `src/Film.tsx` and `src/scenes/durations.json`. Delete the demos when your shots exist.
7. `npm run typecheck`, then `npm run verify`. It renders the press, result, and hold of every action with the anchors outlined and the cursor tip marked, and fails on a guessed coordinate, a broken beat sheet, a miss in space, or unreadable type. Check: it prints "Machine checks passed". Retime or re-anchor; do not loosen a check.
8. Open every `review/<Shot>-sheet.png`, write what each shows under "Stills checked" in NOTES.md, then the rest of phase 7. `npm run render` refuses until verify is clean, newer than every source file, and each shot has its line.
9. `npm run render`. It renders, then inspects the finished mp4 (`review/film-sheet.png`). Open the sheet, write "Film checked" in NOTES.md (one line for the backdrop, one per shot), and `npm run finish`. Check: it prints "Finished". Only then report to the user.

Run `npm run verify` again after every change, however small. A film is verified when the last verify came after the last edit; a verify from before the fix proves nothing about the fix.

### 1. Research

**The reference is a guide, not a template.** Download it, make contact sheets for the whole clip and a tight strip for one camera move. Watch once for the arc, once for a single zoom. Then write, before anything else:

- What it is: one paragraph on what the film does and why it works. Which moment carries it (the first zoom onto the thing working, the payoff, the name landing), and what the viewer understands by the end.
- Its scenes as roles: one row per scene, saying what the scene is for ("states the problem", "shows the main gesture", "shows a second way in", "names the product"), not what is drawn in it.
- How this product fits: for each role, what in this product plays it, or "drop" when nothing honestly does. Then the roles this product needs that the reference does not have (a second proof, a terminal check, the payoff file). The product's nature decides the film: a CLI earns a terminal and an agent, a visual app earns its screens, a library earns the call and its result. Change the reference's shape wherever this product works differently, and say why in a line.
- Borrow, with measurements, not adjectives: how many shots change field (photo, white, black), what fraction of the frame the window fills, how a window enters, when the zoom happens and how far, cursor size relative to a button, headline scale, how the ending breathes. A beat map of labels without these sizes is not research. The film that worked used a window of 1620×930 on a 1920×1080 stage. A window near 1040×640 leaves the photograph as the subject. That is a failed frame.
- Do not draw: that brand's icons, illustrations, color shapes, layout gags. Name the ones you can point at in a frame. "Don't copy the vibe" is not a list.
- Beat map: each reference beat, and what in this product plays the same role. A chat with an AI becomes this product's agent or API surface. Their logo lockup becomes this product's end card. A beat with no honest equivalent is dropped, not faked.

**The product is the only source of claims.** Read, in this order:

1. The screens a person actually opens, from source and from screenshots.
2. The action the product takes, and the control that changes how it acts.
3. Every actor that can trigger that action (a person, an API, an agent, a schedule). Keep only actors the product really handles.
4. The constraints it is built around. They become one-line principles later.
5. How the UI is rendered: which component draws it, which compiled CSS styles it, which icon set and fonts it uses, and where its translations live.

**When the product has no screen** (a CLI, a library, an API, an agent skill), the output of running it is its real screen. The terminal that runs the command and the agent chat that calls it are the shells; the bytes inside them are captured. Find, from the README and the source: the one command a person types to get it, the one prompt a person gives an agent, every command or tool the agent runs because of it, and the file or result a user leaves with. Those are the shots.

### 2. Story

Write the argument: one true sentence you can demonstrate. "The same rules check every publish, no matter who starts it, and they can stop it." A shot that does not prove part of it does not belong.

Then one sentence per shot, each naming a behavior you will run. Give each shot the time its one proof needs to be seen and read. Delete a sentence before you speed one up.

**Length comes from the product.** Add up the shots this product needs: a product shot is usually 7–11 seconds (headline, window, one or two actions, the hold on the proof), a name or end card 3–5, an opening 3–5, principles one second a line. Three proofs make a film of about 35–45 seconds; one proof, about 20–25. Do not stretch a film to match the reference's length, and do not cut a proof the product needs to match it. If the total runs past about 60 seconds, drop the weakest proof. The user's named length outranks this. Write the total and why each shot is there in NOTES.md.

**Each product shot's headline names its first visible action.** "Place the parts." is followed, within 3 seconds, by a part landing on the screen, zoomed. A headline that describes something the viewer sees 5 seconds later reads as a caption for the wrong picture. If a shot needs two ideas, it is two shots or one headline.

**Decide what each shot shows, as one element.** For every product shot write, in NOTES.md, the single smallest thing on screen that proves its headline: the rejected row, the toast with the reason, the `FAIL` line, the card that says "unsupported". Then where it is (its `data-anchor`), and the gesture that causes it. The camera's last hold frames that element at a readable size; a hold on the whole window, on a container, or on an empty half of it shows nothing in particular. If you cannot name the element, the shot has no proof yet. A result that the product prints elsewhere first (a summary banner, a log line above the fold) gives the shot away: hide it or frame around it.

**Show the gesture the product uses.** If parts are dragged, the cursor drags one from the palette to the screen and it lands. If a value is typed, it is typed. Clicking a palette tile and having the part appear elsewhere is not how the product works.

**Each actor does only what it does.** A person types what a person types; an agent does the rest. For a tool used through an agent, the person types the install command and one prompt. Everything after Send is the agent's: which skill or tool it picked up, what it read, what it ran and what that printed, what it changed, and what it ran again. Those steps are tool cards with captured output, with no cursor and no typing. A film where the person types the agent's commands into a terminal shows a product the viewer will not use.

**The payoff.** End the product shots on the thing a user leaves with: the finished app running, the published post, the generated file. If the user named it, it is a shot of its own before the principles.

A shape that works when the product has the pieces and the user did not name an order. It is a starting point to bend to the product and to the reference's roles, not a checklist: a missing piece means skipping the shot, and a product that needs a different order gets it:

1. **Opening.** Open the way the reference opens. If the reference opens on its logo, open on the logo. If it opens on a problem, use the actors, one line each, then the question they share.
2. **Name.** The logo assembles, then the tagline. Once.
3. **Proof.** The main surface doing the job, failure first, then the reason on screen.
4. **Second actor.** The same rule hit from another surface. If that surface has no real UI, a plain chat is fine; the tool name, arguments, and result inside it are captured.
5. **Control.** The setting a person turns, so a mode change is a decision.
6. **Principles.** The constraints, one short line each, type alone, after the proof.
7. **End card.** The name again and where to get it.

Order is the argument. Principles after the proof are a conclusion. Before it, they are an advertisement.

The example's question, backdrop, and failure shape are that product's. Write this product's. A film that reuses them has not followed the method.

Put every line of film copy (headlines, chat prompts, toast titles the product does not return) in one copy file keyed by locale. Product labels come from the product's real translations, not from you.

### 3. Capture

Execute the shot sentences on the real test host, dev server, or a scripted browser. Save one JSON or HTML snapshot per screen per locale. Assert the outcome the film claims (rejected, then accepted), so a rerun cannot silently keep a failure. The video package does not own that runner. A config next to the capture points its root at the product, and the script invokes the product's package manager. The harness from this film is in [example.md](example.md).

For a product with no screen, the capture is the film's text. Run the commands in a scratch project under `video/<name>/.scratch/` with HOME pointed there, so paths print as `~/my-product` and no personal path reaches the film. Strip color codes and keep each spinner's last frame. To show a rejection, run the real command and assert it fails; run the fix and assert it passes. A composition meant to fail is registered with `lazyComponent`. `kit/capture/lib.mjs` has these helpers; the reasons are in [reference.md](reference.md#capturing-a-product-with-no-ui).

The failures you hit here are research. Wrong id, wrong field shape, wrong locale. Fix the capture, record why in a comment, and rerun. Never patch the JSON by hand. The example records four of these, with that product's field names. The lesson is the class of mistake, not the names.

UI language and content language are separate settings. A translated shell with an untranslated error means only one was set.

### 4. Visual system

**Three layers. Only the outer two are yours.**

- Real: the product surface, through its own renderer and design-system components, fed captured data.
- Rebuilt shell: window chrome, navigation, editor fields around that surface. Match screenshots, use the design system's tokens, the product's icon set, and real translated labels.
- A surface the product lacks: generic and quiet, so attention stays on the captured text inside it.

**Prove the renderer first.** One still of captured data through the real component and the shipped compiled CSS. If it is unstyled, the stylesheet or theme attributes are wrong. No scene until this still is right. If the component will not import, fix the import. Copying `docs/*.png` into an `<Img>` is a failed proof: the zoom goes soft, and nothing on it can be measured or clicked. Do not continue the film on screenshots.

**Render the product in the film's DOM, not in an iframe.** Each frame renders in a fresh page, so a click sent into an iframe does not persist, and anchors measured after `continueRender` arrive too late for some frames. If an iframe is the only way, follow [reference.md](reference.md#click-targets): measure before `continueRender`, put state in the URL, hide the product's demo chrome.

**Portals do not render in frames.** A dialog or toast that portals to `document.body` with `fixed` positioning will not sit in a zoomed window. Read its copy from the capture and draw it in normal flow with the same components and classes.

**Backdrop.** Generate a new photograph of a natural place: wide, low horizon, uncluttered sky where the windows sit, no people, text, or logos. Give it a slow drift. The prompt describes only the place and the light. It never contains the product's name, "launch", "video", "app", "AI", "code", "tech", or any word you would not want painted into the sky: image models write the words of their prompt onto signs, clouds, and screens. A prompt like "backdrop photograph for <product> launch video" produces a picture with the product's name in it. Open the result at full size before using it and look for letters, signs, logos, screens, and people; `npm run verify` also reads it with tesseract when installed. If there is anything, generate again with a plainer prompt. Where the product needs a content image, reuse that photograph so the film has one world.

The photograph is the world behind the product windows only. The hook, every headline, the logo, the principles, and the end card sit on a plain field, paper or ink; the kit's `Headline` draws its own field. Type over a photograph is unreadable somewhere on the line, however it looks in one still: one film's headline measured 1.13:1 against the sky on its left half. Text and marks keep 3:1 or more against what is behind them, which `npm run verify` checks; a dark logo on an ink end card fails it. A film that leaves the photograph behind every shot has no contrast. Do not generate the example's place. Green hills and wildflowers are already used.

**Logo.** The file is one flattened picture, not layers, and not a texture to stamp around.

- Decide the parts by looking: the mark versus the words, and inside the mark only pieces that are already their own shape (a frame, a bar, a badge).
- Measure from pixels: dark-pixel counts per row and column give the bands. Overlay a grid on the mark to read its geometry.
- Cut with masks into transparent layers. Check each layer on a strong color, not on white; white hides fringes.
- Words share one origin and one scale so they keep one baseline. Store the offset as a constant.
- Animate the parts in the name shot. The end card shows it assembled. No other shot carries the logo.

**Type.** Three roles: display for headlines, the product's UI face for the shell, mono for code and JSON. Latin from a webfont with an explicit small subset. Japanese from a system face on the machine; full CJK webfonts stall the render.

### 5. Motion and cut

One component per shot, one composition per shot, plus the full film per locale.

The grammar, borrowed from the reference and applied everywhere. If the reference's contact sheet shows a zoom, this film has a zoom. If it shows a cursor, this film has a cursor. A product shot that stays at scale 1 did not use the reference.

- On a 1920×1080 stage the window at rest is 1620×930, placed near (150, 96). A side gap wider than about 200px means the window is too small. Enlarge it before animating anything. The surface being demonstrated fills that window. A phone or card floating in empty padding is the same failure, one level down.
- **Write the beat sheet before the scene.** Every product shot gets a `beats.ts` with the frames of: headline in, headline out, window in, window landed, and each action (camera arrives, cursor arrives, press, result appears, result held until). The scene, the cursor, the camera, and the sound cues all import these numbers; none of them types its own. Run `assertBeats` from [reference.md](reference.md) on it at module load, so a broken sheet fails the render instead of shipping. The numbers below are the example film's, measured in its source.
- The headline plays alone on a quiet field for at least 30 frames, and at least until its last word has finished rising (3 frames per word plus 16), then exits over 14 frames. The window starts rising only when the headline starts leaving, never while it is being read. A window rising under a headline splits the eye, and the text reads as late.
- The window rises in from below with a quick spring (stiffness about 170, damping about 16, mass 0.9) and lands within about 30 frames. A soft spring (stiffness 70) is still drifting 2 seconds later, under the first clicks.
- The camera stays at scale 1 until the window has landed (about frame 70; the whole window has been visible while it rose). Then it travels about 40 frames to the first control.
- No press happens while the window is still moving or while the camera is below scale 1.4; a small control wants 1.8 or more. The order of one action is: camera arrives on the control, cursor arrives within a few frames, press 4–8 frames after the cursor (the camera has been there at least 2 frames), result appears 4–8 frames after the press, camera moves to the result within about 20–50 frames and holds it 25 frames or more. Pressing at scale 1 and zooming onto the aftermath shows a result whose cause was never visible.
- An agent's step is a read-only beat: `camera`, `result`, `resultCamera`, `holdUntil`, `scale`, and no `cursor` or `press`. While the agent works and while a result is read, the cursor leaves the view.
- The first action that proves the headline lands within 90 frames of the headline leaving. If the headline names a later action, mark that action `proves: true`; `assertBeats` checks the 90 frames against it. In the example: headline 2→36, window 40→~70, camera on Publish at 112, press 118, toast 126, toast held 168→214.
- Presses are at least 30 frames apart. Five clicks 16 frames apart read as one flicker. If the product repeats a gesture, show the first one zoomed and slow, then let the rest go by in one wide move.
- Each product shot has at least two keyframes at scale 1.6 or more. The sentence the viewer must read reaches scale 1.9 or more. Zoom to read, never to decorate. While zoomed, the photograph is mostly out of frame.
- The cursor glyph is about 44×50px, and it is a child of the camera so a zoom carries it. It arrives on the beat, presses, and moves on. Its tip comes from measuring the control after fonts load: `pointIn(boxAt("send"))`. A scene file with hand-written `{ x, y }`, or a fallback like `?? { x: 1200, y: 800 }`, did not measure anything; the click lands where the guess was.
- **Place the camera from measurements.** Every camera keyframe after the establishing view is `fit(box)` or `fitLeft(box)` of a measured anchor (or a `union` of two). `fit` keeps a zoomed view inside the window, so the frame is the product and not the backdrop. `assertFraming` runs beside `assertBeats` and checks, in space: the cursor tip is on the target at the press, the target is in view, the result is whole, readable (35% of the view or more), not scrolling, and not under the cursor. Its errors print coordinates; fix the numbers it names.
- A terminal or log stops scrolling before the camera lands on it. A line the camera reads is framed whole; a line wider than the view is shortened in the capture (`… N more`) or framed by its left edge.
- No picture is held unchanged for more than 4 seconds unless something in it moves by itself (`playing: true`).
- Shot lengths are multiples of one beat. Camera moves ease; only single elements spring.

Mount every state you will show and switch with `visibility`, so measurements stay stable. Share timing arrays between the scene and the sound cues so a reveal and its pop cannot drift apart.

### 6. Sound

Synthesize a bed exactly as long as the film plus a few UI effects (click, tick, pop, whoosh, thud, chime). Quieter for hook and end card, a groove under the product shots, half-time under the principles, fade with the picture. Cues live in a table of scene-local frames. Say they are placeholders.

### 7. Review loop

Do not show the user a film you have not rejected on a contact sheet. Verification is not optional and not a final step: `npm run verify` runs after every edit, and `npm run render` will not run past a stale or failing one. The machine checks catch coordinates; your eyes catch a frame that passes them and is still wrong. Both are required. A weak film that shipped looked like this: the copy followed the chat's language, the window was a small card in the middle of the photograph, the camera never zoomed, there was no cursor, and the same photograph sat behind the hook, the product, and the logo. The sheet is how you see that before the user does.

1. `npm run verify`. Open every `review/<Shot>-sheet.png` and, for an action, its full-size `review/<Shot>/<frame>-press.png`. On each press still the blue cross is inside the red box of the target. On each result still the red box of the result is whole, large, and the cursor is elsewhere. On each headline still the type sits on a plain field. Write one line per shot under "Stills checked" that says what you saw, with frames. "(pending)" there means the review did not happen.
2. Full-size still of the first product shot, at the frame where the window has landed and the camera is still at scale 1. Open that PNG before any full-film render.
3. Reject the still, fix that scene, and run verify again while any of these are true. Do not start the film render during a reject.
   - The window is under about 1500×800, or sky surrounds it.
   - The surface inside it is a PNG. Put the component back.
   - The cursor's coordinates are literals in the scene, or the cursor is not a child of the camera.
   - The copy is Japanese and the user did not ask for Japanese.
   - `assertBeats` is missing from the shot, or the scene has frame numbers that are not in its `beats.ts`.
   - Terminal or tool-card text was typed into the scene instead of read from a capture file.
   - The person presses or types after sending the agent its prompt.
   - A scene uses a fallback coordinate, or a camera keyframe that is not `fit`/`fitLeft` of a measured box.
   - The cross is outside the target's box on a press still, or the result's box is cut, tiny, or under the cursor.
   - A headline, the name, or the end card has the photograph behind its type, or the product's demo banner is in frame.
4. Full-size still of one zoomed click in that same shot. The control is sharp, because it is the component, and the cursor tip is on it. A soft zoom means the surface is still a bitmap.
5. Only after those stills pass: typecheck, render the whole film at half scale, and make a 1 fps contact sheet. The commands and the rest of the reject list are in [reference.md](reference.md).
6. Sync check, per product shot: a 4 fps strip from headline out to the first result. Read it as a sentence: headline, window landing, camera arriving, press, result. If the frame after the headline does not show what the headline said, or the press happens in a wide frame, the shot fails.
7. Write each problem you saw as a line in the notes, then fix it before rendering anything else. Noticing a blank frame and rendering the delivery anyway is the failure this step exists for. Any hit is a repair of that shot, then a new sheet of that shot. A sheet made after the delivery file was copied out is not a review.
8. Check the user's requests from phase 0, one by one, against the sheet: the order they asked for, the payoff they asked for, the language.
9. Then `npm run render`. If it refuses, do what it says; do not call `remotion render` directly to get around it.

When the user says a shot looks like the reference, delete those graphics and keep the length. When they say something feels odd, remove before adding. Do not fill space with the logo; a shot can be type alone.

### 8. Delivery and report

Full size, h264 and AAC, English unless the user named another locale. `npm run render` renders and then runs `npm run inspect` on the finished mp4: five stills per shot taken from the file itself (start, quarter, half, three quarters, end) in `review/film-sheet.png`, and failures for black stretches, a frozen picture over 4 seconds, a length that does not match the shots, and missing or silent audio. A film that passed verify can still come out wrong: a font that did not load, an asset missing, a cut that lands on black.

Open `review/film-sheet.png` and the full-size stills of anything that looks off. Look for: a blank or half-built frame, type over the photograph or cut by the frame, a cursor away from what it presses, a camera on empty space, writing in the backdrop, a demo banner, the same picture too long. Write one line per shot, and one for the backdrop, under "Film checked" in NOTES.md. Fix and render again if anything is wrong. `npm run finish` passes only when the last inspect is newer than the mp4, has no failures, and each line is written. Do not tell the user the film is done before it passes, whichever model you are.

Run `git status --short`: it shows nothing from the film. Leave the mp4 where it is and tell the user the path. Do not commit it or open a pull request.

Tell the user, plainly: which parts are real product output, which are rebuilt shell, which are invented surfaces. Which assets were generated. Which font and machine the Japanese depends on. What you did not check (usually: you did not listen to the sound against the picture). How to re-render.

### 9. After the film

The same logo becomes the product's icon (the mark cropped square and padded) and the README header (the lockup). Release the icon through the product's normal versioning.

The announcement post is not the film's script. Write it plainly: "I made X!!", what it does for the reader, the link, one locale's video attached. Count the length with the platform's weighting before handing it over.

## Done when

- [ ] The user's named order, payoff, length, and language were written first and are all in the film
- [ ] Argument, beat map, and shot sentences were written before any scene
- [ ] NOTES.md says what the reference is, its scenes as roles, and how this product fits them; the length is the sum of the shots this product needs, not the reference's or the example's
- [ ] The backdrop prompt named only a place, and the backdrop has no writing, signs, logos, or people
- [ ] `npm run finish` passed after the last render: the finished film was inspected and every shot looked at
- [ ] Every product number and sentence on screen came from a capture
- [ ] The hero frames are the real component, not a screenshot pasted into the window
- [ ] At rest the window is about 1620×930 and the demonstrated UI fills it
- [ ] The photograph sits behind product windows only; opening, logo, principles, and end card are flat fields
- [ ] The only language is English, unless the user named another
- [ ] The project started from `kit/`, and `src/lib/beats.ts` came from `npm run sync`
- [ ] Every product shot has a `beats.ts` checked by `assertBeats`, and the scene uses only its numbers
- [ ] Each headline is gone before its window rises, and its first action is visible within 90 frames
- [ ] Every press happens on a settled window at scale 1.4 or more, with the camera and cursor already there
- [ ] Each product shot names its one proving element and `data-anchor` in NOTES.md, and its beats carry `target` and `resultTarget`
- [ ] Every cursor and camera position comes from a measured anchor (`pointIn`, `fit`, `fitLeft`); no fallback coordinates; `assertFraming` runs in every product shot
- [ ] The last `npm run verify` came after the last edit and passed, and "Stills checked" has a written line per shot
- [ ] Every headline, the name, and the end card are on a plain field; the logo and type contrast 3:1 or more
- [ ] The product's own gesture is shown (drag is dragged)
- [ ] With no UI: terminal and tool-card text is captured output; the person types only what a person types, and the agent's steps have no cursor
- [ ] A line to be read reaches scale 1.9, and zoomed text is inside the frame
- [ ] Nothing was traced from the reference; backdrop and score are new
- [ ] The logo assembles once and appears assembled once on the end card
- [ ] Full-size stills and the contact sheet were rejected and repaired before the delivery render
- [ ] No shot is empty for more than about half a second
- [ ] The ending fades out, and the audio fades with it
- [ ] `git status --short` shows nothing from the film; nothing was committed or pushed
- [ ] The report separates real, rebuilt, invented, and unchecked
