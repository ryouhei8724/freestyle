# shellcheck shell=bash
git switch -q -c feature/dessert
printf 'coffee\ntea\ncake\n' > menu.txt
git commit -q -am "Add cake to menu"
git switch -q main
