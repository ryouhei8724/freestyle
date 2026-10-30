# freestyle

## llm-forecast

オープンウェイトのLLMがClaude Opus 5.5の水準に並ぶ時期を、モデルの大きさ・公開時期・スコアの3軸で示したページです（2026年10月30日時点、Artificial Analysis総合指数v5）。

- `llm-forecast/index.html` ページ本体
- `llm-forecast/data/models.csv` モデルごとのスコア・公開日・総パラメータ数（出典URLつき）
- `llm-forecast/data/forecast.csv` マシン区分ごとの到達時期の予想（Claudeによる推定）
- `llm-forecast/runtime.js` CSVを読み込んで図を描き直す小さな実行部
- `llm-forecast/vendor/` d3 v7.9.0（ISCライセンス）

CSVを書き換えてpushすると、図と表もその値で描き直されます。

手動アップロード用の1ファイル版（`llm-forecast-upload/index.html`）は、CSVを書き換えたあとリポジトリのルートで次を実行すると作り直せます。

```
python3 scripts/build_single_file.py
```

### Cloudflareへのデプロイ

`wrangler.jsonc` は `llm-forecast` フォルダを静的サイトとして配信するCloudflare Workersの設定です。

1. Cloudflareダッシュボードの「Workers & Pages」→「Create」→「Import a repository」で、このリポジトリを選ぶ
2. デプロイコマンドは既定の `npx wrangler deploy` のままにする（ビルドコマンドは不要）
3. 以後、本番ブランチにpushするたびに自動で公開される

ローカルで確認するときは、リポジトリのルートで `npx wrangler dev` を実行するか、`llm-forecast` フォルダを任意の静的サーバーで配信します（CSVを読み込むため、ファイルを直接開くだけでは表示されません）。
