#!/usr/bin/env bash
# Usage: ./ship-feature.sh <FeatureID> <scope> "<summary>"
# Example: ./ship-feature.sh F2 home "home dashboard with balance hero and budget"
# Commits the finished feature and pushes it to origin/main. Never force-pushes.

set -euo pipefail

REMOTE="origin"
BRANCH="main"

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <FeatureID> <scope> \"<summary>\"" >&2
  exit 1
fi

FEATURE_ID="$1"
SCOPE="$2"
SUMMARY="$3"

# Must be inside a git repo and on main
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "Not a git repository." >&2; exit 1; }
CURRENT="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT" != "$BRANCH" ]; then
  echo "You are on '$CURRENT'. Switch to '$BRANCH' first (git checkout $BRANCH)." >&2
  exit 1
fi

# Run project checks if the scripts exist
if [ -f package.json ]; then
  for task in typecheck lint test; do
    if node -e "process.exit(require('./package.json').scripts && require('./package.json').scripts['$task'] ? 0 : 1)"; then
      echo "→ npm run $task"
      npm run "$task" --silent
    fi
  done
fi

# Stage and make sure there is something to commit
git add -A
if git diff --cached --quiet; then
  echo "Nothing to commit." >&2
  exit 1
fi

git commit -m "feat(${SCOPE}): ${SUMMARY}" -m "Implements ${FEATURE_ID}."

# Rebase on latest remote main, then push
git pull --rebase "$REMOTE" "$BRANCH"
git push "$REMOTE" "$BRANCH"

echo "✓ ${FEATURE_ID} pushed to ${REMOTE}/${BRANCH}"
