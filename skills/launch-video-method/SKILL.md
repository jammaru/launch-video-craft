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
  version: "0.2.0"
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

Collect three inputs: the reference clip, the logo file, and the locales. If any is missing, ask for that one only.

Look for an earlier attempt before creating files: `.gitignore` lines for a video folder, an old mp4, a past conversation. Reuse its decisions or delete it deliberately. Do not build a second project beside a half-finished one.

The video is its own npm package in a gitignored folder. Remotion, React, and fonts never enter the product's dependencies or lockfile.

### 1. Research

**The reference is a timing diagram.** Download it, `ffprobe` it, make contact sheets for the whole clip and a tight strip for one camera move. Watch once for the arc, once for a single zoom. Write:

- Borrow: shot lengths, how a window enters, when the zoom happens and how far, cursor size, headline scale, how the ending breathes.
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

A shape that works when the product has the pieces. A missing piece means skipping the shot:

1. **Hook.** The actors, one line each, then the question they share. Built from the actor list in research. The problem belongs to someone before the brand appears.
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

Execute the shot sentences on the real test host, dev server, or a scripted browser. Save one JSON or HTML snapshot per screen per locale. Assert the outcome the film claims (rejected, then accepted), so a rerun cannot silently keep a failure.

The failures you hit here are research. Wrong id, wrong field shape, wrong locale. Fix the capture, record why in a comment, and rerun. Never patch the JSON by hand. The example records four of these, with that product's field names. The lesson is the class of mistake, not the names.

UI language and content language are separate settings. A translated shell with an untranslated error means only one was set.

### 4. Visual system

**Three layers. Only the outer two are yours.**

- Real: the product surface, through its own renderer and design-system components, fed captured data.
- Rebuilt shell: window chrome, navigation, editor fields around that surface. Match screenshots, use the design system's tokens, the product's icon set, and real translated labels.
- A surface the product lacks: generic and quiet, so attention stays on the captured text inside it.

**Prove the renderer first.** One still of captured data through the real component and the shipped compiled CSS. If it is unstyled, the stylesheet or theme attributes are wrong. No scene until this still is right.

**Portals do not render in frames.** A dialog or toast that portals to `document.body` with `fixed` positioning will not sit in a zoomed window. Read its copy from the capture and draw it in normal flow with the same components and classes.

**Backdrop.** Generate a new photograph of the same kind of place as the reference: wide, low horizon, uncluttered sky where the windows sit, no people, text, or logos. Give it a slow drift. Where the product needs a content image (a featured image, a thumbnail), reuse the backdrop so the film has one world.

**Logo.** The file is one flattened picture, not layers, and not a texture to stamp around.

- Decide the parts by looking: the mark versus the words, and inside the mark only pieces that are already their own shape (a frame, a bar, a badge).
- Measure from pixels: dark-pixel counts per row and column give the bands. Overlay a grid on the mark to read its geometry.
- Cut with masks into transparent layers. Check each layer on a strong color, not on white; white hides fringes.
- Words share one origin and one scale so they keep one baseline. Store the offset as a constant.
- Animate the parts in the name shot. The end card shows it assembled. No other shot carries the logo.

**Type.** Three roles: display for headlines, the product's UI face for the shell, mono for code and JSON. Latin from a webfont with an explicit small subset. Japanese from a system face on the machine; full CJK webfonts stall the render.

### 5. Motion and cut

One component per shot, one composition per shot, plus the full film per locale.

The grammar, borrowed from the reference and applied everywhere:

- The headline plays alone, is read, then leaves. The window rises in after it.
- The camera moves to one thing at a time: the button, the toast, the reason, the result. Zoom in to read, never to decorate.
- The cursor arrives on the beat, presses, and moves on. Its tip is measured onto the control, not guessed.
- Shot lengths are multiples of one beat. Camera moves ease; only single elements spring.

Mount every state you will show and switch with `visibility`, so measurements stay stable. Share timing arrays between the scene and the sound cues so a reveal and its pop cannot drift apart.

### 6. Sound

Synthesize a bed exactly as long as the film plus a few UI effects (click, tick, pop, whoosh, thud, chime). Quieter for hook and end card, a groove under the product shots, half-time under the principles, fade with the picture. Cues live in a table of scene-local frames. Say they are placeholders.

### 7. Review loop

Typecheck, then a half-scale draft. Read contact sheets for empty time and late text. Then full-frame grabs of every click, every zoom, every locale. Half-scale hides a cursor that misses by 20px.

Fix at the source: wrong data at the capture, wrong position at the measurement, text overflow at the headline sizing. Re-render one shot, not the film.

When the user says a shot looks like the reference, delete those graphics and keep the length. When they say something feels odd, remove before adding. Do not fill space with the logo; a shot can be type alone.

### 8. Delivery and report

Full size, h264 and AAC, every captured locale. `ffprobe` the files, check the bed is audible, confirm the folder and mp4s are ignored.

Tell the user, plainly: which parts are real product output, which are rebuilt shell, which are invented surfaces. Which assets were generated. Which font and machine the Japanese depends on. What you did not check (usually: you did not listen to the sound against the picture). How to re-render.

### 9. After the film

The same logo becomes the product's icon (the mark cropped square and padded) and the README header (the lockup). Release the icon through the product's normal versioning.

The announcement post is not the film's script. Write it plainly: "I made X!!", what it does for the reader, the link, one locale's video attached. Count the length with the platform's weighting before handing it over.

## Done when

- [ ] Argument, beat map, and shot sentences were written before any scene
- [ ] Every product number and sentence on screen came from a capture
- [ ] The hero frames are the real component, not a drawing of the reference
- [ ] Nothing was traced from the reference; backdrop and score are new
- [ ] The logo assembles once and appears assembled once on the end card
- [ ] The cursor tip sits on what it clicks, zoomed in as well
- [ ] Zoomed text is inside the frame in every locale
- [ ] No shot is empty for more than about half a second
- [ ] The ending fades out, and the audio fades with it
- [ ] The report separates real, rebuilt, invented, and unchecked
