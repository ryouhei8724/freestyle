# shellcheck shell=bash
git switch -q main
git rebase -q feature/login
git switch -q feature/login
