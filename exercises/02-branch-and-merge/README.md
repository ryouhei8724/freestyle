# ブランチとマージ

> 学べること: `git switch -c` / `git branch` / `git merge`

## 状況

カフェのメニュー `menu.txt`（`coffee` と `tea`）があります。
デザートを追加したいのですが、`main` を直接いじらずに **ブランチで作業してからマージ** してみましょう。

## やること

1. `feature/dessert` ブランチを作って切り替える
2. `menu.txt` の末尾に `cake` を追加してコミットする
3. `main` ブランチに戻る
4. `feature/dessert` を `main` にマージする

## 始め方・採点

```bash
./practice.sh start 2               # 練習用リポジトリを作る（やり直すときも同じコマンド）
cd playground/02-branch-and-merge
# ……ここで作業……
../../practice.sh check             # 採点（何度でも実行できます）
```

<details>
<summary>💡 ヒント</summary>

- ブランチの作成と切り替えは `git switch -c <ブランチ名>` で一度にできます
- 今いるブランチは `git branch` で確認できます（`*` が付いているもの）
- マージは「取り込む側」のブランチにいる状態で `git merge <取り込みたいブランチ>` を実行します
- `git log --oneline --graph --all` でブランチの関係が図で見られます

</details>

<details>
<summary>✅ 解答例</summary>

```bash
git switch -c feature/dessert
echo cake >> menu.txt
git add menu.txt
git commit -m "Add cake to menu"

git switch main
git merge feature/dessert
```

</details>
