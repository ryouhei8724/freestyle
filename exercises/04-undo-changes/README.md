# 変更の取り消し

> 学べること: `git restore`（未コミットの変更を捨てる）/ `git revert`（コミットを打ち消す）

## 状況

2 つの「やってしまった」が起きています。

1. `notes.txt` に、意味のない行（`TODO: ???`）をうっかり書き足してしまった（**まだコミットしていない**）
2. デバッグモードを有効にする「Enable debug mode」をコミットしてしまった。しかも **すでにチームに共有（push）済み**

## やること

1. `notes.txt` の未コミットの変更を捨てて、元に戻す
2. 「Enable debug mode」のコミットを **履歴を消さずに** 打ち消して、`config.txt` を `debug=false` に戻す

## 始め方・採点

```bash
./practice.sh start 4               # 練習用リポジトリを作る（やり直すときも同じコマンド）
cd playground/04-undo-changes
# ……ここで作業……
../../practice.sh check             # 採点（何度でも実行できます）
```

<details>
<summary>💡 ヒント</summary>

- 未コミットの変更を捨てるには `git restore <ファイル>` を使います（捨てた変更は戻せないので注意）
- 共有済みのコミットを `git reset` で消すと、他の人の履歴と食い違ってしまいます
- `git revert <コミット>` は「そのコミットと逆の変更をする新しいコミット」を作るので、共有済みの履歴でも安全です

</details>

<details>
<summary>✅ 解答例</summary>

```bash
git restore notes.txt
git revert HEAD        # エディタが開いたらメッセージはそのまま保存して閉じる

git log --oneline      # Revert "Enable debug mode" が増えていれば OK
```

</details>
