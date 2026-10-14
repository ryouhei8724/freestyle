# オープンテーブルフォーマットを読み解く

Parquet・Hive・Apache Kudu・Snowflake・Delta Lake・Apache Iceberg・Apache Hudi・Databricks を一本の歴史でつなぎ、オープンテーブルフォーマット（OTF）の仕組みと、従来の DB・データレイクとの違いを図解で解説する技術者向けの1ページサイトです。全9章・図解19点。

- 配信：Cloudflare Workers（静的アセット）。Worker 名は `open-table-format-guide`
- 予定URL：`https://open-table-format-guide.ryouhei8724.workers.dev/`（配備と Access 設定の後に有効）
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

Node.js 24.19.0 で次の順に実行します。外部の依存は wrangler だけです。

```sh
npm ci
npm run build    # dist/client を生成
npm run deploy   # wrangler deploy --config wrangler.static.jsonc
```

公開範囲は**本人限定**です。既存の個人サイトと同じく、Cloudflare Access で Worker 全体を保護します。`account_id` は設定ファイルに書かず、Workers Builds では接続先のアカウントを使います。手元から配備する場合は `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を設定します。プレビューURLは無効です（`preview_urls: false`）。

### 配備の手順（初回）

1. Cloudflare ダッシュボードの Workers & Pages → 作成 → リポジトリをインポートで、このリポジトリの `main` を接続する。ビルドコマンドは `npm run build`、デプロイコマンドは `npm run deploy`、環境変数は `NODE_VERSION=24.19.0`。
2. 最初の配備は `workers_dev: false` のまま行われ、URL はまだ開かない。
3. Worker `open-table-format-guide` 全体を Cloudflare Access で保護し、許可するのが本人だけであることを確認する。
4. `wrangler.static.jsonc` の `workers_dev` を `true` に変えて `main` に push する。Workers Builds が再配備し、`https://open-table-format-guide.ryouhei8724.workers.dev/` が開く。
5. 未ログインのブラウザで Access のログイン画面が出ること、ログイン後にページと図が表示されることを確かめる。
6. コンテンツ管理（openclaw-growth-command-center）のブランチ `claude/dreamy-davinci-osx1wx` を `main` にマージして、台帳への登録を反映する。

## 内容の更新

本文は `src/sections/`、図は `src/diagrams/` を編集し、`npm run build` で確認します。製品の仕様やバージョンに関する記述を見直したときは、`scripts/build.mjs` の `TECH_DATE` を更新してください。
