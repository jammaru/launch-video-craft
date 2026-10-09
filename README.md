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

エージェントに「いい感じの PV」と頼むと、参考動画の図形をなぞるか、UI を手描きするか、どちらかに寄りがちです。このパッケージは、その前に書くものと、その後の手順を一つのスキルにまとめてあります。

| スキル | 内容 |
| --- | --- |
| [`launch-video-method`](skills/launch-video-method/SKILL.md) | 手順と判断の基準。実例は同じスキルの [`example.md`](skills/launch-video-method/example.md) |

スキル定義は [`skills/`](skills/) にだけ置きます。`npx skills add` や Claude Code プラグインはここを参照します。

`example.md` は、1本のフィルムで手順がどうなったかの記録です。尺、キャプチャで詰まった箇所、ロゴの切り出し、レビューで二度削ったショットが入っています。別の製品では、その質問、背景、キャプチャ用 API、ショットの文言を写しません。写すのは判断です。

以前 `remotion-launch-video` を入れている場合は、配布が一つになったので外します。

```bash
npx skills remove remotion-launch-video
```

## インストール

### 1. `npx skills add`（推奨）

```bash
npx skills add jammaru/launch-video-skills --all
```

すべてのプロジェクトで使う場合は `-g` を付けます。

```bash
npx skills add jammaru/launch-video-skills -g --all
```

更新:

```bash
npx skills update launch-video-method
```

### 2. GitHub CLI

`gh skill` は GitHub CLI 2.97 以降です。

```bash
gh skill install jammaru/launch-video-skills --all --scope user
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

そのあと、製品を動かして画面をキャプチャし、レンダラーで静止画を確認してからシーンを組み立てます。画面上の数字や文言は、手で書いた JSON にしません。

## リポジトリ構成

```text
.
├── skills/launch-video-method/   # 正本。SKILL.md、reference.md、example.md
├── .claude-plugin/               # Claude Code プラグイン
├── assets/logo.png
└── scripts/check.py              # 公開前の静的チェック
```

## ライセンス

[MIT](LICENSE) — Copyright (c) 2026 [jammaru](https://github.com/jammaru)
