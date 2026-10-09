# Evaluating the skills

An eval asks whether another agent, given only these skills, makes the same decisions the method describes. It does not update the skills. If a result is bad, write that down here and change the skills in a later, separate edit.

## What is checked

`python3 scripts/check.py` checks the package itself:

- `name` matches the directory, the license is MIT, and `metadata.version` matches `plugin.json`
- skill text does not contain a home directory, a personal path, or a machine-specific "this Mac"
- the decisions from the film that produced these skills are still present (beat map, three layers, logo split, beat grid, review that removes before it adds, and the worked example's capture failures)
- `assets/logo.png` has an alpha channel
- `.agents`, `.claude`, `.cursor`, and `.github` point at `skills/`

This can pass while a plan is still a bad film. It only checks that the written method is intact and safe to publish.

## Prompt evals

`evals.json` holds the prompts. The first one is a ChatGPT introduction planned from a landscape-and-windows reference, using only these skills, with no render. The other two check the review rule and the logo rule.

Run one prompt in a fresh agent that can read `skills/` and nothing else from a product repository. Tell it to write a plan and not to edit the skills. Save the plan under `evals/runs/<id>/plan.md`. Grade each expectation as pass or fail with a short quote, and save that as `evals/runs/<id>/grade.md`.

Leave the skills unchanged after grading.
