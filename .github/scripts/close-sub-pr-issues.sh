#!/usr/bin/env bash
set -euo pipefail

repo="${GITHUB_REPOSITORY:?}"
merged_pr="${PR_NUMBER:?}"
head_ref="${HEAD_REF:?}"
default_branch="${DEFAULT_BRANCH:?}"
dry_run="${DRY_RUN:-false}"

if [[ "$dry_run" != "true" && "${GITHUB_ACTIONS:-}" != "true" ]]; then
  echo "이슈는 GitHub Actions에서만 닫아요. 로컬에서는 DRY_RUN=true로 목록만 볼 수 있어요" >&2
  exit 1
fi

is_stop_branch() {
  [[ "$1" == "$default_branch" || "$1" == "main" || "$1" == "master" ]]
}

if is_stop_branch "$head_ref"; then
  echo "기본 브랜치에서 온 PR이라 건너뛰어요: $head_ref"
  exit 0
fi

keyword_filter='[.body // "" | scan("(?i)\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?):?\\s+#([0-9]+)") | .[0]] | unique | .[]'
found=$(mktemp)
trap 'rm -f "$found"' EXIT

visited=" "
queue="$head_ref"

while [[ -n "$queue" ]]; do
  branch="${queue%%$'\n'*}"
  if [[ "$queue" == *$'\n'* ]]; then queue="${queue#*$'\n'}"; else queue=""; fi
  [[ "$visited" == *" $branch "* ]] && continue
  visited+="$branch "

  gh pr list --repo "$repo" --base "$branch" --state merged --limit 200 --json number,body \
    --jq ".[] | .number as \$n | ($keyword_filter) | \"\\(.)\t\\(\$n)\"" >> "$found"
  for sub_head in $(gh pr list --repo "$repo" --base "$branch" --state merged --limit 200 --json headRefName --jq '.[].headRefName'); do
    if ! is_stop_branch "$sub_head"; then
      queue="${queue:+$queue$'\n'}$sub_head"
    fi
  done
done

if [[ ! -s "$found" ]]; then
  echo "$head_ref 브랜치로 머지된 하위 PR에 닫을 이슈가 없어요"
  exit 0
fi

sort -t $'\t' -k1,1n -k2,2n "$found" | sort -t $'\t' -k1,1n -u | while IFS=$'\t' read -r issue sub_pr; do
  state=$(gh issue view "$issue" --repo "$repo" --json state --jq .state 2>/dev/null || echo "NOT_FOUND")
  if [[ "$state" != "OPEN" ]]; then
    echo "#$issue 건너뜀($state, 하위 PR #$sub_pr)"
    continue
  fi
  if [[ "$dry_run" == "true" ]]; then
    echo "#$issue 닫을 예정(하위 PR #$sub_pr)"
    continue
  fi
  gh issue close "$issue" --repo "$repo" --reason completed \
    --comment "#$merged_pr 이 $default_branch 에 머지되어 닫아요. 이 이슈를 맡은 PR은 #$sub_pr 이에요."
  echo "#$issue 닫음(하위 PR #$sub_pr)"
done
