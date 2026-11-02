#!/usr/bin/env bash
# 練習問題そのもののテスト。
#   1. 始めた直後は不合格になること
#   2. 模範解答（exercises/*/solution.sh）を実行すると合格になること
#   3. よくある間違い（tests/wrong-answers/*.sh）では不合格になること
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PRACTICE_PLAYGROUND="$(mktemp -d)"
export PRACTICE_PLAYGROUND
trap 'rm -rf "$PRACTICE_PLAYGROUND"' EXIT

failures=0
passes=0

ok() { passes=$((passes + 1)); echo "  ok   $1"; }
ng() { failures=$((failures + 1)); echo "  FAIL $1"; }

# 練習用リポジトリで答えのスクリプトを実行する
apply_answer() {
  local exercise="$1" script="$2"
  (
    cd "$("$ROOT/practice.sh" path "$exercise")"
    # shellcheck source=exercises/lib.sh
    . "$ROOT/exercises/lib.sh"
    # shellcheck source=/dev/null
    . "$script"
  )
}

expect_check() {
  local expected="$1" exercise="$2" label="$3" output
  if output="$("$ROOT/practice.sh" check "$exercise" 2>&1)"; then
    if [ "$expected" = pass ]; then ok "$label"; else ng "$label（合格してしまった）"; echo "$output"; fi
  else
    if [ "$expected" = fail ]; then ok "$label"; else ng "$label（不合格になった）"; echo "$output"; fi
  fi
}

for dir in "$ROOT"/exercises/[0-9][0-9]-*/; do
  name="$(basename "$dir")"
  echo "$name"

  "$ROOT/practice.sh" start "$name" > /dev/null
  expect_check fail "$name" "始めた直後は不合格"

  apply_answer "$name" "$dir/solution.sh"
  expect_check pass "$name" "模範解答で合格"

  for wrong in "$ROOT"/tests/wrong-answers/"$name"--*.sh; do
    [ -e "$wrong" ] || continue
    "$ROOT/practice.sh" start "$name" > /dev/null
    apply_answer "$name" "$wrong"
    label="$(basename "$wrong" .sh)"
    expect_check fail "$name" "間違い「${label#*--}」は不合格"
  done
done

echo
echo "$passes passed, $failures failed"
[ "$failures" -eq 0 ]
