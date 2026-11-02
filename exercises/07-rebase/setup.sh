# shellcheck shell=bash
setup_file_commit "app.txt" "version 1" "Add app"
git switch -q -c feature/login
setup_file_commit "login.txt" "login form" "Add login form"
setup_file_commit "logout.txt" "logout button" "Add logout button"
git switch -q main
setup_file_commit "app.txt" "version 2" "Bump version to 2"
git rev-parse main > "$(git rev-parse --git-dir)/practice-main-commit"
git switch -q feature/login
