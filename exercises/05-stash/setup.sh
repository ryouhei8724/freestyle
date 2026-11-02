# shellcheck shell=bash
setup_file_commit "message.txt" "Thank you for teh feedback." "Add thank-you message"
setup_file_commit "draft.txt" "# Draft" "Add draft"
# 作業途中の変更（まだコミットしたくない）
printf '# Draft\nnew feature idea (work in progress)\n' > draft.txt
