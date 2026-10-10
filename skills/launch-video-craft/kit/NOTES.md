# <Product> launch film

Fill each section before the phase that needs it. Review reads this file back.

## User's requests

Copy what the user asked for, word for word: the claim the film must prove, scene order, scenes to include or skip, what each scene should make the viewer understand, payoff, length, and language.

-

## Reference, understood

(one paragraph: what the film does, which moment carries it, what the viewer knows by the end)

| Reference scene | What it is for | In this product (or "drop", and why) |
| --- | --- | --- |
| | | |

Roles this product needs that the reference does not have:

- 

## Reference, measured

| What | Measured |
| --- | --- |
| Length, fps, size | (ffprobe) |
| Shots, and which field each sits on | |
| Window size at rest, and how it enters | |
| First zoom: frame, scale, target | |
| Cursor size against a button | |
| Headline size and how it reveals | |
| How it opens; how it ends | |

## Borrow

- (with numbers)

## Do not draw

- (things you can point at in a frame)

## Beat map

| Reference | This product |
| --- | --- |
| | |

## Argument

(one true sentence you can demonstrate)

## Actors

- (who triggers the action; for a product with no UI: what the person types, and what the agent does after the prompt)

## Shots

1. (one sentence per shot, naming a behavior you will run)

Length: (the sum of the shots this product needs; say why each one is there. The reference's length is not a target.)

## Sources of on-screen text

- (each on-screen string: the capture file it comes from, or `src/copy.ts`)

## How the product's UI is shown

- (for each product shot: the product's built page in ProductFrame, shot with shootProduct, and the path of the build; or its components with the shipped CSS; or Terminal / agent chat with captured output. Never a UI written for the film.)

## What each shot shows

| Shot | The one thing the viewer must see | Its data-anchor | Gesture that causes it |
| --- | --- | --- | --- |
| | (the smallest element that proves the headline: a card, a line, a badge, never a whole page) | | |

## Stills checked

Written after opening `review/<Shot>-sheet.png` from `npm run verify`. One line per shot; `npm run render` refuses without them.

- Command: (what the press still, result still, and hold-end still show; whether the cursor tip is inside the red box; whether the result is whole and readable)

## Film checked

Written after `npm run render` (which runs inspect) and opening `review/film-sheet.png`, one row per shot of the finished mp4. Look for anything odd: a blank or half-built frame, text over the photograph, a cut-off line, a cursor off its target, writing in the backdrop. `npm run finish` refuses without these lines.

- Backdrop: (public/backdrop.jpg at full size: no letters, signs, logos, screens, or people; a natural place)
- Command: (what the five stills of this shot show, and anything odd)

## Problems found in review

1. (each problem seen on a still, sheet, or strip, and its fix, before the next render)

## User's requests, checked

- (each request from the top, and where it is in the film)
