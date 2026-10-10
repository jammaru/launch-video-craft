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
  version: "0.4.0"
---

# Launch videos in Remotion

The method for a short film (about 45–60 seconds, 1920×1080, 30fps) that feels like a reference clip and shows the real product. Follow the phases in order. Commands and starting numbers are in [reference.md](reference.md). One finished film, including the capture failures, the logo split, and the review that removed a shot's graphics twice, is in [example.md](example.md). Read the example after the phases. It is evidence. It is not the next film's script.

## Why this shape

A reference clip is someone else's product. Tracing its graphics makes the film look like that product. Drawing the UI by hand makes it look unlike the thing being launched. So split the job:

- From the reference: pacing, camera, cursor, and the kind of place the windows sit in.
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

### 1. Research

**The reference is a timing diagram.** Download it, `ffprobe` it, make contact sheets for the whole clip and a tight strip for one camera move. Watch once for the arc, once for a single zoom. Write:

- Borrow, with measurements, not adjectives: how many shots change field (photo, white, black), what fraction of the frame the window fills, how a window enters, when the zoom happens and how far, cursor size relative to a button, headline scale, how the ending breathes. A beat map of labels without these sizes is not research. The film that worked used a window of 1620×930 on a 1920×1080 stage. A window near 1040×640 leaves the photograph as the subject. That is a failed frame.
- Do not draw: that brand's icons, illustrations, color shapes, layout gags. Name the ones you can point at in a frame. "Don't copy the vibe" is not a list.
- Beat map: each reference beat, and what in this product plays the same role. A chat with an AI becomes this product's agent or API surface. Their logo lockup becomes this product's end card. A beat with no honest equivalent is dropped, not faked.

**The product is the only source of claims.** Read, in this order:

1. The screens a person actually opens, from source and from screenshots.
2. The action the product takes, and the control that changes how it acts.
3. Every actor that can trigger that action (a person, an API, an agent, a schedule). Keep only actors the product really handles.
4. The constraints it is built around. They become one-line principles later.
5. How the UI is rendered: which component draws it, which compiled CSS styles it, which icon set and fonts it uses, and where its translations live.

### 2. Story

Write the argument: one true sentence you can demonstrate. "The same rules check every publish, no matter who starts it, and they can stop it." A shot that does not prove part of it does not belong.

Then one sentence per shot, each naming a behavior you will run. Fit them into the reference's number of breaths. Delete a sentence before you speed one up.

**Length comes from the reference.** Count the reference's seconds and its shots. The film is that length within about ±30%, with about that many shots, unless the user asks otherwise. The example film's 1485 frames and seven shots are not a default. A 29-second reference makes a film of about 25–38 seconds.

**Each product shot's headline names its first visible action.** "Place the parts." is followed, within 3 seconds, by a part landing on the screen, zoomed. A headline that describes something the viewer sees 5 seconds later reads as a caption for the wrong picture. If a shot needs two ideas, it is two shots or one headline.

**Show the gesture the product uses.** If parts are dragged, the cursor drags one from the palette to the screen and it lands. If a value is typed, it is typed. Clicking a palette tile and having the part appear elsewhere is not how the product works.

**The payoff.** End the product shots on the thing a user leaves with: the finished app running, the published post, the generated file. If the user named it, it is a shot of its own before the principles.

A shape that works when the product has the pieces and the user did not name an order. A missing piece means skipping the shot:

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

The failures you hit here are research. Wrong id, wrong field shape, wrong locale. Fix the capture, record why in a comment, and rerun. Never patch the JSON by hand. The example records four of these, with that product's field names. The lesson is the class of mistake, not the names.

UI language and content language are separate settings. A translated shell with an untranslated error means only one was set.

### 4. Visual system

**Three layers. Only the outer two are yours.**

- Real: the product surface, through its own renderer and design-system components, fed captured data.
- Rebuilt shell: window chrome, navigation, editor fields around that surface. Match screenshots, use the design system's tokens, the product's icon set, and real translated labels.
- A surface the product lacks: generic and quiet, so attention stays on the captured text inside it.

**Prove the renderer first.** One still of captured data through the real component and the shipped compiled CSS. If it is unstyled, the stylesheet or theme attributes are wrong. No scene until this still is right. If the component will not import, fix the import. Copying `docs/*.png` into an `<Img>` is a failed proof: the zoom goes soft, and nothing on it can be measured or clicked. Do not continue the film on screenshots.

**Portals do not render in frames.** A dialog or toast that portals to `document.body` with `fixed` positioning will not sit in a zoomed window. Read its copy from the capture and draw it in normal flow with the same components and classes.

**Backdrop.** Generate a new photograph of the same kind of place as the reference: wide, low horizon, uncluttered sky where the windows sit, no people, text, or logos. Give it a slow drift. Where the product needs a content image, reuse that photograph so the film has one world.

The photograph is the world behind the product windows only. The hook, the logo, the principles, and the end card sit on a plain field, paper or ink. A film that leaves the photograph behind every shot has no contrast. Do not generate the example's place. Green hills and wildflowers are already used.

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
- The first action that proves the headline lands within 90 frames of the headline leaving. In the example: headline 2→36, window 40→~70, camera on Publish at 112, press 118, toast 126, toast held 168→214.
- Presses are at least 30 frames apart. Five clicks 16 frames apart read as one flicker. If the product repeats a gesture, show the first one zoomed and slow, then let the rest go by in one wide move.
- Each product shot has at least two keyframes at scale 1.6 or more. The sentence the viewer must read reaches scale 1.9 or more. Zoom to read, never to decorate. While zoomed, the photograph is mostly out of frame.
- The cursor glyph is about 44×50px, and it is a child of the camera so a zoom carries it. It arrives on the beat, presses, and moves on. Its tip comes from measuring the control after fonts load. A scene file with hand-written `{ x, y }` did not measure anything.
- Shot lengths are multiples of one beat. Camera moves ease; only single elements spring.

Mount every state you will show and switch with `visibility`, so measurements stay stable. Share timing arrays between the scene and the sound cues so a reveal and its pop cannot drift apart.

### 6. Sound

Synthesize a bed exactly as long as the film plus a few UI effects (click, tick, pop, whoosh, thud, chime). Quieter for hook and end card, a groove under the product shots, half-time under the principles, fade with the picture. Cues live in a table of scene-local frames. Say they are placeholders.

### 7. Review loop

Do not show the user a film you have not rejected on a contact sheet. A weak film that shipped looked like this: the copy followed the chat's language, the window was a small card in the middle of the photograph, the camera never zoomed, there was no cursor, and the same photograph sat behind the hook, the product, and the logo. The sheet is how you see that before the user does.

1. Full-size still of the first product shot, at the frame where the window has landed and the camera is still at scale 1. Open that PNG before any full-film render.
2. Reject the still, fix that scene, and render the still again while any of these are true. Do not start the film render during a reject.
   - The window is under about 1500×800, or sky surrounds it.
   - The surface inside it is a PNG. Put the component back.
   - The cursor's coordinates are literals in the scene, or the cursor is not a child of the camera.
   - The copy is Japanese and the user did not ask for Japanese.
   - `assertBeats` is missing from the shot, or the scene has frame numbers that are not in its `beats.ts`.
3. Full-size still of one zoomed click in that same shot. The control is sharp, because it is the component, and the cursor tip is on it. A soft zoom means the surface is still a bitmap.
4. Only after those two stills pass: typecheck, render the whole film at half scale, and make a 1 fps contact sheet. The commands and the rest of the reject list are in [reference.md](reference.md).
5. Sync check, per product shot: a 4 fps strip from headline out to the first result. Read it as a sentence: headline, window landing, camera arriving, press, result. If the frame after the headline does not show what the headline said, or the press happens in a wide frame, the shot fails.
6. Write each problem you saw as a line in the notes, then fix it before rendering anything else. Noticing a blank frame and rendering the delivery anyway is the failure this step exists for. Any hit is a repair of that shot, then a new sheet of that shot. A sheet made after the delivery file was copied out is not a review.
7. Check the user's requests from phase 0, one by one, against the sheet: the order they asked for, the payoff they asked for, the language.
8. Then render the full-size delivery.

When the user says a shot looks like the reference, delete those graphics and keep the length. When they say something feels odd, remove before adding. Do not fill space with the logo; a shot can be type alone.

### 8. Delivery and report

Full size, h264 and AAC, English unless the user named another locale. `ffprobe` the files, check the bed is audible, and run `git status --short`: it shows nothing from the film. Leave the mp4 where it is and tell the user the path. Do not commit it or open a pull request.

Tell the user, plainly: which parts are real product output, which are rebuilt shell, which are invented surfaces. Which assets were generated. Which font and machine the Japanese depends on. What you did not check (usually: you did not listen to the sound against the picture). How to re-render.

### 9. After the film

The same logo becomes the product's icon (the mark cropped square and padded) and the README header (the lockup). Release the icon through the product's normal versioning.

The announcement post is not the film's script. Write it plainly: "I made X!!", what it does for the reader, the link, one locale's video attached. Count the length with the platform's weighting before handing it over.

## Done when

- [ ] The user's named order, payoff, length, and language were written first and are all in the film
- [ ] Argument, beat map, and shot sentences were written before any scene
- [ ] The film's length and shot count follow the reference, not the example
- [ ] Every product number and sentence on screen came from a capture
- [ ] The hero frames are the real component, not a screenshot pasted into the window
- [ ] At rest the window is about 1620×930 and the demonstrated UI fills it
- [ ] The photograph sits behind product windows only; opening, logo, principles, and end card are flat fields
- [ ] The only language is English, unless the user named another
- [ ] Every product shot has a `beats.ts` checked by `assertBeats`, and the scene uses only its numbers
- [ ] Each headline is gone before its window rises, and its first action is visible within 90 frames
- [ ] Every press happens on a settled window at scale 1.4 or more, with the camera and cursor already there
- [ ] The product's own gesture is shown (drag is dragged)
- [ ] A line to be read reaches scale 1.9, and zoomed text is inside the frame
- [ ] Nothing was traced from the reference; backdrop and score are new
- [ ] The logo assembles once and appears assembled once on the end card
- [ ] Full-size stills and the contact sheet were rejected and repaired before the delivery render
- [ ] No shot is empty for more than about half a second
- [ ] The ending fades out, and the audio fades with it
- [ ] `git status --short` shows nothing from the film; nothing was committed or pushed
- [ ] The report separates real, rebuilt, invented, and unchecked
