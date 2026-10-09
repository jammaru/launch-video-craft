# Eval run, 2026-10-09

Static check: `python3 scripts/check.py` passed (both skills, alpha logo, four client links).

Prompt evals used Composer 2.5, with only the two skills as reading. The skills were not edited afterward.

| Prompt | Score | Note |
| --- | --- | --- |
| `chatgpt-intro` | 12 / 14 | The plan has the borrow list, the beat map, the capture rule, the logo rule, and the delivery report. It misses a demonstrable argument, and it does not say that ChatGPT's renderer cannot be imported. The worked example leaks in: the question, the failure-then-success shape, and the meadow. |
| `looks-like-the-reference` | 5 / 5 | Deletes the borrowed shapes, keeps the length, leaves type, refuses a field of logos. |
| `logo-arrives` | 8 / 8 | One flattened file, dark-pixel bounds, color check, two appearances. |

25 of 27 expectations passed. No skill file was changed from these results.
