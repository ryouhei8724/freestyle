# shellcheck shell=bash
printf 'aaa\nbbb\n' > aaa
git add aaa
git commit -q -m "Update aaa"
printf 'aaa\nbbb\nccc\n' > aaa
git add aaa
git commit -q -m "Update aaa"
