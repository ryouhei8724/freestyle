# shellcheck shell=bash
printf 'aaa\nbbb\nccc\n' > aaa
git commit -q -am "Add bbb and ccc at once"
