# Worked example: one finished film

This is the EmDash Preflight launch film. Read it after [SKILL.md](SKILL.md). It shows what the decisions look like once a film exists.

Copy the decisions. Do not copy the film.

Do not reuse, on another product:

- The question "Who checks first?"
- The meadow backdrop
- The capture API, field names, dialog classes, or tool name below

Those belong to this product. Write new ones from the product in front of you.

## Decisions this film is evidence for

- The reference was a timing diagram. Windows on a landscape, a large cursor, and zooms were borrowed. The black field of colored circles, corner squares, dashed frames, and capsules was named and not drawn.
- The first replacement for that field was the product logo, repeated in the corners. That was also wrong. Repetition reads as decoration. The shot became type on black, and the length stayed.
- The logo is one flattened PNG. The parts that already had their own shape were the frame, the dash, and the circular badge. A grid on the mark showed the frame has a gap where the badge sits, so a circle mask lifts the badge and leaves the frame whole. The two words share one baseline. The cut was checked on orange, because white hides fringes.
- The logo assembles once, when the name is introduced, and appears assembled once on the end card.
- Every product sentence on screen came from running the product. A throwaway still of the real renderer came before any scene.
- A dialog that portals to the page could not sit inside a zoomed window. Its copy was read from the capture and drawn in normal flow with the same classes, minus fixed positioning.
- The agent chat is not a product screen. The tool name, arguments, and results inside it are captured. One frame array drives both the reveals and the sound cues.
- Japanese and English were both captured. The UI locale and the content locale were set separately, or the shell translated and the error did not.
- Capture failures were fixed in the capture, and the files were regenerated. The JSON was not edited by hand.
- The announcement was not the film's script. A draft that repeated the hook was rejected. The post that worked said what was made and what it does.

## The film

30fps, 120 BPM, 15 frames a beat. The project lived in the product repository at `video/launch/`, gitignored, installed with its own npm so Remotion never entered the product lockfile. Deliveries were `video/preflight-launch.mp4` and `video/preflight-launch-ja.mp4`, also gitignored. Tools: ffmpeg, python3 with numpy, Node.

| Shot | Frames | What it shows |
| --- | --- | --- |
| Hook | 120 | Four actors, then the question. The brand is not on screen yet. |
| LogoReveal | 105 | The supplied logo assembles, then the tagline. |
| PublishBlocked | 330 | The real editor panel. Publish is rejected, and the reason is on screen. |
| AgentCheck | 330 | The same rule from a second actor. Captured tool JSON, block then allow. |
| Dashboard | 300 | The real dashboard. A confirm dialog. The mode becomes enforce. |
| Principles | 150 | Four constraints, one line at a time, type only. |
| EndCard | 150 | Logo, where to get it, package name, fade to black. |

1485 frames, 49.5 seconds. The bed is generated to that length. Change a duration and regenerate the bed.

The argument, one sentence: the same deterministic rules check a publish no matter who starts it, and they can stop it.

| Reference beat | This film |
| --- | --- |
| A chat window over a hillside | The product's editor over a generated meadow |
| Typing a prompt, then a tool result | An agent typing, then the real check JSON |
| Frames being edited | The product panel and dashboard, through the product's renderer |
| A black field of colored geometry | Removed. Principles are type on black. |
| A logo lockup | This product's logo, a registry line, the package name |

## Capture

A test outside the product suite boots the real runtime per locale and writes one JSON file per screen with the test runner's file snapshot. The run is `npm run capture`. The story, through the host rather than mocks:

1. Load the empty dashboard.
2. Submit the real rule form.
3. Install a policy and an entry that fails it.
4. Open the editor panel in the permissive mode, switch the mode through the real action, open the panel again.
5. Run the check and the publish. Publish must return failure, with the product's own message.
6. Fix the entry through the real update API and publish again. This step asserts success.

What the capture got wrong, and the fix. The class of mistake is the lesson. The names are this product's.

- `primaryBylineId` did not satisfy `byline.required`. Credits go in `bylines: [{ bylineId }]`, and `bylineId` is `translationGroup ?? id`.
- A taxonomy update rejected the term id. It wants the slug, and the term's locale must be the entry's locale. The UI locale does not change the entry locale.
- With only the site locale set, the panel was Japanese and the rejection stayed English. Pass the locale list and set locale on the entry and on every record attached to it.
- A 1×1 PNG is enough for a media fixture. Alt text is a field on the fixture, not a later patch.

## What was real

The product surface is `@emdash-cms/blocks` `BlockRenderer` plus the admin package's compiled stylesheet, copied into the video package by the sync script. The wrapper sets `data-theme="kumo"` and `data-mode="light"`, and the font variable.

The first composition was a throwaway still of the panel and the dashboard. Badges, table, form, and banner were confirmed before a scene existed.

Icons in the shell are the icon set the admin already uses. Sidebar labels in Japanese come from the admin's own translations. The generated backdrop is also the image inside the editor, so the film has one world.

- Real: panel blocks, dashboard blocks, buttons, inputs, confirm copy, toast message, check JSON, publish error.
- Rebuilt, from screenshots and the design-system source: sidebar, top bar, editor fields, the window, the toast chrome.
- Rebuilt because a portal cannot be filmed: the confirm dialog. The renderer opens it after a click and positions it against the browser viewport. The confirm object is read off the captured button and drawn with the design system's button and card. The popup classes, with the fixed centering removed:

```
shadow-m ring ring-kumo-line overflow-hidden rounded-xl bg-kumo-base text-kumo-default sm:min-w-96
```

The dimmer is the design system's recessed color at opacity 0.8. `dialogVariants` was not a public export, so the classes were copied from the package source.

## Clicks, type, chat

Click targets are measured after fonts load, inside the render delay, and ancestor transforms are divided out. The shortest text match wins. Both states of a screen are mounted, and the inactive one is hidden with `visibility`. Scroll is subtracted after measurement, not during it. A full-width banner is framed on its sentence, not on the middle of the page. The cursor uses the same points. The pressed scale lasts about 6 frames.

Latin headlines split on spaces. Japanese has none, so it splits into chunks of about four characters, stays on one line, and shrinks to fit about 1720px. Without that, the Japanese hook wrapped and a title ran off the frame. Latin faces load with an explicit small subset. `Noto Sans JP` was not loaded: one weight was over a hundred files and the render stalled. On macOS this film used Hiragino Sans. Another machine substitutes a different face, and the report says so.

The chat items share one frame array. That array also drives the pop cues. The tool the capture actually called is `preflight__check_entry`. Each item is measured, and the log scrolls to the item's bottom over about 18 frames. The camera reads the same scroll when it frames the blocked result, the fixes, the allowed result, and the published row. The fix list names the fields the capture's update call changed.

## Logo

The file was 1448×1086, a mark above two words. Ink bands came from counting dark pixels per row. `cropdetect` returned nothing useful on the white field.

Masks: the badge is a circle around its measured center, the dash is a rectangle, the frame is everything else in the mark crop. Word crops share one vertical origin and one scale. The horizontal offset is a constant next to the component (`PREFLIGHT_OFFSET`), not a measurement at render time.

The frame scales in, the dash wipes, the badge pops and rotates around its own center. Layers were composited on orange to see fringes.

## Sound and review

The audio script writes a 44.1kHz stereo bed for the whole film, plus click, tick, pop, whoosh, thud, and chime. Scenes do not import audio. Cues are scene-local frames plus the scene's start. The bed ducks under the opening and the end card, and the drums thin out under the principles. These files are placeholders.

Review at half scale for rhythm, then full frames for every click and every zoom. A half-scale sheet hides a cursor that misses by 20 pixels. One composition per shot, plus the full film per locale, so a fix re-renders seconds.

## After the film

The mark, squared and padded on white at 256×256, became the product icon. The lockup became the image at the top of the README. The icon is part of a release, so it shipped as 0.1.1 rather than an overwrite of 0.1.0.

The post that worked said, plainly, that the publish check existed, who it checks, that it can stop a post or only record, and that it uses no AI and no external service, with the locale's video attached. The draft that repeated the film's opening lines did not.
