# shellcheck shell=bash
setup_file_commit "config.txt" $'debug=false\nlanguage=ja' "Add config"
setup_file_commit "notes.txt" "meeting at 10:00" "Add notes"
setup_file_commit "config.txt" $'debug=true\nlanguage=ja' "Enable debug mode"
# 「みんなに共有済みのコミット」として採点時に使うので記録しておく
git rev-parse HEAD > "$(git rev-parse --git-dir)/practice-shared-commit"
# うっかり書いてしまった、まだコミットしていない変更
printf 'meeting at 10:00\nTODO: ???\n' > notes.txt
