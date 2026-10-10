# A film that went wrong, measured

A 40-second launch film for a developer library: one request is sent to three model providers, and a browser playground shows, per provider, whether the request survives (`ok`, `lossy`, `unsupported`), then a terminal check that fails on the unsupported one. The project started from the kit. Every scene typechecked and every beat sheet passed `assertBeats`. The user's verdict was that the type could not be read, the zooms and clicks were in the wrong places, and nothing had been checked.

Each failure below was measured on the delivered mp4 at full size. Each has its cause in the source and the check that now catches it. They are classes of mistake; the names are that film's.

## What the viewer saw

| Shot | Seen | Measured |
| --- | --- | --- |
| Headlines | White type drawn over the backdrop photograph, sky on the left, horizon on the right | Contrast of the type, per eighth of the line from left: 1.29, 1.13, 1.24, 1.37, 4.66, 5.27, 8.65, 11.08 to 1. The first half of every headline is unreadable. |
| Headlines | The top edge of the next window visible at the bottom of the frame while the headline is read | Window chrome in 108 of the bottom 150 pixel rows, during the read |
| Playground, the click | The cursor presses on empty space beside the provider card | About 150px from the card; the camera is centred on the same wrong point |
| Playground, the result | The camera holds a frame where the card headers are cut at the top and half the frame is empty panel | The card that says `unsupported` is never wholly in frame |
| Playground | A banner from the product's capture mode across the top: "2. OpenAI: lossy. Gemini: unsupported." | The answer is printed before the shot shows it |
| Playground | The lower half of the window is empty | The demonstrated surface fills about half of the 1620×930 window |
| Diagnostics | One static picture | 9 seconds with no change |
| Terminal check | The camera lands on the diagnostics, not the `FAIL` row it was meant to hold | The output kept scrolling after the camera stopped |
| Terminal check | Long lines run off the right edge of the zoomed view | Line ends cut on every zoomed still |
| End card | A dark logo on an ink field | 1.21:1 |
| Whole film | The product's name appears in the title, the logo shot, and the end card, back to back | Three times in about 12 seconds |

## Why

**Guessed positions.** The playground was the product's real page, in an `<iframe>`. The scene measured elements inside it in a `useEffect` once the iframe had loaded, and passed the points up into the scene's state. Nothing made the frame wait for them: the `delayRender` handle was released on cleanup, not after the points were stored. Frames rendered before the state existed, and each render tab starts empty. Every position had a fallback written as a plausible number (`?? { x: 1180, y: 640 }`), so nothing failed: the click and the camera went to the guess on every frame.

**State that does not persist.** The scene sent a click into the iframe to switch providers. Remotion renders each frame in a fresh page, in any order. The click existed on the frame that sent it and on no other, so the picture did not show the state the beat sheet described.

**Type on the photograph.** The headline component was placed over the backdrop. A still checked by eye at the right half of the line looked fine; the left half sat on pale sky.

**The window peeking.** The window's rise started 820px below its resting place. The window is 930px tall, so its top 110px were on stage, under the headline, before it began to move.

**Scroll under a parked camera.** The terminal's scroll was keyed to the last output line's reveal; the camera was keyed to the `FAIL` row's reveal, earlier. The camera arrived and stopped; the text kept moving beneath it.

**Demo chrome.** The product's playground has a capture mode for its own docs screenshots, with a step banner. The film loaded that mode and kept the banner.

**No review.** A draft contact sheet was generated and the delivery rendered in the same command. NOTES.md said "Stills checked: (pending)". No still of a press was opened before the user saw the film.

## What catches each one now

| Failure | Check |
| --- | --- |
| Fallback coordinates | `npm run verify` rejects `?? { x: <number>` and `? … : { x: <number>` in scenes. `pointIn(box)` is off stage until measured. |
| Anchors never measured | `assertFraming`: an action's `target` or `resultTarget` with no measured box fails, naming the anchor |
| Click beside the button | `assertFraming`: cursor tip more than 4px outside the target at the press, with both coordinates in the message |
| Result cut or half empty | `assertFraming`: result not wholly in view, under 35% of the view, or a zoomed view more than 10% backdrop. `fit()` places the camera from the box and keeps it inside the window. |
| Scroll under the camera | `assertFraming`: the result moves more than 6px during the hold |
| Static 9 seconds | `assertBeats`: a hold over 120 frames fails unless `playing: true` |
| Type on the photograph, dark logo | `contrast.py` in verify: busy background behind type, or under 3:1. `Headline` draws its own paper field. |
| Window peeking | The kit's `rise` starts 1000px below and is hidden until it moves |
| Iframe clicks, late measurement | `useProduct` measures inside the page before `continueRender`; state comes from the URL or `prepare`, one mount per state |
| Demo banner, empty half window | The verify sheet, read by eye, and the reject rows in reference.md. No machine check knows what the product's own chrome is. |
| No review | `npm run render` runs `gate.mjs`: it refuses without a clean `review/report.json` newer than every source file, and without a written "Stills checked" line per shot |

The machine checks would have stopped this film at the first `npm run verify`, on the missing anchors. The banner and the half-empty window needed someone to open the sheet. That is why the gate asks for written lines, not a checkbox.

## A later film: the lookalike

A later film of the same product passed every check above and still did not show the product. The agent read the playground's `render.ts` and `styles.css`, then wrote its own `PlaygroundSurface`: a dark code pane, three provider tabs, yellow and red diagnostic cards, all inline styles. The real playground has no provider tabs; it shows one card per provider in a grid, in its own fonts and colours. A second film kept the shipped CSS but rebuilt the markup, and drifted the same way.

Nothing measured whether the window was the product. Against a screenshot of the real page at the window's size, the hand-drawn window scored 0.07 on edge match and the rebuilt one 0.14; the real page, shifted and rescaled a little, scores 0.8 to 0.98.

| Failure | Check |
| --- | --- |
| A UI written for the film | Every `Window` needs `window.real` in its beat sheet. A web page the product builds is shot by `shootProduct` and shown with `ProductFrame`; `npm run verify` compares the landed window with the screenshot (`similar.py`, 0.5 or more) and fails a scene without `useProduct` and `<ProductFrame>`. |
| A web UI passed off as captured output | A `capture` window must import its capture file and render it in `Terminal`, the agent chat, or with the shipped CSS from `src/vendor/`. |
