# shellcheck shell=bash
git stash -q
printf 'Thank you for the feedback.\n' > message.txt
git commit -q -am "Fix typo in thank-you message"
