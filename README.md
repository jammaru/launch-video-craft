<p align="center">
  <img src="assets/logo.png" alt="" width="160">
</p>

# Launch Video Skills

参考クリップのテンポに合わせて、実際の製品画面を使った短いローンチ動画を Remotion で作る Agent Skill です。

## これは何？

| スキル | 内容 |
| --- | --- |
| `launch-video-method` | 製品に依存しない手順と判断の基準 |
| `remotion-launch-video` | 1本のフィルムの実例（尺、キャプチャ、ロゴの切り出しなど） |

スキル定義は `skills/` にだけ置きます。

## インストール

### `npx skills add`（推奨）

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

### GitHub CLI

```bash
gh skill install jammaru/launch-video-skills --all --scope user
gh skill update launch-video-method remotion-launch-video
```

### Claude Code プラグイン

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

エージェントは、シーンを組み立てる前に次の3点を書きます。参考クリップから借りるテンポと借りない図形。参考の各場面と製品の動作の対応表。各ショットで画面に示す一文。

そのあと、製品を動かして画面をキャプチャし、レンダラーで静止画を確認してからシーンを組み立てます。画面上の数字や文言は、手で書いた JSON にしません。

`remotion-launch-video` は手順の参考です。別の製品では、そのキャプチャ用 API やショットの文言をそのまま写しません。

## ライセンス

[MIT](LICENSE)
