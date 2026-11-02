#!/usr/bin/env bash
# Git 練習キットのエントリポイント。
#
#   ./practice.sh list          練習問題の一覧
#   ./practice.sh start 1       練習問題 1 の練習用リポジトリを作る（やり直しも同じコマンド）
#   ./practice.sh check 1       練習問題 1 を採点する
#   ../../practice.sh check     練習用リポジトリの中からなら番号は省略できる
#   ./practice.sh path 1        練習用リポジトリの場所を表示する（cd "$(./practice.sh path 1)"）
#
# 練習用リポジトリは playground/ 以下に作られ、このリポジトリ自体には影響しません。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXERCISES_DIR="$ROOT/exercises"
PLAYGROUND_DIR="${PRACTICE_PLAYGROUND:-$ROOT/playground}"

usage() {
  sed -n '2,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
}

die() {
  echo "エラー: $*" >&2
  exit 1
}

exercise_title() {
  sed -n '1s/^# *//p' "$1/README.md"
}

# "1" / "01" / "01-first-commit" のどれでも練習問題ディレクトリ名に解決する
resolve_exercise() {
  local query="$1" dir name
  if [[ "$query" =~ ^[0-9]+$ ]]; then
    query="$(printf '%02d' "$((10#$query))")"
  fi
  for dir in "$EXERCISES_DIR"/[0-9][0-9]-*/; do
    name="$(basename "$dir")"
    if [ "$name" = "$query" ] || [ "${name%%-*}" = "$query" ]; then
      echo "$name"
      return 0
    fi
  done
  die "練習問題 '$1' が見つかりません。./practice.sh list で一覧を確認してください。"
}

cmd_list() {
  local dir
  echo "練習問題の一覧:"
  for dir in "$EXERCISES_DIR"/[0-9][0-9]-*/; do
    printf '  %s  %s\n' "$(basename "$dir" | cut -d- -f1)" "$(exercise_title "$dir")"
  done
  echo
  echo "始め方: ./practice.sh start 1"
}

cmd_start() {
  local name sandbox
  name="$(resolve_exercise "$1")"
  sandbox="$PLAYGROUND_DIR/$name"

  rm -rf "$sandbox"
  mkdir -p "$sandbox"
  (
    cd "$sandbox"
    git init -q
    git symbolic-ref HEAD refs/heads/main
    # グローバルに名前・メールアドレスが未設定でも練習できるようにする
    if [ -z "$(git config user.name || true)" ]; then
      git config user.name "Practice User"
    fi
    if [ -z "$(git config user.email || true)" ]; then
      git config user.email "practice@example.com"
    fi
    # shellcheck source=exercises/lib.sh
    . "$EXERCISES_DIR/lib.sh"
    # shellcheck source=/dev/null
    . "$EXERCISES_DIR/$name/setup.sh"
  )

  echo "✨ 練習問題「$(exercise_title "$EXERCISES_DIR/$name")」の準備ができました。"
  echo
  echo "  問題文: exercises/$name/README.md"
  echo "  練習用リポジトリ: $sandbox"
  echo
  echo "次のコマンドで移動して始めましょう:"
  echo "  cd \"$sandbox\""
  echo
  echo "終わったら、練習用リポジトリの中で採点できます:"
  if [ -z "${PRACTICE_PLAYGROUND:-}" ]; then
    echo "  ../../practice.sh check"
  else
    echo "  \"$ROOT/practice.sh\" check ${name%%-*}"
  fi
}

cmd_check() {
  local name sandbox
  name="$(resolve_exercise "$1")"
  sandbox="$PLAYGROUND_DIR/$name"
  [ -d "$sandbox/.git" ] || die "まだ始めていません。先に ./practice.sh start ${name%%-*} を実行してください。"

  echo "📝 「$(exercise_title "$EXERCISES_DIR/$name")」を採点します"
  echo
  (
    cd "$sandbox"
    # shellcheck source=exercises/lib.sh
    . "$EXERCISES_DIR/lib.sh"
    # shellcheck source=/dev/null
    . "$EXERCISES_DIR/$name/check.sh"
    finish_check
  )
}

# 今いるディレクトリが練習用リポジトリの中なら、その練習問題名を返す
exercise_from_cwd() {
  local playground here rel
  playground="$(cd "$PLAYGROUND_DIR" 2> /dev/null && pwd -P)" || return 1
  here="$(pwd -P)"
  case "$here/" in
    "$playground"/?*/) rel="${here#"$playground"/}" ;;
    *) return 1 ;;
  esac
  echo "${rel%%/*}"
}

cmd_path() {
  local name
  name="$(resolve_exercise "$1")"
  echo "$PLAYGROUND_DIR/$name"
}

main() {
  local command="${1:-help}"
  case "$command" in
    list) cmd_list ;;
    start | reset)
      [ $# -ge 2 ] || die "練習問題の番号を指定してください（例: ./practice.sh start 1）"
      cmd_start "$2"
      ;;
    check)
      if [ $# -ge 2 ]; then
        cmd_check "$2"
      else
        local current
        current="$(exercise_from_cwd)" ||
          die "練習問題の番号を指定してください（例: ./practice.sh check 1）"
        cmd_check "$current"
      fi
      ;;
    path)
      [ $# -ge 2 ] || die "練習問題の番号を指定してください（例: ./practice.sh path 1）"
      cmd_path "$2"
      ;;
    help | -h | --help) usage ;;
    *)
      usage >&2
      exit 1
      ;;
  esac
}

main "$@"
