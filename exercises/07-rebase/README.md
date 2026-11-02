# リベースで履歴を一直線にする

> 学べること: `git rebase`

## 状況

`feature/login` ブランチでログイン機能を作っている間に、`main` が先に進みました（`app.txt` が `version 2` に）。

```text
          A---B   feature/login（今ここ）
         /
    o---M         main
```

## やること

`feature/login` のコミット（A, B）を、最新の `main` の **後ろに付け直して**、履歴を一直線にしてください。

```text
    o---M---A'---B'   feature/login
        ↑
       main
```

- `main` ブランチ自体は変更しない
- マージコミットは作らない（`git merge` ではなく `git rebase` を使う）

## 始め方・採点

```bash
./practice.sh start 7               # 練習用リポジトリを作る（やり直すときも同じコマンド）
cd playground/07-rebase
# ……ここで作業……
../../practice.sh check             # 採点（何度でも実行できます）
```

<details>
<summary>💡 ヒント</summary>

- `git rebase <ベースにしたいブランチ>` は「今いるブランチのコミットを、指定したブランチの先端に付け直す」コマンドです
- 実行前と後で `git log --oneline --graph --all` を見比べると、何が起きたかよく分かります
- コンフリクトが起きたら、直して `git add` → `git rebase --continue`。やめるなら `git rebase --abort`
- リベースもコミットを作り直すので、**共有済みのブランチでは注意** が必要です

</details>

<details>
<summary>✅ 解答例</summary>

```bash
git switch feature/login
git rebase main
git log --oneline --graph --all
```

</details>
