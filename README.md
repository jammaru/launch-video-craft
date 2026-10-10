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

「ローンチ動画をいい感じに作って」とだけ頼むと、実際の UI を使わないことが多く、イメージともずれがちです。このリポジトリは、ローンチ動画の作り方と判断の基準を Agent Skill にまとめたものです。手順の詳細は [`skills/launch-video-craft/SKILL.md`](skills/launch-video-craft/SKILL.md) にあります。

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

参考動画とロゴを添え、Remotion で作ることと、`launch-video-craft` に従うことを書きます。参考動画はテンポや見せ方の参考にし、シーンの数や順番をそろえる必要はありません。

動画で伝えたいこと、入れたいシーンとその順番、各シーンで観客に何を伝えるかも書いてあると、依頼の意図に近い作品になります。尺や言語、必ず映したい画面があれば、それも書きます。画面は製品の実際の UI を使うよう依頼してください。似た画面を後から描き直すのではなく、本物の画面やコマンドの出力を映します。

```text
このプロダクトのローンチ動画を Remotion で作って。参考はこの動画、ロゴはこのファイル。
実際の UI を使って。launch-video-craft に従って。
〇〇を伝えたい。ロゴのあと Playground で△△を見せ、最後にインストール。
```

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
