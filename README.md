<p align="center">
  <a href="README.md"><img alt="English" src="https://img.shields.io/badge/English-111111?style=for-the-badge"></a>
  <a href="README.ja.md"><img alt="日本語" src="https://img.shields.io/badge/%E6%97%A5%E6%9C%AC%E8%AA%9E-555555?style=for-the-badge"></a>
</p>

<p align="center">
  <img src="assets/logo.png" alt="Launch Video Craft" width="220">
</p>

<h1 align="center">Launch Video Craft</h1>

<p align="center">
  Turn your real product UI into a polished launch film with an AI coding agent.
</p>

<p align="center">
  <a href="https://github.com/jammaru/launch-video-craft/releases/tag/v1.0.0"><img alt="v1.0.0" src="https://img.shields.io/github/v/release/jammaru/launch-video-craft?label=version" /></a>
  <a href="https://skills.sh/jammaru/launch-video-craft"><img alt="skills.sh" src="https://skills.sh/b/jammaru/launch-video-craft" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/License-MIT-blue.svg" /></a>
</p>

Agent Skill for Cursor, Claude Code, Codex, GitHub Copilot, and the other agents the [skills CLI](https://www.npmjs.com/package/skills) supports. It carries a launch film from the product's real UI through Remotion, including the checks on clicks, zoom, and frames. The path is verify, then review, then render.

## Demo

<p align="center">
  <img src="assets/agent-demo.webp" alt="An agent using Launch Video Craft to check tempo and correct a drift" width="720">
</p>

Made with Launch Video Craft.

| EmDash Preflight | ChatGPT |
| :---: | :---: |
| [![EmDash Preflight](assets/samples/emdash-preflight.webp)](https://x.com/jammaru_lab/status/2105501576437678510?s=20) | [![ChatGPT](assets/samples/chatgpt.webp)](https://x.com/jammaru_lab/status/2108406681839554662?s=20) |

## Install

```bash
npx skills add jammaru/launch-video-craft
```

For every project on the machine, add `-g`.

```bash
npx skills add jammaru/launch-video-craft -g
```

Update:

```bash
npx skills update launch-video-craft
```

Renamed from `launch-video-skills` / `launch-video-method`. Install and update with `launch-video-craft`.

### GitHub CLI

`gh skill` needs [GitHub CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/cloud-agent/create-skills) 2.90.0 or later.

```bash
gh skill install jammaru/launch-video-craft launch-video-craft --scope user
gh skill update launch-video-craft
```

### Claude Code plugin

```text
/plugin marketplace add jammaru/launch-video-craft
/plugin install launch-video-craft@launch-video-craft
```

## Why Launch Video Craft

The published thing is the production process that keeps an agent from shipping a sloppy launch film.

- The picture uses the product's real UI.
- Tempo and camera come from a reference clip.
- The film is built in Remotion.
- Clicks, zoom, and frames are checked against the real screen.
- Render is the last step: verify, then review, then render.

## How it works

A rough first ask is enough. Attach a reference clip and a logo, say the film is Remotion, and name `launch-video-craft`. The reference is for tempo and camera. The scene count and order do not have to match it.

Watch the cut, then point at what feels wrong: tempo, where the zoom lands, a line of copy, the order of screens. That loop is the workflow. The first prompt does not have to specify everything.

When you do know the cut, name what to say, which scenes and in what order, what each scene tells the viewer, the length, the language, and any screen that must appear. Ask for the product's real UI. The film shows the real screen or the real command output.

```text
Make a launch film for this product in Remotion. Reference clip attached, logo attached.
Use the real UI. Follow launch-video-craft.
Say this: after the logo, show the playground doing X, then the install.
```

The method itself is in [`skills/launch-video-craft/SKILL.md`](skills/launch-video-craft/SKILL.md).

## Website

[launch.jammaru.com](https://launch.jammaru.com)

The site is in [`website/`](website/). From that directory, `cf deploy` publishes it. Configuration is `cloudflare.config.ts`.

## Repository

```text
.
├── skills/launch-video-craft/   # SKILL.md, reference.md, example*.md, kit/
├── website/                      # launch.jammaru.com
├── .claude-plugin/               # Claude Code plugin
├── assets/
└── scripts/check.py              # static check before publish
```

## License

[MIT](LICENSE) — Copyright (c) 2026 [jammaru](https://github.com/jammaru)
