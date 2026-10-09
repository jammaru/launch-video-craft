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

エージェントに「いい感じの PV」と頼むと、参考動画の図形をなぞるか、UI を手描きするか、どちらかに寄りがちです。このパッケージは、その前に書くものと、その後の手順をスキルとして分けてあります。

| スキル | 内容 |
| --- | --- |
| [`launch-video-method`](skills/launch-video-method/SKILL.md) | 製品に依存しない手順と判断の基準 |
| [`remotion-launch-video`](skills/remotion-launch-video/SKILL.md) | 1 本のフィルムの実例（尺、キャプチャ、ロゴの切り出しなど） |

スキル定義は [`skills/`](skills/) にだけ置きます。`npx skills add` や Claude Code プラグインはここを参照します。

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
npx skills update launch-video-method remotion-launch-video
```

### 2. GitHub CLI

```bash
gh skill install jammaru/launch-video-skills --all --scope user
gh skill update launch-video-method remotion-launch-video
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

[`remotion-launch-video`](skills/remotion-launch-video/SKILL.md) は手順の参考です。別の製品では、そのキャプチャ用 API やショットの文言をそのまま写しません。

## リポジトリ構成

```text
.
├── skills/                 # スキル本体（正本）
│   ├── launch-video-method/
│   └── remotion-launch-video/
├── .claude-plugin/         # Claude Code プラグイン
├── assets/logo.png
└── scripts/check.py        # 公開前の静的チェック
```

## ライセンス

[MIT](LICENSE) — Copyright (c) 2026 [jammaru](https://github.com/jammaru)
