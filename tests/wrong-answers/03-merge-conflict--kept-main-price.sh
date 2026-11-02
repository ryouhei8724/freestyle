# shellcheck shell=bash
git merge -q --no-edit feature/discount > /dev/null 2>&1 || true
git checkout -q --ours price.txt
git add price.txt
git commit -q --no-edit
