# Submit to the ContextBench leaderboard

Submit results and logs through a pull request to
[ContextBench/contextbench.github.io](https://github.com/ContextBench/contextbench.github.io).
This repository stores both the website and submission artifacts. Maintainers
review your evidence before adding scores to the public leaderboard.

## 1. Run and document your evaluation

Use the [ContextBench evaluator](https://github.com/EuniAI/ContextBench) and
[agent runner guide](https://github.com/EuniAI/ContextBench/blob/main/docs/run_agent_on_contextbench.md).
Preserve raw evaluation outputs, execution logs, and recorded agent interactions
for every evaluated instance, including failures and all attempts.

Record the exact dataset/configuration, immutable revision, split/task selection,
instance list, evaluator commit, and reproduction commands. The evaluator supports
different task sets; reviewers must confirm that the task population and scoring
protocol are comparable with the published board before accepting a score.
Submitting a subset does not automatically qualify it for the current rankings.

The website JSON is a summary format, not the evaluator's raw output format.
Include raw outputs and the script or exact commands used to aggregate them into
`results.json`. Report Pass@1 from issue-resolution evaluation outcomes; retrieval
metrics alone do not establish whether an issue was resolved.

## 2. Fork and prepare a submission

Fork this repository on GitHub, then run (replace `YOUR_GITHUB_USERNAME`):

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/contextbench.github.io.git
cd contextbench.github.io
git switch -c submit/my-system
cp -R submissions/template submissions/2026-09-12_my-system
```

Use the actual submission date and a unique lowercase system slug:
`YYYY-MM-DD_system-name`. Add a version or run suffix when needed. Submit one
system/run per directory, and leave existing submissions and website data intact.

```text
submissions/2026-09-12_my-system/
├── metadata.json
├── results.json
├── README.md
├── logs/           # raw per-instance metrics, outcomes, and execution logs
└── trajectories/   # recorded agent interactions, with instance IDs
```

Copying the template alone is not a valid submission: fill in the metadata and
scores, replace the README with your report, and add actual artifacts. The
template's `null` values deliberately fail validation rather than act as scores.

### Required files

| File | Contents |
| --- | --- |
| `metadata.json` | Schema version `1`, date matching the folder, exact display name, system type, submitter, and evaluation setup. All template fields are required. |
| `results.json` | Matching display name and aggregated performance metrics, using the format below. |
| `README.md` | Method, exact model/agent versions and configuration, environment, inference/evaluation/aggregation commands, instance list, coverage and failure handling, and disclosures. Remove template instructions and placeholders. |
| `logs/` | Original ContextBench evaluation outputs plus issue-resolution outcomes and execution logs, including failures. Keep instance IDs and attempt IDs in filenames or an included index. |
| `trajectories/` | Recorded agent interactions, tool calls and outputs for each instance/attempt, in the original agent format. Include an index if filenames do not identify instances. |

`metadata.system_type` selects the existing leaderboard view:

- `backbone`: a model evaluated using the benchmark's adapted mini SWE-agent.
- `agent`: an agent + model combination; include both in the display name.

`submitter.github` is a GitHub user/organization profile URL. Use `Independent`
for `submitter.organization` if applicable. `evaluation.dataset_revision` and
`evaluation.evaluator_commit` are full 40-character Git commit SHAs. Identify the
dataset repository/configuration or task-list path in `evaluation.dataset`.
`evaluation.instance_count` is the number of evaluated instances, not attempts;
include the complete instance list and explain exclusions in your README.

### Score format

The numbers below are **illustrative only**. Replace them with evaluated scores:

```json
{
  "model": "My Agent + My Model",
  "performance": {
    "file": { "recall": 0.6, "precision": 0.5, "f1": 0.5 },
    "block": { "recall": 0.5, "precision": 0.4, "f1": 0.4 },
    "line": { "recall": 0.4, "precision": 0.3, "f1": 0.3 },
    "pass_at_1": 0.25
  },
  "patterns": {
    "avg_steps_per_instance": 10,
    "avg_lines_per_step": 20,
    "avg_cost_per_instance": 0.5
  },
  "dynamics": {
    "efficiency": 0.5,
    "redundancy": 0.4,
    "usage_drop": 0.2
  }
}
```

- Performance and dynamics values are fractions in `[0, 1]`: `0.25` means 25% Pass@1.
- All performance metrics are required. Copy the evaluated, aggregated F1; do not
  recompute it from mean precision/recall, which may use a different aggregation.
- `patterns` and `dynamics` are optional. Omit unevaluated metrics rather than
  supplying `0`, `null`, strings, or `NaN`. Individual pattern fields may be omitted;
  when including dynamics, supply all three metrics.
- Pattern values must be nonnegative. Cost is average USD per instance.
- Every field is checked for its expected name to catch misspelled metrics.

### Logs and large artifacts

Commit the actual logs and trajectories in your submission directory. README-only
folders and external links alone do not satisfy the artifact requirement. Text,
JSON, JSONL, and original agent trajectory formats are welcome. Compress large
logs with gzip or split archives so each committed file is at most 50 MiB. Include
an artifact index, archive contents, extraction commands, and checksums in your
README when using archives. Do not use Git LFS pointers as a substitute for files.

Remove API keys, access tokens, credentials and personal data before committing.
Document redactions and preserve the information needed to verify the run.

## 3. Validate and open a PR

With Node.js 20 or newer installed, validation requires no npm dependencies:

```bash
npm run submissions:validate -- submissions/2026-09-12_my-system
git add submissions/2026-09-12_my-system
git commit -m "Submit My System ContextBench results"
git push -u origin submit/my-system
```

Open the [PR comparison page](https://github.com/ContextBench/contextbench.github.io/compare/main...HEAD?expand=1&template=leaderboard_submission.md),
choose **compare across forks**, select your fork and branch, and target `main`.
Use the [leaderboard submission PR template](../.github/PULL_REQUEST_TEMPLATE/leaderboard_submission.md).
Include the submission path, system type, evaluation population, reported scores,
and reproduction instructions. Enable maintainer edits to your PR branch if you
want maintainers to include the approved leaderboard update in the same PR.

The **Submission checks** workflow validates directory/metadata/metric formats and
the presence of artifacts. It does **not** rerun the benchmark, verify artifact
contents or coverage, approve the submission, or publish scores. Opening a PR or
merging an artifact-only PR does not change the rankings.

## Maintainer review and publication

1. Check the README, model/agent versions, dataset revision, task population and
   count against the board's evaluation protocol. Confirm the backbone/agent
   category. Do not mix incomparable task sets.
2. Inspect/decompress artifacts. Check coverage against the full instance list,
   including failures, timeouts, retries, and all attempts.
3. Reproduce aggregation from raw outputs. Verify Pass@1 outcomes and denominator
   separately from retrieval metrics; inspect or rerun instances as needed.
   Review tuning, contamination and redaction disclosures.
4. Request corrections through PR review. After approval, check out the reviewed
   submission and run:

   ```bash
   npm run submissions:publish -- submissions/2026-09-12_my-system
   ```

   This updates only the matching `src/data/backbone_results.json` or
   `src/data/agent_results.json`, adding a link to the submitted evidence. Existing
   model names are protected from accidental replacement; use `--replace` only
   for an approved correction/update.

5. Review and commit the JSON diff in the submission PR (with maintainer edits
   enabled), or in a separate maintainer PR after merging the artifacts. Include
   both artifacts and score changes in the final review. Merge the reviewed
   update to `main`; the existing GitHub Pages workflow builds and publishes it.

Publication is a maintainer action. The helper only edits local files and does not
authenticate reviewers, push, merge, or deploy. Configure GitHub branch protection
on `main` to require maintainer approval and the **Submission checks** status check
if these are not already required; workflow YAML alone cannot enforce reviews.

The template directory is excluded from validation and is never imported into the
rankings. Existing baseline scores stay in their current JSON files. For website
development, see the [repository README](../README.md).
