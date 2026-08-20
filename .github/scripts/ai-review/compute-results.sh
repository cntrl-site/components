#!/usr/bin/env bash
# Compute one review job's result and emit it as job outputs for the combined
# summary job to consume. Always runs (even when the agent was skipped or
# failed) so the summary has a row for this agent.
#
# Inputs (env):
#   AGENT          - short agent name (e.g. quality)
#   REVIEW_OUTCOME - outcome of the claude-code-action step (success|failure|...)
#   EXECUTION_FILE - claude-code-action execution_file (empty if it didn't run)
#   FINDINGS_FILE  - /tmp/${AGENT}-findings.json (may be absent)
#   HEAD_SHA       - commit reviewed this run
#   PRIOR_SHA      - reviewed-sha recorded by the previous run (may be empty)
#
# Outputs ($GITHUB_OUTPUT):
#   status       - clean | findings | skipped | failed
#   num_findings - integer (line-anchored findings count)
#   record_sha   - sha to record as reviewed (HEAD only if the agent ran, else PRIOR)
#   turns, cost, duration - run metadata (0 if the agent did not run)
#
# GitHub validation-skips anthropics/claude-code-action on PRs until the
# workflow exists identically on the default branch; the skipped step still
# reports "success" with no execution_file. We treat the run as a real review
# only when an execution_file exists, so reviewed-sha never advances past
# commits that were not actually reviewed.
set -euo pipefail

: "${AGENT:?}" "${HEAD_SHA:?}"
REVIEW_OUTCOME="${REVIEW_OUTCOME:-failure}"
PRIOR_SHA="${PRIOR_SHA:-}"

agent_ran=false
if [ "$REVIEW_OUTCOME" = "success" ] && [ -n "${EXECUTION_FILE:-}" ] && [ -f "${EXECUTION_FILE:-/nonexistent}" ]; then
  agent_ran=true
fi

num_findings=0
has_summary=false
if [ -n "${FINDINGS_FILE:-}" ] && [ -f "$FINDINGS_FILE" ]; then
  num_findings="$(jq '[.comments // [] | .[] | select(.path != null and (.line | numbers))] | length' "$FINDINGS_FILE" 2>/dev/null || echo 0)"
  if [ -n "$(jq -r '.summary // "" | gsub("\\s+"; "")' "$FINDINGS_FILE" 2>/dev/null || true)" ]; then
    has_summary=true
  fi
fi

turns=0; cost=0; duration=0
if [ "$agent_ran" = true ]; then
  turns="$(jq 'last | .num_turns // 0' "$EXECUTION_FILE" 2>/dev/null || echo 0)"
  cost="$(jq 'last | .total_cost_usd // 0' "$EXECUTION_FILE" 2>/dev/null || echo 0)"
  duration="$(jq 'last | ((.duration_ms // 0) / 1000 | round)' "$EXECUTION_FILE" 2>/dev/null || echo 0)"
fi

if [ "$agent_ran" = true ]; then
  record_sha="$HEAD_SHA"
  if [ "$num_findings" -gt 0 ] || [ "$has_summary" = true ]; then
    status="findings"
  else
    status="clean"
  fi
else
  record_sha="$PRIOR_SHA"
  if [ "$REVIEW_OUTCOME" = "success" ]; then
    status="skipped"
  else
    status="failed"
  fi
fi

{
  echo "status=$status"
  echo "num_findings=$num_findings"
  echo "record_sha=$record_sha"
  echo "turns=$turns"
  echo "cost=$cost"
  echo "duration=$duration"
} >> "${GITHUB_OUTPUT:-/dev/stdout}"

# Make non-success outcomes loud in the Actions UI (the job/step status alone
# is easy to miss). A real failure already fails the job — this just annotates.
case "$status" in
  skipped)
    echo "::warning title=${AGENT} review skipped::claude-code-action self-skipped (workflow-validation gate: the workflow file must be byte-identical to the version on the default branch). This is expected on the PR that adds/edits this workflow and resolves once it is merged to the default branch."
    ;;
  failed)
    echo "::error title=${AGENT} review failed::claude-code-action exited non-zero (e.g. model unavailable, Anthropic auth, or a crash). See the 'Run anthropics/claude-code-action' step log above."
    ;;
esac

echo "Results: agent=$AGENT status=$status findings=$num_findings record_sha=${record_sha:-<none>} (turns=$turns cost=\$$cost duration=${duration}s)"
