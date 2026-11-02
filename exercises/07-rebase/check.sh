# shellcheck shell=bash
main_commit="$(cat "$(git rev-parse --git-dir)/practice-main-commit")"
check "main ブランチは変更していない" output_is "$main_commit" git rev-parse main
check "feature/login が最新の main の上に乗っている" is_ancestor main feature/login
check "feature/login にマージコミットがない（一直線の履歴）" output_is "" git rev-list --merges main..feature/login
check "feature/login 独自のコミットが 2 つのまま" output_is 2 git rev-list --count main..feature/login
check "feature/login に main の変更（version 2）が反映されている" committed_file_is feature/login app.txt "version 2"
check "feature/login に login.txt がある" git cat-file -e feature/login:login.txt
check "feature/login に logout.txt がある" git cat-file -e feature/login:logout.txt
check "リベースが途中で止まっていない" no_operation_in_progress
check "コミットしていない変更が残っていない" worktree_is_clean
