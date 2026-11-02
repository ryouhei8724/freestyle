# コンフリクトの解消

> 学べること: マージコンフリクトの読み方と解消のしかた

## 状況

価格表 `price.txt` を、2 つのブランチで別々に変更してしまいました。

| ブランチ | coffee | juice |
| --- | --- | --- |
| `main` | 500 → **550** に値上げ | 350 のまま |
| `feature/discount` | 500 → **450** に値下げ | 350 → **300** に値下げ |

同じ `coffee` の行を両方で変えているので、マージすると **コンフリクト（衝突）** が起きます。

## やること

`main` に `feature/discount` をマージし、話し合いの結果どおり **割引を採用** してください。
最終的な `price.txt` は次の内容にします。

```text
# price list
coffee: 450
tea: 400
juice: 300
```

## 始め方・採点

```bash
./practice.sh start 3               # 練習用リポジトリを作る（やり直すときも同じコマンド）
cd playground/03-merge-conflict
# ……ここで作業……
../../practice.sh check             # 採点（何度でも実行できます）
```

<details>
<summary>💡 ヒント</summary>

- コンフリクトが起きると、ファイルの中に次のような印が書き込まれます

  ```text
  <<<<<<< HEAD
  coffee: 550          ← 今いるブランチ（main）の内容
  =======
  coffee: 450          ← マージしようとしたブランチの内容
  >>>>>>> feature/discount
  ```

- エディタで **印ごと** 消して、残したい内容だけにします
- `juice` の行は片方のブランチでしか変えていないので、Git が自動でマージしてくれています
- 直したら `git add price.txt` → `git commit` でマージを完了させます
- 途中でやめたくなったら `git merge --abort` でマージ前に戻れます

</details>

<details>
<summary>✅ 解答例</summary>

```bash
git merge feature/discount     # CONFLICT と表示される
# price.txt をエディタで開き、<<<<<<< / ======= / >>>>>>> の行と
# 「coffee: 550」の行を消して保存する
git add price.txt
git commit                     # マージコミットのメッセージはそのままで OK
```

</details>
