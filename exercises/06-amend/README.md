# 直前のコミットを直す（amend）

> 学べること: `git commit --amend`

## 状況

スタイルシートを追加するコミットをしたのですが、2 つミスがありました。

1. 新しく作った `style.css` を `git add` し忘れて、コミットに入っていない
2. コミットメッセージが `Add stylsheet` になっている（正しくは `Add stylesheet`）

まだ誰にも共有していないので、**コミットを増やさずに** 直前のコミットを修正しましょう。

## やること

- `style.css` を直前のコミットに含める
- コミットメッセージを `Add stylesheet` に直す
- コミットの数は増やさない

## 始め方・採点

```bash
./practice.sh start 6               # 練習用リポジトリを作る（やり直すときも同じコマンド）
cd playground/06-amend
# ……ここで作業……
../../practice.sh check             # 採点（何度でも実行できます）
```

<details>
<summary>💡 ヒント</summary>

- `git commit --amend` は「直前のコミットを作り直す」コマンドです
- ステージに載せた変更があれば、それも直前のコミットに追加されます
- `-m "メッセージ"` を付けるとメッセージも同時に書き換えられます
- amend はコミットを作り直すので、**共有済みのコミットには使わない** のがルールです

</details>

<details>
<summary>✅ 解答例</summary>

```bash
git add style.css
git commit --amend -m "Add stylesheet"
git show --stat HEAD     # style.css と index.html が両方入っていれば OK
```

</details>
