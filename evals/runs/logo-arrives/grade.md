# Grade: logo-arrives

- Model: Composer 2.5
- Skills edited: no
- Result: 8 / 8

| Expectation | Result | Evidence |
| --- | --- | --- |
| Does not treat the file as pre-separated layers | pass | Opens by saying the file is one raster, not layers. |
| Separates the mark from the words | pass | Quiet rows split the mark band from the word band. |
| Moves only pieces that already have their own shape | pass | Frame, bar, and badge only when they already have an edge. |
| Counts dark pixels and does not trust cropdetect on white | pass | Row and column counts, and cropdetect called useless on white. |
| Checks the cut on a strong color | pass | Names a strong flat color, with the worked example's orange as the instance. |
| Keeps the words on one baseline | pass | Shared origin and scale, offset stored as a constant. |
| Assembly once, assembled logo once on the end card | pass | LogoReveal animates. End card is already assembled. |
| Does not scatter the mark | pass | Refuses using the mark to fill a principles shot or a corner. |
