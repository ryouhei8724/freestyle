# freestyle

Git を手を動かしながら練習するためのリポジトリです。

もともとは 2019 年に GitHub の操作を試すために作ったリポジトリで、ルートにある [`aaa`](aaa) はその時に作った最初のファイルです（記念にそのまま残しています）。
現在は、**自動採点つきの Git 練習問題** が入っています。

## 練習問題

| # | テーマ | 学べるコマンド |
| --- | --- | --- |
| 1 | [コミットの基本](exercises/01-first-commit/README.md) | `status` `add` `commit` `log` |
| 2 | [ブランチとマージ](exercises/02-branch-and-merge/README.md) | `switch -c` `branch` `merge` |
| 3 | [コンフリクトの解消](exercises/03-merge-conflict/README.md) | `merge` `merge --abort` |
| 4 | [変更の取り消し](exercises/04-undo-changes/README.md) | `restore` `revert` |
| 5 | [作業の一時退避（stash）](exercises/05-stash/README.md) | `stash` `stash pop` |
| 6 | [直前のコミットを直す（amend）](exercises/06-amend/README.md) | `commit --amend` |
| 7 | [リベースで履歴を一直線にする](exercises/07-rebase/README.md) | `rebase` |

## 使い方

```bash
git clone https://github.com/ryouhei8724/freestyle.git
cd freestyle

./practice.sh list        # 練習問題の一覧
./practice.sh start 1     # 練習問題 1 の練習用リポジトリを作る
cd playground/01-first-commit
# exercises/01-first-commit/README.md を読みながら作業する
../../practice.sh check   # 採点する
```

採点結果はこのように表示されます。

```text
📝 「ブランチとマージ」を採点します

  ✅ feature/dessert ブランチがある
  ✅ feature/dessert で menu.txt に cake が追加されている
  ❌ feature/dessert が main にマージされている
  ...
```

- 練習用リポジトリは `playground/` の下に作られます。`.gitignore` 済みなので、このリポジトリ自体を汚すことはありません
- 失敗しても `./practice.sh start <番号>` を実行すれば、いつでも最初からやり直せます
- 各問題の README に **ヒント** と **解答例** があります（クリックで開く折りたたみ形式）

### 必要なもの

- Git 2.23 以上（`git switch` / `git restore` を使うため。`git --version` で確認できます）
- bash（macOS・Linux のターミナル、Windows は [Git for Windows](https://gitforwindows.org/) に付属の Git Bash）

## 練習問題を追加するには

`exercises/<2桁の番号>-<名前>/` に次の 4 ファイルを置くと、自動的に一覧に表示されます。

| ファイル | 役割 |
| --- | --- |
| `README.md` | 問題文（1 行目の `# 見出し` がタイトルになる） |
| `setup.sh` | 練習用リポジトリの初期状態を作る |
| `check.sh` | `check "説明" コマンド...` の形で合格条件を並べる |
| `solution.sh` | 模範解答（テストで使う） |

共通の関数は [`exercises/lib.sh`](exercises/lib.sh) にあります。
「よくある間違い」を `tests/wrong-answers/<問題名>--<説明>.sh` に置くと、それが不合格になることもテストされます。

```bash
./tests/run.sh   # すべての練習問題について「初期状態は不合格」「模範解答は合格」「間違いは不合格」を確認
```

GitHub Actions で push のたびに Linux / macOS / Windows（Git Bash）でテストと [ShellCheck](https://www.shellcheck.net/) が実行されます。

## ディレクトリ構成

```text
.
├── aaa                 # 2019 年に作った最初のファイル
├── practice.sh         # 練習キットのコマンド（list / start / check / path）
├── exercises/          # 練習問題（問題文・初期状態・採点・模範解答）
│   └── lib.sh          # 採点用の共通関数
├── tests/              # 練習問題そのもののテスト
└── playground/         # 練習用リポジトリの作成先（Git 管理外）
```
