<p align="center">
  <img src="assets/logo.png" alt="Launch Video Skills" width="220">
</p>

<h1 align="center">Launch Video Skills</h1>

<p align="center">
  参考クリップのテンポに合わせ、実際の製品画面を使った短いローンチ動画を Remotion で作る Agent Skill です。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
</p>

## これは何？

「ローンチ動画をいい感じに作って」とだけ頼むと、実際の UI を使わないことが多く、出来上がりもイメージとずれがちです。このリポジトリは、ローンチ動画を作る手順と判断の基準を Agent Skill にまとめたものです。

[`launch-video-method`](skills/launch-video-method/SKILL.md) が本体です。技法は [`reference.md`](skills/launch-video-method/reference.md) にあります。[`example.md`](skills/launch-video-method/example.md) は、その手順で作った **1 本**（EmDash Preflight）の制作記録です。記録に出てくる問い、台詞、キャプチャの呼び出しはその製品向けなので、別の製品ではその製品用に書き直します。

### このスキルで作った動画の例

リポジトリに同梱した mp4 をそのまま再生できます（GitHub 上でも表示されます）。

<p align="center">
  <video src="assets/samples/emdash-preflight.mp4" controls width="720"></video>
</p>
<p align="center">EmDash Preflight（1920×1080）</p>

<p align="center">
  <video src="assets/samples/chatgpt.mp4" controls width="720"></video>
</p>
<p align="center">ChatGPT（1920×1080）</p>

ダウンロード: [emdash-preflight.mp4](assets/samples/emdash-preflight.mp4) · [chatgpt.mp4](assets/samples/chatgpt.mp4)

## インストール

### 1. `npx skills add`（推奨）

```bash
npx skills add jammaru/launch-video-skills
```

すべてのプロジェクトで使う場合は `-g` を付けます。

```bash
npx skills add jammaru/launch-video-skills -g
```

更新:

```bash
npx skills update launch-video-method
```

### 2. GitHub CLI

`gh skill` は GitHub CLI 2.97 以降です。

```bash
gh skill install jammaru/launch-video-skills launch-video-method --scope user
gh skill update launch-video-method
```

### 3. Claude Code プラグイン

```text
/plugin marketplace add jammaru/launch-video-skills
/plugin install launch-video-skills@launch-video-skills
```

## 使い方

参考動画、ロゴファイル、言語（ロケール）を渡し、次のように依頼します。

```text
このプロダクトのローンチ動画を作って。参考動画はこれ。ロゴはこのファイル。
Remotion で。動画プロジェクトは gitignore。
launch-video-method に従って。
```

エージェントは、シーンを組み立てる前に次の 3 点を書きます。

1. 参考クリップから借りるテンポと、借りない図形
2. 参考の各場面と製品の動作の対応表
3. 各ショットで画面に示す一文

そのあと製品を動かして画面をキャプチャし、レンダラーで静止画を確認してからシーンを組み立てます。画面上の数字や文言は、手で書いた JSON にしません。

## リポジトリ構成

```text
.
├── skills/launch-video-method/   # SKILL.md、reference.md、example.md
├── .claude-plugin/               # Claude Code プラグイン
├── assets/
│   ├── logo.png
│   └── samples/                  # README 用サンプル動画
└── scripts/check.py              # 公開前の静的チェック
```

## ライセンス

[MIT](LICENSE) — Copyright (c) 2026 [jammaru](https://github.com/jammaru)
