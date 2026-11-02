# shellcheck shell=bash
check "main ブランチにいる" current_branch_is main
check "message.txt の誤字（teh → the）が修正されてコミットされている" committed_file_is HEAD message.txt "Thank you for the feedback."
check "作業途中の draft.txt はコミットに含まれていない" committed_file_is HEAD draft.txt "# Draft"
check "作業途中の draft.txt の変更が手元に戻っている" worktree_file_is draft.txt $'# Draft\nnew feature idea (work in progress)'
check "変更が残っているのは draft.txt だけ" output_is " M draft.txt" git status --porcelain
check "stash が空になっている（pop し忘れていない）" output_is "" git stash list
