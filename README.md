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

[`launch-video-method`](skills/launch-video-method/SKILL.md) が本体です。技法は [`reference.md`](skills/launch-video-method/reference.md) にあります。[`example.md`](skills/launch-video-method/example.md) は、その手順で作った **1 本**（EmDash Preflight）の制作記録です。[`example-cli.md`](skills/launch-video-method/example-cli.md) は、UI のない製品（このスキル自身）の制作記録です。記録に出てくる問い、台詞、キャプチャの呼び出しはその製品向けなので、別の製品ではその製品用に書き直します。[`example-failures.md`](skills/launch-video-method/example-failures.md) は、失敗した 1 本をフレーム単位で測った記録です（読めない見出し、ボタンから外れたクリック、空白を映すカメラ、行われなかった確認）。[`kit/`](skills/launch-video-method/kit) は動画プロジェクトの雛形で、エージェントはここから作り始めます。kit の `npm run verify` は、クリック位置・ズーム位置・文字のコントラストを毎回検査し、確認用の静止画を書き出します。`npm run render` は、最新の verify が通り、静止画を確認した記録が NOTES.md にあるまで納品レンダーを拒否します。レンダー後は完成した mp4 からショットごとの静止画を書き出して検査し（`npm run inspect`）、`npm run finish` が通るまで完成とは扱いません。参照動画は尺ではなく「シーン構成と見せ方」の参考として使い、尺は製品に必要なショットの合計で決めます。

### このスキルで作った動画の例

| EmDash Preflight | ChatGPT |
| :---: | :---: |
| [![EmDash Preflight](assets/samples/emdash-preflight.webp)](https://x.com/jammaru_lab/status/2105501576437678510?s=20) | [![ChatGPT](assets/samples/chatgpt.webp)](https://x.com/jammaru_lab/status/2108406681839554662?s=20) |

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
Remotion で。
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
├── skills/launch-video-method/   # SKILL.md、reference.md、example*.md、kit/
├── .claude-plugin/               # Claude Code プラグイン
├── assets/
└── scripts/check.py              # 公開前の静的チェック
```

## ライセンス

[MIT](LICENSE) — Copyright (c) 2026 [jammaru](https://github.com/jammaru)
