# 作業の一時退避（stash）

> 学べること: `git stash` / `git stash pop`

## 状況

`draft.txt` で新機能のアイデアを書いている途中（**まだコミットしたくない**）です。
そこへ「`message.txt` の誤字（`teh` → `the`）を今すぐ直して！」と頼まれました。

## やること

1. 作業途中の変更を `git stash` で一時退避する
2. `message.txt` の `teh` を `the` に直して、**その修正だけ** をコミットする
3. `git stash pop` で作業途中の変更を元に戻す（コミットはしない）

## 始め方・採点

```bash
./practice.sh start 5               # 練習用リポジトリを作る（やり直すときも同じコマンド）
cd playground/05-stash
# ……ここで作業……
../../practice.sh check             # 採点（何度でも実行できます）
```

<details>
<summary>💡 ヒント</summary>

- `git stash` すると作業ツリーがきれいな状態（最後のコミットの状態）に戻ります
- 退避中の変更は `git stash list` で確認できます
- `git stash pop` は退避した変更を戻して、stash の一覧からも消します

</details>

<details>
<summary>✅ 解答例</summary>

```bash
git stash
sed -i 's/teh/the/' message.txt   # エディタで直しても OK（macOS の場合は sed -i '' ...）
git add message.txt
git commit -m "Fix typo in thank-you message"
git stash pop
git status                        # draft.txt だけが変更ありになっていれば OK
```

</details>
