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

このリポジトリは private です。`npx skills` も `gh skill` も、すでに通っている GitHub の認証で clone します。公開後もコマンドは同じです。

すべてのエージェントへ、このプロジェクトの中に入れる場合:

```bash
npx skills add jammaru/launch-video-skills --all
```

すべてのプロジェクトから使う場合は `-g` を付けます。

```bash
npx skills add jammaru/launch-video-skills -g --all
```

一つのスキルだけ、またはエージェントを指定する場合:

```bash
npx skills add jammaru/launch-video-skills --list
npx skills add jammaru/launch-video-skills --skill launch-video-method -a cursor -a claude-code -a codex
```

GitHub CLI では同じリポジトリを次で入れます。`gh skill` は GitHub CLI 2.97 以降です。

```bash
gh skill install jammaru/launch-video-skills --all --scope user
gh skill install jammaru/launch-video-skills launch-video-method --agent cursor --scope project
gh skill install jammaru/launch-video-skills launch-video-method@v0.1.0
```

`--agent` には `cursor`、`claude-code`、`codex`、`github-copilot` などを指定します。プロジェクトスコープでは、複数のエージェントが `.agents/skills` を共有します。

## 更新する

インストールした側:

```bash
npx skills update
npx skills update -g
npx skills update launch-video-method remotion-launch-video

gh skill update --all
```

`npx skills update` は、`skills add` が書いたロックファイルの出典を取り直します。プロジェクトに入れた分は `npx skills update -p`、ユーザー全体に入れた分は `-g` です。

配布側で版を上げるときは、次を揃えてからタグを打ちます。

- `skills/*/SKILL.md` の `metadata.version`
- `.claude-plugin/plugin.json` の `version`
- `CHANGELOG.md`

```bash
python3 scripts/check.py
git tag v0.1.1
gh release create v0.1.1 --generate-notes
```

`gh skill install ...@v0.1.1` はそのタグを取ります。`--pin` を付けて入れたスキルは、`gh skill update` では動きません。

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

Install with `npx skills add jammaru/launch-video-skills --all`, or `npx skills add jammaru/launch-video-skills -g --all` for every project. Update with `npx skills update`. GitHub CLI 2.97 and later can do the same with `gh skill install jammaru/launch-video-skills --all` and `gh skill update --all`. The repository is private, so the command uses your existing GitHub login. A release tag such as `v0.1.0` is what `gh skill install ...@v0.1.0` fetches.

Check the package with `python3 scripts/check.py`. Prompt evals live in `evals/`. An eval run records a result. It does not edit the skills.

## License

[MIT](LICENSE)
