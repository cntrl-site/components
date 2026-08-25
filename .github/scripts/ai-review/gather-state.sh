#!/usr/bin/env bash
# Gather continuity state for an AI review job.
#
# Inputs (env):
#   REPO           - owner/name
#   PR             - pull request number
#   MARKER         - hidden per-agent marker on inline findings
#                    (e.g. "<!-- ai-review-quality -->")
#   SUMMARY_MARKER - hidden marker on the combined per-run review body
#                    (e.g. "<!-- ai-review-summary -->")
#   AGENT          - short agent name (e.g. "quality"); used for the temp
#                    filenames and the per-agent reviewed-sha key
#   GH_HEAD_SHA    - PR head sha on pull_request events (empty on workflow_dispatch)
#   GH_TOKEN       - token for gh
#
# Outputs:
#   $GITHUB_OUTPUT: prior_sha, head_sha
#   /tmp/${AGENT}-open-threads.md - still-open prior findings (dedup context)
set -euo pipefail

: "${REPO:?}" "${PR:?}" "${MARKER:?}" "${SUMMARY_MARKER:?}" "${AGENT:?}"

# --- HEAD sha -------------------------------------------------------------
if [ -n "${GH_HEAD_SHA:-}" ]; then
  HEAD_SHA="$GH_HEAD_SHA"
else
  HEAD_SHA="$(gh pr view "$PR" --repo "$REPO" --json headRefOid -q .headRefOid)"
fi

# --- Prior reviewed sha, from the most recent combined review body ---------
# A new review is posted each run; we read the latest review body (identified
# by SUMMARY_MARKER) and parse this agent's hidden reviewed-sha key from it.
# (github-actions[bot] is shared across the repo, so we filter on the marker,
# not the author.)
SUMMARY_BODY="$(
  gh api --paginate "repos/$REPO/pulls/$PR/reviews" \
    | jq -r --arg m "$SUMMARY_MARKER" -s 'add | map(select(.body != null and (.body | contains($m)))) | (last // {}) | .body // ""'
)"
PRIOR_SHA=""
if [ -n "$SUMMARY_BODY" ]; then
  PRIOR_SHA="$(printf '%s' "$SUMMARY_BODY" \
    | sed -n "s/.*<!-- ${AGENT}-reviewed-sha: \([0-9a-fA-F]\{7,40\}\) -->.*/\1/p" | head -1)"
fi

# --- Still-open prior findings (dedup context) ----------------------------
# Review threads carrying our marker that are neither resolved nor outdated.
OWNER="${REPO%%/*}"
NAME="${REPO##*/}"
THREADS_FILE="/tmp/${AGENT}-open-threads.md"

# shellcheck disable=SC2016  # $owner/$name/$pr are GraphQL variables, not shell
gh api graphql --paginate \
  -f owner="$OWNER" -f name="$NAME" -F pr="$PR" \
  -f query='
    query($owner: String!, $name: String!, $pr: Int!, $endCursor: String) {
      repository(owner: $owner, name: $name) {
        pullRequest(number: $pr) {
          reviewThreads(first: 100, after: $endCursor) {
            pageInfo { hasNextPage endCursor }
            nodes {
              isResolved
              isOutdated
              comments(first: 1) { nodes { path line body } }
            }
          }
        }
      }
    }' \
  --jq '.data.repository.pullRequest.reviewThreads.nodes[]
        | select(.isResolved == false and .isOutdated == false)
        | (.comments.nodes[0] // empty)' 2>/dev/null \
  | jq -r --arg m "$MARKER" 'select(.body | contains($m))
        | "- \(.path):\(.line // "?") — \((.body | gsub("\n"; " "))[0:240])"' \
  > "$THREADS_FILE" 2>/dev/null || true

if [ ! -s "$THREADS_FILE" ]; then
  echo "(none)" > "$THREADS_FILE"
fi

# --- Emit -----------------------------------------------------------------
{
  echo "prior_sha=$PRIOR_SHA"
  echo "head_sha=$HEAD_SHA"
} >> "${GITHUB_OUTPUT:-/dev/stdout}"

echo "Gathered state: PRIOR_SHA='${PRIOR_SHA:-<none>}' HEAD_SHA='$HEAD_SHA'"
echo "Open-threads dedup context written to $THREADS_FILE ($(wc -l < "$THREADS_FILE") line(s))"
