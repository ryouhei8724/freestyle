# オープンテーブルフォーマットを読み解く

Parquet・Hive・Apache Kudu・Snowflake・Delta Lake・Apache Iceberg・Apache Hudi・Databricks を一本の歴史でつなぎ、オープンテーブルフォーマット（OTF）の仕組みと、従来の DB・データレイクとの違いを図解で解説する技術者向けの1ページサイトです。全9章・図解19点。

- 配信：Cloudflare Workers（静的アセット）。Worker 名は `open-table-format-guide`
- 予定URL：`https://open-table-format-guide.ryouhei8724.workers.dev/`（配備後に有効）
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

`account_id` は公開リポジトリに置かないため `wrangler.static.jsonc` から省いています。

- **Workers Builds（推奨）**：Cloudflare ダッシュボードの Workers & Pages → 作成 → リポジトリをインポートで、このリポジトリを接続します。ビルドコマンドは `npm run build`、デプロイコマンドは `npm run deploy`、環境変数は `NODE_VERSION=24.19.0` にします。
- **手元から**：`CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を設定して `npm run deploy` を実行します。

本人限定で公開する場合は、既存サイトと同じく、最初の配備の後に Worker 全体を Cloudflare Access で保護し、保護を確認してから workers.dev の URL を共有します。プレビューURLは無効です（`preview_urls: false`）。

## 内容の更新

本文は `src/sections/`、図は `src/diagrams/` を編集し、`npm run build` で確認します。製品の仕様やバージョンに関する記述を見直したときは、`scripts/build.mjs` の `TECH_DATE` を更新してください。
