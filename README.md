# オープンテーブルフォーマットを読み解く

Parquet・Hive・Apache Kudu・Snowflake・Delta Lake・Apache Iceberg・Apache Hudi・Databricks を一本の歴史でつなぎ、オープンテーブルフォーマット（OTF）の仕組みと、従来の DB・データレイクとの違いを図解で解説する技術者向けの1ページサイトです。全9章・図解19点。

- 配信：Cloudflare Pages（ダッシュボードからの手動アップロード）。プロジェクト名は `open-table-format-guide`
- 予定URL：`https://open-table-format-guide.pages.dev/`（アップロードと Access 設定の後に有効）
- 公開範囲：本人限定（Cloudflare Access）
- 技術確認日：2026-10-14（`scripts/build.mjs` の `TECH_DATE`）

## 構成

| パス | 内容 |
|---|---|
| `src/sections/*.html` | 本文（章ごと、ファイル名順に連結）。`<!-- figure:ID -->` の位置に図が入る |
| `src/diagrams/*.mjs` | 図解（インラインSVG）。`lib.mjs` の部品で描き、色はページのCSSでライト／ダーク両対応 |
| `src/template.html` `src/styles.css` `src/app.js` | ページの枠、スタイル、目次・テーマ切替などの小さなスクリプト |
| `scripts/build.mjs` | `dist/client/index.html` を生成。目次の生成、図番号の採番、検査を行う |
| `public/` | `_headers`（noindex など）と favicon |

ビルド時に次を検査し、問題があれば失敗します。

- 図のラベルが枠からはみ出す可能性（文字幅の概算）
- 未定義・未使用・重複した図、重複したID、リンク先のないページ内リンク

## 構築と配備

公開範囲は**本人限定**（Cloudflare Access）です。配備は Cloudflare Pages へのダッシュボードからの手動アップロード（Direct Upload）で行います。

### 配信ファイルを作る

Node.js 24.19.0 で次を実行すると `dist/client/` に配信ファイル一式（`index.html`・`404.html`・`_headers`・`favicon.svg`）ができます。ページ本体は CSS・スクリプト・図をすべて埋め込んだ `index.html` 1つです。

```sh
npm ci
npm run build
cd dist/client && zip -r ../../open-table-format-guide-upload.zip .
```

### Cloudflare Pages に手動でアップロードする（初回）

1. ダッシュボードの Workers & Pages → 作成（Create application）→ Pages → 「ファイルをドラッグ＆ドロップ」（Drag and drop your files）を選ぶ。
2. プロジェクト名を `open-table-format-guide` にして、zip（または `dist/client` フォルダ）をアップロードし、デプロイする。URL は `https://<プロジェクト名>.pages.dev/`。名前が使われていると末尾に文字が付くので、実際の URL を控える。
3. すぐに Zero Trust → Access → Applications でセルフホスト型のアプリを追加し、`open-table-format-guide.pages.dev`（プレビュー用に `*.open-table-format-guide.pages.dev` も）を本人のメールアドレスだけに許可する。
4. 未ログインのブラウザで Access のログイン画面が出ること、ログイン後にページと図が表示されることを確かめる。
5. コンテンツ管理（openclaw-growth-command-center）のブランチ `claude/dreamy-davinci-osx1wx` を `main` にマージして、台帳への登録を反映する。URL が予定と違う場合は先に台帳を直す。

### 更新するとき

`npm run build` で作り直し、同じプロジェクトの「新しいデプロイを作成」から zip をアップロードします。Direct Upload のプロジェクトは、後から Git 連携に切り替えられません。

### 参考：Workers への配備

`wrangler.static.jsonc` は Cloudflare Workers（静的アセット）向けの設定で、`npm run deploy` で配備できます（`CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` が必要）。手動アップロードでは使いません。

## 内容の更新

本文は `src/sections/`、図は `src/diagrams/` を編集し、`npm run build` で確認します。製品の仕様やバージョンに関する記述を見直したときは、`scripts/build.mjs` の `TECH_DATE` を更新してください。
