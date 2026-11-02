# shellcheck shell=bash
check "feature/dessert ブランチがある" branch_exists feature/dessert
check "feature/dessert で menu.txt に cake が追加されている" committed_file_is feature/dessert menu.txt $'coffee\ntea\ncake'
check "feature/dessert が main にマージされている" is_ancestor feature/dessert main
check "main の menu.txt に cake が入っている" committed_file_is main menu.txt $'coffee\ntea\ncake'
check "main ブランチに戻っている" current_branch_is main
check "コミットしていない変更が残っていない" worktree_is_clean
