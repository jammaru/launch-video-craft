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

30fps, 120 BPM, 15 frames a beat. The project lived in the product repository at `video/launch/`, installed with its own npm so Remotion never entered the product lockfile. Deliveries were `video/preflight-launch.mp4` and `video/preflight-launch-ja.mp4`. None of it was committed.

Tools, and what each one did:

| Tool | Used for |
| --- | --- |
| ffmpeg | Reference contact sheets, logo split with `geq`, delivery `ffprobe`, loudness |
| python3, numpy, `wave` | Dark-pixel counts that found the logo's ink bands, then the bed and six effects in `scripts/make-audio.py` |
| vitest, `@emdash-cms/plugin-test`, the product's pnpm | The capture. Not installed in the video package |
| Remotion 4.0.531, React 19 | The film. `@remotion/google-fonts` for Latin only |
| `@emdash-cms/blocks`, `@phosphor-icons/react` | Real blocks and the admin's icon set |

| Shot | Frames | What it shows |
| --- | --- | --- |
| Hook | 120 | Four actors, then the question. The brand is not on screen yet. |
| LogoReveal | 105 | The supplied logo assembles, then the tagline. |
| PublishBlocked | 330 | The real editor panel. Publish is rejected, and the reason is on screen. |
| AgentCheck | 330 | The same rule from a second actor. Captured tool JSON, block then allow. |
| Dashboard | 300 | The real dashboard. A confirm dialog. The mode becomes enforce. |
| Principles | 150 | Four constraints, one line at a time, type only. |
| EndCard | 150 | Logo, where to get it, package name, fade to black. |

1485 frames, 49.5 seconds. The bed is generated to that length. Change a duration and regenerate the bed. These lengths fit that reference; they are not the default for another film.

Beats in the product shots, scene-local frames, read from the scene source. Headlines exit over 14 frames from the out frame. Windows enter with `pop(frame, fps, in, 16, 0.9)` (stiffness 170) and land about 30 frames later.

| Shot | Headline | Window in | Camera at scale 1 until | First beat | Presses | Result held |
| --- | --- | --- | --- | --- | --- | --- |
| PublishBlocked | 2→36 | 40 | 72 | camera on Publish 112 (2.1), cursor 110 | 118 | toast at 126; camera on it 168→214 (2.2) |
| AgentCheck | 2→34, subtitle 10→34 | 36 | 60 | camera on composer 94 (1.45), cursor on Send 92 | Send 96 | first message at 100; blocked gate 168→196 (1.75) |
| Dashboard | 2→38 | 40 | 76 | camera on the observe banner 108 (1.7) | Enable 190, Confirm 228 | mode swap at 234; banner 262→300 (1.75–1.92) |

Each headline is what the next three seconds show: "Bad publishes stop before they go live." then a publish stops; "Agents check first." then an agent's message and a check; "Observe first. Enforce when ready." then the observe banner, then enforce.

Picture scale. The admin window is `{ x: 150, y: 96, w: 1620, h: 930 }`. In each product shot the camera stays at scale 1 while the headline plays and the window lands (about frames 0–72), then zooms. The proof shot reaches 2.1 on the publish control and 2.2 on the toast. The cursor glyph is 44×50. The photograph is behind those product shots only. The hook, the logo, and the end card are on white. Principles is one line at a time on black. The end card fades to black over its last 14 frames. A later film that left a small window on the photograph for the whole running time, with no zoom and no cursor, had not followed this.

The argument, one sentence: the same deterministic rules check a publish no matter who starts it, and they can stop it.

| Reference beat | This film |
| --- | --- |
| A chat window over a hillside | The product's editor over a generated meadow |
| Typing a prompt, then a tool result | An agent typing, then the real check JSON |
| Frames being edited | The product panel and dashboard, through the product's renderer |
| A black field of colored geometry | Removed. Principles are type on black. |
| A logo lockup | This product's logo, a registry line, the package name |

## Capture

Tools: vitest, through the product's pnpm, and `@emdash-cms/plugin-test`. The video package is installed with npm and does not depend on the test host. `npm run capture` leaves the video folder and runs the product's vitest:

```bash
cd ../.. && pnpm exec vitest run --config video/launch/capture/vitest.config.ts -u
```

The config sets `root` to the product repository (three directories up from `capture/`) and registers `emdashPluginTest({ dir: repoRoot })`. `include` is only `video/launch/capture/**/*.capture.ts`. If the root is the video folder, the plugin builder cannot see the manifest. If `include` is left open, the product's own suite runs too.

The test imports `createPluginRuntimeTestHost` and loops `en` and `ja`. Each iteration boots a host, disposes it in `afterEach`, and writes snapshots with:

```ts
expect(JSON.stringify(value, null, 2)).toMatchFileSnapshot(`../src/captured/${name}.json`);
```

`-u` regenerates those files. They are not edited by hand.

The host is booted with both knobs, or the shell and the errors disagree:

```ts
createPluginRuntimeTestHost({
  site: { name: "My Blog", locale },
  i18n: { defaultLocale: locale, locales: [locale] },
});
```

Fixtures and actions used, in order. These names are this product's. Another product has different ones.

1. `fixtures.collection`, `fixtures.taxonomyDefinition`, and `fixtures.media` with a 1×1 PNG (`bytes` from a base64 data URL, `width: 1`, `height: 1`).
2. `admin.loadPage("/dashboard", { locale })` for the empty dashboard.
3. `admin.submit("/dashboard", "save_rule", fields, { locale })` for the real rule form.
4. `fixtures.plugin.setting("policy", …)` and `fixtures.content` for a draft that fails the rules. The entry's `locale` is the content locale.
5. `admin.loadEditorPanel("preflight", "posts", entry.id, { locale })` and another `loadPage` while the mode is observe.
6. `admin.act("/dashboard", "enable_enforce", { locale })`, then the panel again.
7. `transport.invokeRoute("check-entry", { collection, contentId })`, then `actions.content.publish`. The test asserts `success: false`.
8. `fixtures.byline`, `fixtures.taxonomy` (slug, and the same locale as the entry), and a second media fixture that includes `alt`. Then `actions.content.update` with `bylines: [{ bylineId: byline.translationGroup ?? byline.id }]` and `taxonomies: { category: [term.slug] }`.
9. `check-entry` again, `admin.actEditorPanel(…, "recheck", { locale })`, then `publish`. The test asserts `success: true`.
10. `host.manifest.mcp?.tools` is saved too, so the chat shot's tool list is the manifest, not a typed-in name.

Files written per locale: `dashboard-empty`, `dashboard-rule-saved`, `panel-observe`, `dashboard-observe`, `dashboard-enforce`, `panel-enforce`, `check-blocked`, `publish-rejected`, `check-passed`, `panel-passed`, `publish-accepted`, `manifest-tools`.

What the capture got wrong, and the fix. The class of mistake is the lesson. The names are this product's.

- `primaryBylineId` did not satisfy `byline.required`. Credits go in `bylines: [{ bylineId }]`, and `bylineId` is `translationGroup ?? id`.
- A taxonomy update rejected the term id. It wants the slug, and the term's locale must be the entry's locale. The UI locale does not change the entry locale.
- With only the site locale set, the panel was Japanese and the rejection stayed English. Pass the locale list and set locale on the entry and on every record attached to it.
- A 1×1 PNG is enough for a media fixture. Alt text is a field on the fixture, not a later patch.

## What was real

The product surface is `@emdash-cms/blocks` `BlockRenderer` (pinned to the same admin version the product uses) plus the admin package's compiled stylesheet. The sync script does not import Tailwind. It finds the installed folder `node_modules/.pnpm/@emdash-cms+admin@0.42.0*` and copies `node_modules/@emdash-cms/admin/dist/styles.css` into `src/vendor/`. The wrapper sets `data-theme="kumo"` and `data-mode="light"`, and the font variable. Shell icons are `@phosphor-icons/react`, the set that admin uses. Latin type is `@remotion/google-fonts` with `subsets: ["latin"]`.

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

`scripts/sync-assets.mjs` runs ffmpeg `geq` on that file. Ink alpha is `clip((250-g(X,Y))*1.07,0,255)`. Masks, in source pixels: the badge is `lte(hypot(X-841,Y-524),79)`, the dash is `between(X,600,815)*between(Y,396,446)`, and the frame is `not(badge)*not(bar)` inside the mark crop `400:360:526:252`. Word crops share the vertical origin `673` (`580:150:180:673` and `490:150:785:673`). The horizontal offset is a constant next to the component (`PREFLIGHT_OFFSET`), not a measurement at render time.

The frame scales in, the dash wipes, the badge pops and rotates around its own center. Layers were composited on orange to see fringes.

## Sound and review

The audio script writes a 44.1kHz stereo bed for the whole film, plus click, tick, pop, whoosh, thud, and chime. Scenes do not import audio. Cues are scene-local frames plus the scene's start. The bed ducks under the opening and the end card, and the drums thin out under the principles. These files are placeholders.

Review at half scale for rhythm, then full frames for every click and every zoom. A half-scale sheet hides a cursor that misses by 20 pixels. One composition per shot, plus the full film per locale, so a fix re-renders seconds.

## After the film

The mark, squared and padded on white at 256×256, became the product icon. The lockup became the image at the top of the README. The icon is part of a release, so it shipped as 0.1.1 rather than an overwrite of 0.1.0.

The post that worked said, plainly, that the publish check existed, who it checks, that it can stop a post or only record, and that it uses no AI and no external service, with the locale's video attached. The draft that repeated the film's opening lines did not.
