<p align="center">
  <img src="assets/logo.png" alt="" width="160">
</p>

<h1 align="center">Launch Video Skills</h1>

<p align="center">
  参考動画のテンポで、本物の画面を映すローンチ動画を作るためのスキルです。<br>
  MIT。バージョンは <code>0.1.0</code>。
</p>

エージェントに「いい感じのPVを」と頼むと、参考動画の図形をなぞるか、UIを手描きするか、どちらかになりやすいです。このスキルは、その前に書くもの（借りるもの、描かないもの、主張、ショットの一文）と、その後の手順（実データのキャプチャ、レンダラーの確認、ロゴの分解、ビート、レビュー）を分けてあります。

## 入っているもの

| スキル | 役割 |
| --- | --- |
| `launch-video-method` | 次の動画を作るときの考え方と手順。製品には依存しません。 |
| `remotion-launch-video` | 1本作ったフィルムの実例。尺、キャプチャで詰まった箇所、ロゴの分け方、確認コマンド。 |

正本は `skills/` です。`.agents/skills`、`.claude/skills`、`.cursor/skills`、`.github/skills` は同じディレクトリへのリンクです。

## 使い方

このリポジトリをエージェントが読める場所に置いたうえで、たとえばこう頼む。

> このプロダクトのローンチ動画を作って。参考動画はこれ。ロゴはこのファイル。Remotion で。動画プロジェクトは gitignore。`launch-video-method` に従って。

渡すものは三つです。参考動画、ロゴ、言語。どれかが無いときだけ、エージェントはそれだけを聞きます。

エージェントが先に書くものは次のとおりです。

1. 参考動画から借りるもの（尺、窓の入り、ズーム、カーソル）と、描かないもの（そのブランドの図形）。名前を付ける。
2. 場面の対応表。参考の各場面が、この製品のどの動作に対応するか。対応が無い場面は作らない。
3. 実証できる主張を一文。ショットは「実行できる振る舞い」を一文ずつ。
4. ロゴは一枚絵として受け取る。すでに独立した形だけを動かす。組み立ては導入の一度、エンドカードでもう一度。

そのあとで、製品を実際に動かしてレスポンスを保存し、本物のレンダラーで静止画を一枚出してからシーンを作ります。画面の数字や文章は、手で書いた JSON にしません。

実例のフィルム（公開ゲートのプラグイン、約49.5秒、英語と日本語）でこの順番がどうなったかは `remotion-launch-video` にあります。別の製品では、そのキャプチャAPIやショット文をコピーしません。

## 導入

クライアントは見る場所が違います。このリポジトリを開いている間は、下のリンクのどれかをそのクライアントが読みます。

| クライアント | このリポジトリ内 | ユーザー全体に置く場合 |
| --- | --- | --- |
| Codex、その他 `.agents` を読むもの | `.agents/skills/` | `~/.agents/skills/` |
| Claude Code | `.claude/skills/` またはプラグイン | `~/.claude/skills/` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| GitHub Copilot（リポジトリの skills を読む場合） | `.github/skills/` | クライアントの指定する skills ディレクトリ |

### リポジトリを開く

```bash
git clone <this-repo> launch-video-skills
cd launch-video-skills
```

リンクが展開されない環境では、次で作り直します。

```bash
./scripts/link-skills.sh
```

### 今のユーザーの skills にコピーする

ホームへコピーすると、他のプロジェクトからも使えます。更新するときは同じコマンドをもう一度実行します。コピー先にある同名ディレクトリは置き換わります。

```bash
./scripts/install.sh all          # cursor, claude, codex
./scripts/install.sh cursor
./scripts/install.sh claude
./scripts/install.sh codex
./scripts/install.sh ~/some/skills
```

### Claude Code のプラグイン

マニフェストは `.claude-plugin/plugin.json` です。スキルは `skills/` にあります。

```bash
claude --plugin-dir /path/to/launch-video-skills
```

セッション中にディレクトリから読み込む場合は、Claude Code の `/plugin` でこのディレクトリをローカルプラグインとして追加します。スキル名は `launch-video-skills:launch-video-method` のようにプラグイン名が前に付きます。

### 一つのスキルだけ

`skills/launch-video-method` を、使っているクライアントの skills ディレクトリに置きます。ディレクトリ名と `SKILL.md` の `name` は同じにしてください。`remotion-launch-video` は実例なので、方法だけ欲しい場合は外して構いません。

## 更新する

バージョンは三箇所で揃えます。

- `skills/*/SKILL.md` の `metadata.version`
- `.claude-plugin/plugin.json` の `version`
- `CHANGELOG.md`

手順は次のとおりです。

1. `CHANGELOG.md` に、なぜ変えたかを書く。
2. 上の三箇所のバージョンを上げる。
3. `python3 scripts/check.py` を実行する。個人のパスが混ざっていないこと、必須の節があることを見ます。
4. スキル本文を評価で直す場合は、`evals/README.md` の手順で結果を残してから直す。評価の実行そのものはスキルを書き換えません。
5. ホームにコピーして使っている人は `./scripts/install.sh all` をやり直す。clone で使っている人は `git pull` です。

## 評価

再現できるかは、スキル本文だけを渡した別の実行で見ます。プロンプトと期待する中身は `evals/evals.json` です。静的な確認は次です。

```bash
python3 scripts/check.py
```

合格しても動画が良いかは分かりません。静的確認は、個人のパスが無いこと、フロントマターが仕様に合うこと、今回の制作で実際に使った判断（対応表、三層、ロゴの分解、ビート、レビューで削ること）が本文に残っていることを見ます。

プロンプト評価のやり方と、評価したらスキルを自動で直さないことは `evals/README.md` に書いてあります。

## English

Two Agent Skills for a short Remotion launch film. `launch-video-method` is the method. `remotion-launch-video` is one finished film, kept as a worked example. The source of truth is `skills/`. The other skill directories are symlinks.

Give the agent a reference clip, a logo file, and the locales. It should write a borrow list, a do-not-draw list, a beat map, and one sentence per shot before it opens a scene. On-screen product text comes from running the product.

Install by opening this repository, by `./scripts/install.sh all`, or by pointing Claude Code at it with `--plugin-dir`. Update by bumping `metadata.version`, `plugin.json`, and `CHANGELOG.md` together, then re-running the install script if you copied the skills into a home directory.

Check the package with `python3 scripts/check.py`. Prompt evals live in `evals/`. An eval run records a result. It does not edit the skills.

## License

[MIT](LICENSE)
