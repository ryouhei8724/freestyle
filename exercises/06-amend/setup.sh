# shellcheck shell=bash
setup_file_commit "index.html" "<h1>Hello</h1>" "Add top page"
printf 'body { color: navy; }\n' > style.css
printf '<link rel="stylesheet" href="style.css">\n<h1>Hello</h1>\n' > index.html
git add index.html
setup_commit "Add stylsheet"
git rev-parse HEAD~1 > "$(git rev-parse --git-dir)/practice-base-commit"
# style.css はうっかり add し忘れた状態
