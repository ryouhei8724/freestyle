# shellcheck shell=bash
# 練習問題の setup.sh / check.sh / solution.sh から読み込まれる共通関数。
# practice.sh が練習用リポジトリ（playground）をカレントディレクトリにした状態で source する。

# ---------- setup 用 ----------

# 練習問題の「初期状態」を作るコミット。
# 利用者のグローバル設定（GPG 署名・フックなど）に左右されないよう固定の値でコミットする。
setup_commit() {
  GIT_AUTHOR_NAME="Practice Setup" GIT_AUTHOR_EMAIL="setup@example.com" \
  GIT_COMMITTER_NAME="Practice Setup" GIT_COMMITTER_EMAIL="setup@example.com" \
    git -c commit.gpgsign=false -c core.hooksPath=/dev/null commit -q -m "$1"
}

# ファイルを書いて add + コミットする。例: setup_file_commit "aaa" "aaa" "Create aaa"
setup_file_commit() {
  printf '%s\n' "$2" > "$1"
  git add -- "$1"
  setup_commit "$3"
}

# ---------- check 用 ----------

_check_failed=0

# check "説明" コマンド...
# コマンドが成功すれば ✅、失敗すれば ❌ を表示する。
check() {
  local description="$1"
  shift
  if "$@" > /dev/null 2>&1; then
    printf '  \342\234\205 %s\n' "$description"
  else
    printf '  \342\235\214 %s\n' "$description"
    _check_failed=1
  fi
}

# すべての check の結果をまとめて終了コードにする。
finish_check() {
  echo
  if [ "$_check_failed" -eq 0 ]; then
    echo "🎉 クリア！すべてのチェックに合格しました。"
    return 0
  fi
  echo "まだ合格していない項目があります。README のヒントを見てみましょう。"
  return 1
}

# 改行コード（CRLF）の違いを無視して内容を比較する。
_normalize() { tr -d '\r'; }

# コミット済みの内容を比較する: committed_file_is <rev> <path> <期待する内容>
committed_file_is() {
  [ "$(git show "$1:$2" 2>/dev/null | _normalize)" = "$3" ]
}

# 作業ツリー上のファイル内容を比較する: worktree_file_is <path> <期待する内容>
worktree_file_is() {
  [ -f "$1" ] && [ "$(_normalize < "$1")" = "$2" ]
}

# 未コミットの変更・未追跡ファイルがないか
worktree_is_clean() {
  [ -z "$(git status --porcelain)" ]
}

# 現在のブランチ名が一致するか
current_branch_is() {
  [ "$(git symbolic-ref --short -q HEAD)" = "$1" ]
}

# ブランチが存在するか
branch_exists() {
  git show-ref --verify --quiet "refs/heads/$1"
}

# <ancestor> が <rev> の履歴に含まれているか
is_ancestor() {
  git merge-base --is-ancestor "$1" "$2"
}

# HEAD からたどれるコミット数が N 以上か
commit_count_at_least() {
  [ "$(git rev-list --count HEAD 2>/dev/null || echo 0)" -ge "$1" ]
}

# マージやリバートなどの途中で止まっていないか
no_operation_in_progress() {
  local git_dir
  git_dir="$(git rev-parse --git-dir)"
  [ ! -e "$git_dir/MERGE_HEAD" ] && [ ! -e "$git_dir/REVERT_HEAD" ] &&
    [ ! -e "$git_dir/CHERRY_PICK_HEAD" ] && [ ! -d "$git_dir/rebase-merge" ] &&
    [ ! -d "$git_dir/rebase-apply" ]
}

# ファイルにコンフリクトマーカーが残っていないか
no_conflict_markers() {
  ! grep -qE '^(<<<<<<<|=======|>>>>>>>)' "$1"
}

# コマンドの出力が期待どおりか: output_is <期待する出力> コマンド...
output_is() {
  local expected="$1"
  shift
  [ "$("$@" 2>/dev/null | _normalize)" = "$expected" ]
}

# コマンドの出力が正規表現（ERE）に合うか: output_matches <正規表現> コマンド...
output_matches() {
  local pattern="$1"
  shift
  "$@" 2>/dev/null | _normalize | grep -E -- "$pattern" > /dev/null
}
