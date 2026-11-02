# コミットの基本

> 学べること: `git status` / `git add` / `git commit` / `git log`

## 状況

`aaa` というファイルが 1 行（`aaa`）だけ入った状態でコミットされています。
このリポジトリの最初の 3 コミット（`aaa` → `bbb` → `ccc`）を、自分の手で再現してみましょう。

## やること

1. `aaa` の末尾に `bbb` という行を追加して、**コミットする**
2. さらに `ccc` という行を追加して、**もう一度コミットする**

最終的に `aaa` は次の内容になり、`bbb` と `ccc` は別々のコミットで追加されている必要があります。

```text
aaa
bbb
ccc
```

## 始め方・採点

```bash
./practice.sh start 1               # 練習用リポジトリを作る（やり直すときも同じコマンド）
cd playground/01-first-commit
# ……ここで作業……
../../practice.sh check             # 採点（何度でも実行できます）
```

<details>
<summary>💡 ヒント</summary>

- 今どのファイルが変更されているかは `git status` で確認できます
- コミットは「`git add` でステージに載せる → `git commit` で記録する」の 2 段階です
- 履歴は `git log --oneline` で確認できます

</details>

<details>
<summary>✅ 解答例</summary>

```bash
echo bbb >> aaa
git add aaa
git commit -m "Add bbb"

echo ccc >> aaa
git add aaa
git commit -m "Add ccc"

git log --oneline
```

</details>
