# shellcheck shell=bash
git merge -q --no-edit feature/discount > /dev/null 2>&1 || true
git merge --abort
