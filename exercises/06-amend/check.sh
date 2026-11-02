# shellcheck shell=bash
base_commit="$(cat "$(git rev-parse --git-dir)/practice-base-commit")"
check "main ブランチにいる" current_branch_is main
check "コミットの数が増えていない（修正は amend で行う）" output_is "$base_commit" git rev-parse HEAD~1
check "コミットメッセージが「Add stylesheet」に直っている" output_is "Add stylesheet" git log -1 --format=%s
check "最新のコミットに style.css が含まれている" committed_file_is HEAD style.css "body { color: navy; }"
check "最新のコミットに index.html の変更が含まれている" committed_file_is HEAD index.html $'<link rel="stylesheet" href="style.css">\n<h1>Hello</h1>'
check "コミットしていない変更が残っていない" worktree_is_clean
