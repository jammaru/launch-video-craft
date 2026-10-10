# Worked example: a product with no UI

This is the launch film for this skill itself, made with this skill. The product is a folder of Markdown that a coding agent reads. It has no screen. Read it after [SKILL.md](SKILL.md) and [example.md](example.md) when the product is a CLI, a library, an agent skill, an API, or anything else whose real screen is the output of running it.

Copy the decisions. Do not copy the film. The clapperboard, the lavender salt marsh, the headlines, and the prompt below belong to this film.

## Decisions this film is evidence for

- **The real screen is the real output.** The install shot shows the bytes `npx skills add` printed into an empty project. The agent's tool cards show what `ffprobe` and `remotion still` printed. Nothing in a terminal or tool card was typed by hand.
- **The person types twice.** The first cut had the person typing commands into a terminal after the prompt. The user rejected it: with a skill, a person types the install command and one prompt, and the agent does the rest. Ask and Check became one agent conversation. After Send, the cursor leaves the reply and never presses again.
- **The agent's steps are tool cards, not typing.** A sentence naming the skill it uses, `Ran <command>` with the captured output, `Wrote <file>`, a sentence of diagnosis, `Ran` again, and a green `Done` line with the passing output. Each item rises into the log and the log scrolls to follow it.
- **The failure is real.** A deliberately drifting beat sheet goes through the real renderer, which fails with `assertBeats` reasons. The fixed sheet renders. The capture asserts both outcomes, so a passing "failure" cannot ship.
- **The payoff is the product's output.** The last product shot plays a finished film made with the skill in a plain player.
- **The logo moves the way the object moves.** The clapperboard's stick is cut from the body along its hinge and claps shut once when the name lands.
- **The checker caught its own film three times.** The fixed render was held 23 frames; two presses were 28 frames apart; after the rebuild, the plan was held 18 frames. Each stopped the render until it was retimed.

## The film

Reference: a 40-second, 24fps launch clip with windows on a landscape, a large cursor, and fast zooms. The film is 43 seconds, seven shots, 30fps.

| Shot | Frames | Picture | Headline |
| --- | --- | --- | --- |
| Install | 210 | Terminal already on the marsh; `npx skills add …` typed, its real output streams, zoom on the installed line | none (the reference opens on a window) |
| Name | 105 | Paper field; clapperboard parts assemble and clap; name and tagline | |
| Ask | 290 | Agent chat. One prompt typed and sent. "Using launch-video-craft", `ffprobe` card, `Wrote NOTES.md` with the beat map | "Hand it a clip and a logo." |
| Check | 255 | Same chat, no input: drifting render fails with reasons, diagnosis, wrote the fixed sheet, render passes | "It rejects a cut that drifts." |
| Film | 210 | Player window; play pressed; a film made with the skill plays, zoomed | "You get the film." |
| Principles | 105 | Three lines on ink | |
| End | 120 | Assembled logo, name, install command on light gray | |

Beat sheet of the agent shot (Check), all read-only beats, `proves` on the rejection:

| Frame | Picture | Text on screen |
| --- | --- | --- |
| 2–36 | Quiet field | "It rejects a cut that drifts." |
| 40–70 | Chat window rises and lands | the conversation from Ask, already there |
| 74 | Agent: rendering each shot against its beat sheet | film copy |
| 84, 88→ | Card `Ran npx remotion still … DriftingCut`; `An error occurred:`, six reasons, `… 6 more` | captured output, 2 frames a line |
| 72→104–136 | Camera to the card, scale 1.6 | |
| 140 | Agent: what drifted, retiming it | film copy |
| 154, 166 | `Wrote src/checks/build-fixed.beats.ts`, `Ran … FixedCut` with `Rendered 1/1` | captured output |
| 150–182 | Camera on the diagnosis and the fix, scale 1.7 | |
| 190 | Green `Done`: "Beat check passed", `Rendered 1/1` | captured output |
| 200–255 | Camera on the passing line, scale 1.8 | |

## Capture

One script, `capture/capture.mjs`, writes one JSON per screen. Each step asserts the claim.

1. **Install.** An empty `git init` project under `video/<name>/.scratch/my-product`. HOME is set to `.scratch`, so the CLI prints `~/my-product` and no personal path reaches the film. npm keeps its real cache. Moving HOME hid the keychain and the git config, so cloning the private repository failed; git authenticates through the GitHub CLI instead (`GH_TOKEN`, `GIT_CONFIG_*` credential helper). The script asserts the skill's SKILL.md exists after the install.
2. **Cleaning.** The CLI redraws spinners with `ESC[1G ESC[J`. Split each line on it and keep the last piece, then strip color codes. Without this, a spinner line becomes thirty overlapping states.
3. **What the agent reads.** The installed SKILL.md's line count, and `ffprobe` on the reference, run for real.
4. **Rejection.** `npx remotion still src/index.ts DriftingCut` must exit non-zero; `FixedCut` must exit zero. The error is sliced up to `An error occurred:`, then the message and the `- ` reasons. The first try ran with `--log=error` and captured only a warning; the default log level prints the real lines.
5. **The plan.** The Borrow, Do not draw, and Beat map lists the agent shows are parsed from the film's NOTES.md, the notes the skill had us write first.

The check compositions are registered with `lazyComponent`, so the drifting sheet throws only when that composition is rendered, not when the film bundles.

## Framing text

- A terminal row is a full-width block, so its center is the middle of the window. Anchor the text span, not the row.
- While a command is being typed, its width changes every frame. Measure the prompt (`~/my-product $`), which is stable, and compute the line's center from the character width.
- At scale 2 the view is 960px wide. Frame a line by its left edge plus 480, not by its center, or long commands lose their start.
- A collapsed tool card (`… 6 more`) is how agent UIs show long output, and it kept the passing render on screen. Twelve reasons had pushed it under the composer.
- A card appears whole, as one item, with its lines following 2 frames apart. A card whose header showed `Running` above an empty body read as a blank box for half a second.
- A log column of 1140px was wider than the view at scale 1.7: the prompt, the Send button, and the right of the green line were cut. At 1000px every card stays whole at 1.8.
- When the film inside the player has its own cursor, hide yours during the watch zoom. Two cursors read as a glitch.

## Logo

The clapperboard is one flattened PNG with a pink body, a striped stick, and a yellow star on the face. Parts were cut with numpy masks, checked on a strong color:

- Stick: everything above a boundary polyline traced from the hinge along the stick's lower edge. The first boundary left a sliver of stick on the body; the points were re-read from a grid overlay.
- Star: the yellow pixels dilated by 28px inside a circle around the star, excluding pink. The first mask left a ghost outline. The face under the star was repainted with the face color so the body layer has no hole.
- The hinge point and the closed angle (18°) were measured, so the stick rotates around the real hinge and lands flush.

## Sound and review

A 116 BPM bed and the effects were synthesized from the durations, cues taken from the beat sheets. Review: full-size stills of each product shot, a 1fps sheet, and a strip per product shot from headline out to the proof. Every problem went into NOTES.md before the next render. The ones not listed above: the install view clipped the left edge at scale 1.45, and the composer click used a hand-written offset 200px left of the text.
