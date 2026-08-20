#!/usr/bin/env bash
# Post ONE combined AI review per run.
#
# The review BODY is a per-run status table plus a collapsed-by-default
# <details> block per agent carrying that agent's non-line-specific notes
# (its `summary`). Every line-anchored finding is attached as an inline comment
# on this single review, so the table comment is the primary review that all
# inline comments hang off of.
#
# A fresh review is posted on every run (not edited in place). A hidden
# per-agent reviewed-sha marker in the body lets the next run resume
# incremental review.
#
# Today there is a single agent (quality / thermo-nuclear). The structure is
# deliberately kept multi-agent-shaped: to add another agent, give it a job
# that uploads a findings artifact, pass its QUAL_*-style env block here, then
# add one `collect_comments` call (merged into ALL_COMMENTS), one table row,
# one `emit_notes` call, and one hidden reviewed-sha marker below.
#
# Inputs (env):
#   REPO, PR, GH_TOKEN
#   SUMMARY_MARKER  - hidden marker identifying our review bodies
#   REVIEW_MODEL    - model name shown in the table
#   RUN_URL         - link to this workflow run (optional)
#   HEAD_SHA        - commit the review (and its inline comments) is anchored to
#   Quality agent (QUAL_*):
#     QUAL_STATUS        - clean | findings | skipped | failed | "" (job skipped)
#     QUAL_FINDINGS      - line-anchored findings count
#     QUAL_RECORD_SHA    - sha to persist as this agent's reviewed-sha
#     QUAL_TURNS, QUAL_COST, QUAL_DURATION - run metadata
#     QUAL_MARKER        - hidden per-agent marker appended to each inline body
#     QUAL_FINDINGS_FILE - path to the agent's findings JSON (may be absent)
#                          schema: { "summary": "<md>", "comments": [{path, line, body}, ...] }
#
# Posts one PR review (event=COMMENT): body = table + per-agent notes + markers,
# comments[] = every line-anchored finding (each suffixed with its agent
# marker). If the batched review is rejected (e.g. a comment targets a line
# outside the PR diff), it falls back to posting the body-only review plus each
# inline comment individually, skipping the ones GitHub rejects.
set -euo pipefail

: "${REPO:?}" "${PR:?}" "${SUMMARY_MARKER:?}" "${HEAD_SHA:?}"
: "${QUAL_MARKER:?}"
MODEL="${REVIEW_MODEL:-unknown}"

# Icon + name per agent, reused for the table rows, the notes blocks, and the
# inline-comment titles so they all read identically.
QUAL_LABEL="☢️ Thermo-nuclear code quality"

fmt_cost() { # $1=cost -> $x.yy  (coerces junk/empty to 0)
  awk -v c="${1:-0}" 'BEGIN { printf "%.2f", c + 0 }'
}

fmt_duration() { # $1=seconds -> mm:ss  (coerces junk/empty to 0)
  awk -v s="${1:-0}" 'BEGIN { s = int(s + 0); printf "%02d:%02d", int(s / 60), s % 60 }'
}

status_cell() { # $1=status  $2=findings
  case "$1" in
    clean)    printf '✅ Clean' ;;
    findings) printf '❌ %s finding(s)' "${2:-0}" ;;
    skipped)  printf '⏭️ Skipped (agent did not run)' ;;
    failed)   printf '⚠️ Failed' ;;
    *)        printf '— Not run' ;;
  esac
}

# Line-anchored comments from one agent's findings file. Each body is prefixed
# with a title (the agent's icon + name + an i/total counter scoped to this
# agent) and suffixed with the agent marker. Prints a JSON array (possibly []).
collect_comments() { # $1=findings-file  $2=marker  $3=label
  local file="$1" marker="$2" label="$3"
  if [ -n "$file" ] && [ -f "$file" ]; then
    jq -c --arg m "$marker" --arg label "$label" \
      '[.comments // [] | .[]
         | select(.path != null and (.line | numbers) and (.body | type == "string") and (.body | length > 0))]
       | length as $total
       | to_entries
       | map(.value + {
           side: "RIGHT",
           body: ("**" + $label + "** (" + ((.key + 1) | tostring) + "/" + ($total | tostring) + ")\n\n"
                  + .value.body + "\n\n" + $m)
         } | {path, line, side, body})' "$file"
  else
    echo '[]'
  fi
}

# This agent's `summary` (non-line-specific notes), or empty string.
read_summary() { # $1=findings-file
  local file="$1"
  if [ -n "$file" ] && [ -f "$file" ]; then
    jq -r '.summary // ""' "$file"
  fi
}

# Emit a collapsed-by-default <details> block for an agent's notes, only when
# the notes are non-empty.
emit_notes() { # $1=label  $2=summary-markdown
  local label="$1" body="$2"
  [ -z "$(printf '%s' "$body" | tr -d '[:space:]')" ] && return 0
  printf '<details>\n<summary>%s — notes</summary>\n\n%s\n\n</details>\n\n' "$label" "$body"
}

QUAL_CELL="$(status_cell "${QUAL_STATUS:-}" "${QUAL_FINDINGS:-0}")"

QUAL_COMMENTS="$(collect_comments "${QUAL_FINDINGS_FILE:-}" "$QUAL_MARKER" "$QUAL_LABEL")"
ALL_COMMENTS="$QUAL_COMMENTS"
NUM="$(printf '%s' "$ALL_COMMENTS" | jq 'length')"

QUAL_SUMMARY="$(read_summary "${QUAL_FINDINGS_FILE:-}")"

BODY_FILE="/tmp/ai-review-body.md"
# Hidden markers go ABOVE the heading/table (a comment line inside a markdown
# table breaks rendering).
{
  echo "$SUMMARY_MARKER"
  echo "<!-- quality-reviewed-sha: ${QUAL_RECORD_SHA:-} -->"
  echo ""
  echo "## AI code review — \`${HEAD_SHA:0:7}\`"
  echo ""
  # Non-breaking-space padding widens the narrow numeric columns (GFM has no
  # column-width syntax) and stops the single-word headers wrapping mid-word.
  echo "| Agent | Status | &nbsp;&nbsp;Findings&nbsp;&nbsp; | Model | &nbsp;&nbsp;Turns&nbsp;&nbsp; | &nbsp;&nbsp;Cost&nbsp;&nbsp; | &nbsp;&nbsp;Duration&nbsp;&nbsp; |"
  echo "|-------|--------|----------|-------|-------|------|----------|"
  echo "| ${QUAL_LABEL} | ${QUAL_CELL} | ${QUAL_FINDINGS:-0} | ${MODEL} | ${QUAL_TURNS:-0} | \$$(fmt_cost "${QUAL_COST:-0}") | $(fmt_duration "${QUAL_DURATION:-0}") |"
  echo ""
  emit_notes "$QUAL_LABEL" "$QUAL_SUMMARY"
  RUN_LINK=""
  [ -n "${RUN_URL:-}" ] && RUN_LINK="[CI run](${RUN_URL}) · "
  echo "<sub>${RUN_LINK}Findings (if any) are the inline comments on this review. A new review is posted on each run.</sub>"
} > "$BODY_FILE"

# --- Attempt 1: one batched review (table body + all inline comments) ------
PAYLOAD="$(jq -n \
  --arg sha "$HEAD_SHA" --rawfile body "$BODY_FILE" --argjson comments "$ALL_COMMENTS" \
  '{commit_id: $sha, event: "COMMENT", body: $body, comments: $comments}')"

if printf '%s' "$PAYLOAD" | gh api -X POST "repos/$REPO/pulls/$PR/reviews" --input - >/dev/null 2>/tmp/review-err.txt; then
  echo "Posted combined review with $NUM inline comment(s) (quality=${QUAL_STATUS:-none})."
  exit 0
fi

echo "Batched review rejected; falling back to body-only review + per-comment posting."
sed 's/^/  gh: /' /tmp/review-err.txt || true

# --- Fallback: post the table review on its own (so the run summary survives)
jq -n --arg sha "$HEAD_SHA" --rawfile body "$BODY_FILE" \
  '{commit_id: $sha, event: "COMMENT", body: $body}' \
  | gh api -X POST "repos/$REPO/pulls/$PR/reviews" --input - >/dev/null 2>&1 \
  && echo "Posted summary review." \
  || echo "WARNING: summary review failed to post."

# --- Fallback: post each inline comment individually, skipping rejects -----
POSTED=0
SKIPPED=0
for ((i = 0; i < NUM; i++)); do
  CPAYLOAD="$(printf '%s' "$ALL_COMMENTS" | jq -c \
    --argjson i "$i" --arg sha "$HEAD_SHA" \
    '.[$i] | {commit_id: $sha, path, line, side, body}')"
  if printf '%s' "$CPAYLOAD" | gh api -X POST "repos/$REPO/pulls/$PR/comments" --input - >/dev/null 2>/tmp/comment-err.txt; then
    POSTED=$((POSTED + 1))
  else
    SKIPPED=$((SKIPPED + 1))
    echo "  skipped comment $i: $(head -1 /tmp/comment-err.txt)"
  fi
done
echo "Inline comments: posted $POSTED, skipped $SKIPPED."
