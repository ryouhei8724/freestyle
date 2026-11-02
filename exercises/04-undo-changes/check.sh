# shellcheck shell=bash
shared_commit="$(cat "$(git rev-parse --git-dir)/practice-shared-commit")"
check "notes.txt の未コミットの変更が取り消されている" worktree_file_is notes.txt "meeting at 10:00"
check "共有済みの履歴を消していない（reset ではなく revert を使う）" is_ancestor "$shared_commit" HEAD
check "最新のコミットが「Enable debug mode」を打ち消すコミットになっている" output_matches '^Revert "Enable debug mode"' git log -1 --format=%s
check "config.txt が debug=false に戻っている" committed_file_is HEAD config.txt $'debug=false\nlanguage=ja'
check "リバートが途中で止まっていない" no_operation_in_progress
check "コミットしていない変更が残っていない" worktree_is_clean
