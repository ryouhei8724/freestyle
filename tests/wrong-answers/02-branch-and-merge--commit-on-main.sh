# shellcheck shell=bash
git branch feature/dessert
printf 'coffee\ntea\ncake\n' > menu.txt
git commit -q -am "Add cake to menu"
