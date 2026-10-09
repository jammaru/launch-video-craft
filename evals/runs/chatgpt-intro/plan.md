# ChatGPT ローンチフィルム — 制作計画（シーンファイルを開く前）

**形式:** 1920×1080、30fps、約 40 秒（参照クリップに合わせる）  
**参照:** 40 秒のプロダクトプロモ — ランドスケープ上のウィンドウ、大きなカーソル、クリックへのズーム、カラフルな幾何学図形の黒フィールド、ロゴロックアップで終わる  
**入力の現状:** 参照クリップはある想定。ロゴファイルは未供給。ロケールは未指定のため、計画段階では `en` を主、`ja` はキャプチャと別 composition として同型で追加可能とする。

**Remotion パッケージ（着手後）:** `video/chatgpt-intro/`（gitignore、製品 lockfile 外）

---

## 参照リサーチ（着手前に必ず書き留める）

参照をダウンロードし、`ffprobe` で duration / 解像度 / fps を記録。接触シート（全体 `fps=1/2`、ズーム区間は `fps=6` の短い strip）を取り、1 回は弧、1 回は 1 本のズームだけを見る。

### Borrow（借りるもの — タイミング図として）

| 借りる要素 | このフィルムでの使い方 |
| --- | --- |
| 低い地平線の空＋下帯の「場所」の上に UI ウィンドウが浮く構図 | 生成した新しい風景写真の上に macOS 風ウィンドウで ChatGPT を載せる |
| 見出し（ヘッドライン）が単独で読ませてから消え、ウィンドウが下から立ち上がる順序 | Hook → LogoReveal の前後関係に適用 |
| 巨大な黒カーソル、ビートに合わせた到着・クリック・退場 | 送信、モデル切替、ツール結果の行など「読ませたい 1 点」だけをクリック |
| クリック前後のカメラズーム（読むための scale 1.4–2.2、25–45 フレーム保持） | プロンプト入力、拒否メッセージ、コードブロック、ツール JSON の 1 行 |
| ショット長が「1 ビート」の倍数、カメラは ease、単体要素のみ spring | 120 BPM / 15 フレーム = 1 ビートのグリッドに全尺を載せる |
| エンディングの余白（ロゴロックアップ前の呼吸） | EndCard のフェードアウトとベッドの 2.5s フェード |

### Do not draw（描かない — 参照のモチーフを名指しで拒否）

参照（ChatGPT × 他プロダクト系プロモでよく見える形状）から **トレースしない** もの:

1. **黒背景のカラフル幾何学フィールド** — 丸・角丸矩形・斜めダッシュ枠・二色カプセル・角に付いた小さなスクエア装飾のランダム配置（Preflight 例で「rainbow geometry」として削除したのと同種）
2. **参照ブランドの UI アイコン・イラスト・マスコット** — チャットバブルの装飾画、製品ロゴの透かし、パートナーシップ用の並列ロゴレイアウト
3. **参照特有のレイアウトギャグ** — 複数アプリ窓を Figma フレーム風に並べる演出、幾何学シェイプで画面を切り替えるトランジション
4. **参照の色形状を ChatGPT ロゴの代わりに繰り返し押印する装飾** — 原則ショットはタイポのみ可、ロゴは Name ショット 1 回と EndCard 1 回だけ

**Principles ショット:** 上記幾何学の代わりに、**黒地＋タイプのみ**（装飾なし、ロゴなし）。参照の「黒フィールド」は **尺とトーン（静かな結論）だけ借り、中身は拒否**。

### Beat map（参照の呼吸 → ChatGPT）

| 参照のビート | 本フィルムで同じ役割を担うもの |
| --- | --- |
| 丘/草原の上のチャット系ウィンドウ | 生成バックドロップ上の **ChatGPT Web チャット**（キャプチャ済み会話） |
| プロンプト入力 → 送信 → 応答 | **Proof ショット:** まず拒否/限界（ポリシー・モデル限界・空応答）を画面に出し、理由を読ませてから修正プロンプトで成功 |
| 別サーフェスでの同じ「知能」の利用 | **Second actor:** Developer/API（キャプチャした API レスポンス JSON を mono 表示）*または* ツール呼び出し結果がチャットに現れる 1 ターン — 製品リサーチで「本当に存在する面」だけ採用 |
| 黒背景＋カラフル幾何学 | **削除 → Principles**（制約を 3–4 行の短文タイプ） |
| ロゴロックアップ | **EndCard**（供給された ChatGPT ロゴを組み立て済みで表示 + 取得先 1 行） |
| 大カーソル＋ズームクリック | 全プロダクトショット共通文法（Borrow どおり） |

*正直な equivalent が無い参照ビートは落とす。API 面を実行できない環境なら Second actor は「同じ会話内のツール/ブラウジング結果」に差し替え、API ショットは計画から削除する。*

---

## 一文の論旨（Argument）

**「同じ ChatGPT が、人の会話でも開発者の API でも同じように応答し、モデルと推論の深さは利用者が選べる。」**

各ショットはこの文の一部を **実行して成功が画面に出る** ことで証明する。証明できないショットは書かない。

---

## アクター（Research 後に確定するリスト — 計画上の候補）

1. **日常利用者** — Web チャット UI  
2. **開発者** — Chat Completions / Responses の JSON（製品が公式に提供するドキュメントどおりのフィールドのみ）  
3. **切り捨て候補:** スケジュール、エンタープライズ専用画面など、キャプチャパイプラインで再現できないもの

Hook は残したアクターに **1 行ずつ同じ動詞** → 共有の問い、で構成（ブランド登場前）。

---

## ショット一覧（1 ショット 1 文）

| ID | フレーム | 秒 (@30fps) | 1 文（実行する振る舞い） |
| --- | ---: | ---: | --- |
| Hook | 105 | 3.5 | 日常利用者・開発者（等）に短い行を出し、「誰が最初に聞く？」に相当する **1 つの問い** で締める（ChatGPT 名は出さない）。 |
| LogoReveal | 90 | 3.0 | 供給ロゴのパーツが組み立ち、**1 回だけ** タグライン（キャプチャ/公式コピー由来、創作スローガンは copy ファイルで明示的に「フィルム用」として管理）。 |
| ChatProof | 285 | 9.5 | 実チャットで **意図的に失敗するプロンプト** を送り、拒否/注意メッセージを読ませ、続けて修正プロンプトで **有用な応答** まで到達する。 |
| SecondSurface | 270 | 9.0 | 第二アクター（API JSON またはツール結果 1 件）で **同じ種類の助言** が再現されることを、キャプチャ文字列だけで見せる。 |
| Control | 240 | 8.0 | 利用者が **モデルまたは推論モード（Thinking 等、UI に実在する切替）** を変え、モード変更が次の応答の見え方に反映される 1 クリックを見せる。 |
| Principles | 120 | 4.0 | リサーチで得た **制約 3–4 条** を黒背景タイプのみで表示（幾何学・ロゴなし）。 |
| EndCard | 90 | 3.0 | ロゴ組み立て済み、製品名、**chat.openai.com / アプリ / API ドキュメント** など取得先 1 行、映像と音声を共にフェードアウト。 |

**合計: 1200 フレーム = 40.0 秒**（参照尺に一致。変更時は bed 再生成。）

---

## タイミンググリッド

- **fps:** 30  
- **音楽グリッド:** 120 BPM → **1 ビート = 15 フレーム**  
- **ショット長:** すべて 15 の倍数（上表どおり）  
- **シーン開始フレーム（累積）:**

| ショット | start | duration | end (exclusive) |
| --- | ---: | ---: | ---: |
| Hook | 0 | 105 | 105 |
| LogoReveal | 105 | 90 | 195 |
| ChatProof | 195 | 285 | 480 |
| SecondSurface | 480 | 270 | 750 |
| Control | 750 | 240 | 990 |
| Principles | 990 | 120 | 1110 |
| EndCard | 1110 | 90 | 1200 |

- **オーディオマーカー（`Video.tsx` と `make-audio.py` で同じ数値）:**  
  - `PRODUCT_START` = 195（LogoReveal 終了後）  
  - `PRINCIPLES_START` = 990  
  - `END_START` = 1110  
- **クリック・テキスト reveal:** 各シーン内ローカルフレームを `[at, …]` で定義し、**pop/click キューを同じ配列から import**（ずれ防止）  
- **典型モーション（reference 起点値）:** ウィンドウ立ち上がり spring（約 820px 下から）、カメラ scale 1 / 1.45 / 1.85、読み 30–40 フレーム、カーソル押下 ~10 フレーム dip + リング ~18 フレーム

---

## 実 ChatGPT UI のキャプチャ方針

**原則:** 画面上の **すべてのラベル・数値・会話文・エラーメッストリング** は実行結果のスナップショット由来。手編集 JSON 禁止。

1. **Research（Phase 1、ソースとスクリーンショット）**  
   - 実際に開く画面: ログイン後チャット、モデルピッカー、Thinking/推論 UI、（採用するなら）Developer ドキュメントのレスポンス例をそのまま返す API 呼び出し  
   - レンダラー: Web の DOM + 配布 CSS（ビルド済み stylesheet を `sync-assets` でコピー）、コンポーネントは可能なら公式/オープンな UI パッケージ、無ければ **シェルだけ再構築** し本文はキャプチャ HTML/JSON を流し込む  
   - UI ロケールと **会話/content ロケールを別設定**（片方だけ `ja` にすると拒否文だけ英語、等）

2. **Capture パイプライン（Phase 3）**  
   - `video/chatgpt-intro/capture/*.capture.ts`（または Playwright スクリプト）で **1 画面 1 ロケール 1 JSON**  
   - シナリオ例（ChatProof）:  
     - 空スレッド → 失敗プロンプト送信 → スナップショット `chat-refusal.json`  
     - 続け修正プロンプト → 成功応答 → `chat-success.json`  
     - アサーション: 拒否状態に期待キーワード、成功状態に `assistant` 本文が非空  
   - SecondSurface: `curl`/公式 SDK で API レスポンスを保存 `api-completion.json`（フィールド名は live レスポンスどおり）  
   - Control: モデル切替前後 2 スナップショット、または thinking トグル ON の 1 状態  
   - Vitest `-u` または CI 再実行で更新。失敗（wrong selector, locale）はコメントに記録して capture を直す

3. **Renderer 証明（Phase 4、シーンより前）**  
   - キャプチャ 1 件を real surface + shipped CSS + 正しい `data-theme` / font 変数で **1 still**  
   - 実アプリスクリーンショットと並べて一致確認。未スタイルなら CSS パス修正までシーン禁止

4. **Portal 対策**  
   - モーダル/トーストが `document.body` fixed なら、キャプチャから文言を読み、**通常フローで同 DS クラス** を再描画（Preflight confirm パターン）

5. **チャットの時間軸**  
   - メッセージを index ラップ、`REVEAL` 配列で出現、scroll bottom を 18 フレーム ease、カメラは同一 scroll を参照  
   -  composer は数文字ずつタイプ + caret、送信クリックはビート上

---

## ロゴが届いたときの扱い

**今は LogoReveal / EndCard をプレースホルダー（タイポのみの wordmark 禁止 — ロゴ未着なら Name ショットは「供給待ち」で尺だけ確保し、sync 前は render しない）**

ロゴ PNG 供給後、`scripts/sync-assets.mjs` で:

1. **パーツ決定:** マーク vs ワード、マーク内は **既に独立した形状**（円、バー、枠）のみ分割  
2. **計測:** 行/列の dark pixel カウント、マーク上にグリッド、`cropdetect` が効かない白背景は numpy/ffmpeg rawvideo  
3. **マスク切り出し:** ffmpeg `geq` + 円/矩形/残り、**強色背景** でフリンジ確認  
4. **ワード:** 共通 baseline origin + scale、水平オフセットは定数  
5. **アニメ:** Name ショットのみ — frame scale spring、dash wipe、badge pop+rotate、words rise（2 語目 +6 フレーム）  
6. **EndCard:** 組み立て済み静止、他ショットにロゴを散らさない  
7. **After film:** マークを square pad → アイコン、ロックアップ → README ヘッダ（Phase 9）

---

## バックドロップ

- **新規生成写真**（参照のコピー禁止）。構造: 16:9、**下 1/3 に穏やかな丘陵と野花、上は広い空と薄い雲、人物・建物・文字・ロゴなし**  
- ChatGPT のトーンに合わせて「穏やか・ daylight・浅い霞」程度だけ調整、構図は reference と同 **種類の場所**  
- `backdrop.jpg` ~1920 幅、`objectFit: cover`、scale ~1.06 + 極小 sin ドリフト（~0.08px/frame）  
- チャット内に「世界観用の画像」を載せる必要があれば **同じ backdrop** を再利用し一枚の世界にする

---

## ビジュアルシステム（着手順）

1. `src/copy.ts` — Hook/Principles/EndCard のフィルムコピーのみ（UI ラベルは製品 translation から）  
2. `src/captured/` — 上記 JSON  
3. `src/vendor/` — 配布 CSS  
4. Stage: Backdrop, Camera, Window (40px bar, traffic lights), Cursor, Headline  
5. Shell: スクリーンショット準拠のナビ・サイドバー、中身は captured  
6. 1 ショット 1 composition + 全尺 `ChatGPTIntro` / `ChatGPTIntroJa`

---

## サウンド（Phase 6）

- `make-audio.py`: bed 長 = 1200/30 s + 2.5s fade out、44.1kHz stereo  
- Hook / EndCard は quiet、PRODUCT 区間に groove、Principles は half-time kick  
- 効果音: click, tick, pop, whoosh, thud, chime — **プレースホルダーと明記**  
- キュー: `[localFrame, sound, volume]` → scene start を加算、`REVEAL` と共有

---

## レビューループ（Phase 7 — レンダーは評価タスク外だが計画に含める）

1. `npx tsc --noEmit`  
2. `--scale=0.5` ドラフト → 接触シートで空き 0.5s 超えと遅れテキスト  
3. 全クリック・全ズーム・全ロケールの **フル解像度 still**（半分 scale は 20px ズレを隠す）  
4. 修正は capture / anchors / headline shrink の **ソース** で行う  
5. 「参照っぽい」と言われたら **グラフィック削除・尺維持**

---

## 納品時レポート（Phase 8 でユーザーに伝える内容）

1. **Real:** チャット本文、拒否/警告文、API JSON フィールド、モデル名表示などキャプチャ由来の部分  
2. **Rebuilt shell:** ウィンドウ枠、サイドバー、composer 周辺で portal/CSS 都合で再構築した chrome  
3. **Invented:** 生成バックドロップ、合成 BGM/SFX、Hook/Principles/EndCard のフィルム用見出し（あれば）  
4. **Assets generated:** backdrop プロンプト、audio WAV  
5. **Fonts:** ラテンは Google Fonts subset、日本語は macOS Hiragino 等 **マシン依存**（他環境は代替と README 記載）  
6. **Unchecked:** 通常 **映像に対する耳での同期確認は未実施** と明示  
7. **Re-render:** composition 名、`npx remotion render` 例、尺変更時は capture + bed 再生成  
8. **Locales:** 出力した mp4 一覧と `ffprobe` 結果（h264 1920×1080 30fps aac）

---

## 着手前チェックリスト（Done when の写し）

- [ ] 本 plan の argument / beat map / shot 文を **いかなる Scene ファイルより前** に固定  
- [ ] 参照幾何学・パートナーロックアップレイアウトを描かない  
- [ ] ロゴは LogoReveal + EndCard のみ（ロゴ未到着時は該当ショットを block）  
- [ ] キャプチャ still で renderer 証明  
- [ ] 1200 フレーム = 40s、15 フレームビートグリッド  
- [ ] 製品 repo に Remotion を入れない

---

## ロゴ未供給時の Phase 0 アクション

参照クリップとロケールリストだけユーザーに確認。**ロゴ 1 ファイル** が届くまで LogoReveal/EndCard の sync は進めず、それ以外（research メモ、capture 脚本、ChatProof/Control の JSON、backdrop 生成、Principles コピー草案）は並行可。
