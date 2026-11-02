# shellcheck shell=bash
git switch -q -c feature/dessert
printf 'coffee\ntea\ncake\n' > menu.txt
git add menu.txt
git commit -q -m "Add cake to menu"
git switch -q main
git merge -q --no-edit feature/dessert
