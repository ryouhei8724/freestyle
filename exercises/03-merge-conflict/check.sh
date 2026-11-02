# shellcheck shell=bash
check "main ブランチにいる" current_branch_is main
check "マージが途中で止まっていない" no_operation_in_progress
check "feature/discount が main にマージされている" is_ancestor feature/discount main
check "最新のコミットがマージコミットになっている" git rev-parse -q --verify HEAD^2
check "price.txt にコンフリクトマーカーが残っていない" no_conflict_markers price.txt
check "price.txt が正しく解消されている（coffee: 450 / juice: 300）" committed_file_is HEAD price.txt $'# price list\ncoffee: 450\ntea: 400\njuice: 300'
check "コミットしていない変更が残っていない" worktree_is_clean
