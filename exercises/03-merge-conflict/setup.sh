# shellcheck shell=bash
setup_file_commit "price.txt" $'# price list\ncoffee: 500\ntea: 400\njuice: 350' "Add price list"
git switch -q -c feature/discount
setup_file_commit "price.txt" $'# price list\ncoffee: 450\ntea: 400\njuice: 300' "Discount coffee and juice"
git switch -q main
setup_file_commit "price.txt" $'# price list\ncoffee: 550\ntea: 400\njuice: 350' "Raise coffee price"
