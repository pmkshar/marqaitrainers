#!/bin/bash
# Rewrite all commits with z@container email -> verified GitHub noreply email
# for both author AND committer fields. Idempotent: only rewrites if email matches.

set -e

VALID_EMAIL="16939520+pmkshar@users.noreply.github.com"
VALID_NAME="pmkshar"
BAD_EMAIL="z@container"

cd /home/z/my-project

echo "=== Before rewrite ==="
echo "Commits with z@container author: $(git log --all --format='%ae' | grep -c "^${BAD_EMAIL}\$")"
echo "Commits with z@container committer: $(git log --all --format='%ce' | grep -c "^${BAD_EMAIL}\$")"
echo ""

# Use filter-branch with env-filter to rewrite both author and committer
# --force to allow re-running; --tag-name-filter cat to also retag; -- --all for all refs
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force \
  --env-filter "
    if [ \"\$GIT_AUTHOR_EMAIL\" = \"${BAD_EMAIL}\" ]; then
      export GIT_AUTHOR_EMAIL=\"${VALID_EMAIL}\"
      export GIT_AUTHOR_NAME=\"${VALID_NAME}\"
    fi
    if [ \"\$GIT_COMMITTER_EMAIL\" = \"${BAD_EMAIL}\" ]; then
      export GIT_COMMITTER_EMAIL=\"${VALID_EMAIL}\"
      export GIT_COMMITTER_NAME=\"${VALID_NAME}\"
    fi
  " \
  --tag-name-filter cat \
  -- --all 2>&1 | tail -10

echo ""
echo "=== After rewrite ==="
echo "Commits with z@container author:    $(git log --all --format='%ae' | grep -c "^${BAD_EMAIL}\$" || echo 0)"
echo "Commits with z@container committer: $(git log --all --format='%ce' | grep -c "^${BAD_EMAIL}\$" || echo 0)"
echo "Commits with valid email author:    $(git log --all --format='%ae' | grep -c "^${VALID_EMAIL}\$")"
echo ""
echo "=== Latest 5 commits (verify author) ==="
git log --format='%h | %an <%ae> | %s' -5
