# shellcheck shell=bash
git merge -q --no-edit feature/discount > /dev/null 2>&1 || true   # ここでコンフリクトが起きる
printf '# price list\ncoffee: 450\ntea: 400\njuice: 300\n' > price.txt
git add price.txt
git commit -q --no-edit
