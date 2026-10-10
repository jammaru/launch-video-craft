<p align="center">
  <img src="assets/logo.png" alt="Launch Video Craft" width="220">
</p>

<h1 align="center">Launch Video Craft</h1>

<p align="center">
  <em>Launch Video Craft</em> — A reference-driven method for crafting polished product launch videos with real UI and Remotion.
</p>

<p align="center">
  参考クリップのテンポに合わせ、実際の製品画面を使った短いローンチ動画を Remotion で作る Agent Skill です。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
</p>

## これは何？

「ローンチ動画をいい感じに作って」とだけ頼むと、実際の UI を使わないことが多く、出来上がりもイメージとずれがちです。このリポジトリは、ローンチ動画を作る手順と判断の基準を Agent Skill にまとめたものです。手順の詳細は [`skills/launch-video-craft/SKILL.md`](skills/launch-video-craft/SKILL.md) にあります。

## このスキルで作った動画の例

| EmDash Preflight | ChatGPT |
| :---: | :---: |
| [![EmDash Preflight](assets/samples/emdash-preflight.webp)](https://x.com/jammaru_lab/status/2105501576437678510?s=20) | [![ChatGPT](assets/samples/chatgpt.webp)](https://x.com/jammaru_lab/status/2108406681839554662?s=20) |

## インストール

### 1. `npx skills add`（推奨）

```bash
npx skills add jammaru/launch-video-craft
```

すべてのプロジェクトで使う場合は `-g` を付けます。

```bash
npx skills add jammaru/launch-video-craft -g
```

更新:

```bash
npx skills update launch-video-craft
```

### 2. GitHub CLI

`gh skill` は GitHub CLI 2.97 以降です。

```bash
gh skill install jammaru/launch-video-craft launch-video-craft --scope user
gh skill update launch-video-craft
```

### 3. Claude Code プラグイン

```text
/plugin marketplace add jammaru/launch-video-craft
/plugin install launch-video-craft@launch-video-craft
```

## 使い方

参考動画、ロゴファイル、言語（ロケール）を渡し、次のように依頼します。

```text
このプロダクトのローンチ動画を作って。参考動画はこれ。ロゴはこのファイル。
Remotion で。
launch-video-craft に従って。
```

エージェントは、シーンを組み立てる前に次の 3 点を書きます。

1. 参考クリップから借りるテンポと、借りない図形
2. 参考の各場面と製品の動作の対応表
3. 各ショットで画面に示す一文

そのあと製品を動かして画面をキャプチャし、レンダラーで静止画を確認してからシーンを組み立てます。画面上の数字や文言は、手で書いた JSON にしません。

## リポジトリ構成

```text
.
├── skills/launch-video-craft/   # SKILL.md、reference.md、example*.md、kit/
├── .claude-plugin/               # Claude Code プラグイン
├── assets/
└── scripts/check.py              # 公開前の静的チェック
```

## ライセンス

[MIT](LICENSE) — Copyright (c) 2026 [jammaru](https://github.com/jammaru)
