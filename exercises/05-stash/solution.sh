# shellcheck shell=bash
git stash -q
printf 'Thank you for the feedback.\n' > message.txt
git add message.txt
git commit -q -m "Fix typo in thank-you message"
git stash pop -q
