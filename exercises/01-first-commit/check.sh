# shellcheck shell=bash
check "main ブランチにいる" current_branch_is main
check "コミットが 3 つ以上ある" commit_count_at_least 3
check "1 つ前のコミットで aaa に bbb が追加されている" committed_file_is HEAD~1 aaa $'aaa\nbbb'
check "最新のコミットで aaa に ccc が追加されている" committed_file_is HEAD aaa $'aaa\nbbb\nccc'
check "コミットしていない変更が残っていない" worktree_is_clean
