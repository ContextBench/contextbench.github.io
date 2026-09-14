# openJiuwen-JiuwenSwarm

Agent-systems submission on ContextBench Lite (500 tasks). Display name matches
`metadata.json` and `results.json`.

`system_type` is **agent**: openJiuwen is the agent; DeepSeek-V4-Pro is the backbone.
This is not a Fixed-harness (mini SWE-agent) row.

## System

openJiuwen-JiuwenSwarm issue-resolution agent is a single-process ReAct, which:

1. Checks out the repository at `base_commit`.
2. Builds a BM25 index and an in-memory tree-sitter knowledge graph.
3. Searches, reads, and edits on a host playground; syncs diffs into a
   SWE-bench Docker image; runs the project’s own tests.
4. Submits `edit_patch` plus a retrieval trajectory (`pred_files`, `pred_spans`,
   `pred_steps`).

**Model.** `deepseek-v4-pro` for all LLM roles (base, advanced, retrieval).
No second model. Sampling: **temperature 0.0** for every role (no `top_p`
override). Cost is **USD**, taken from the provider API (`api_usage.cost_usd`,
`cost_source: api`) during the **10–11 September 2026** run. Token accounting is
the sidecar `input_tokens` / `output_tokens` / `n_calls` totals (not a local
price table). Cap: **$1.50** per instance.

**Tools.** `search_*` / `read` / `expand_*` / `edit_file` / `apply_patch` /
`run_tests` / `run_repro_script` / `submit_patch`. Advanced edit-line / apply-patch
LLM helpers were **off**. Must-edit, acceptance gates, syntax-vs-HEAD, test-command
allowlist, build gate, regression check, managed repro script, and ban-test-edits
were **on**.

**Budgets (this run).**

| Knob | Value |
| --- | ---: |
| Explore rounds | 48 |
| Max rounds | 110 |
| Max tool calls | 180 |
| Max test runs | 12 |
| Docker suite timeout | 900s |
| Ad-hoc test timeout | 300s |
| Test-fail rollback | 2 |
| Max completion tokens | 32768 |
| Temperature (all LLM roles) | 0.0 |

**Code.** Retrieval scoring used `python -m contextbench.evaluate` from
[EuniAI/ContextBench](https://github.com/EuniAI/ContextBench) commit
`1436c28a8eb95496da4ea69ad458b9f8a8eb7d61` (matches
`metadata.evaluation.evaluator_commit`). The openJiuwen agent itself ran from a
private checkout of that tree; that repository is **not** part of this GitHub
Pages submission. Run artifacts on disk use the internal run name
`epimetheus_shuf500_dsv4pro_b4_quiet`; the public system name is **openJiuwen-JiuwenSwarm**.


## Evaluation and reproduction

**Population.** HuggingFace `Contextbench/ContextBench` config
`contextbench_verified` (Lite, 500 tasks). Local gold: `data/full.parquet`.
Task order: `data/shuffled_500_instances.csv` (same 500 IDs as Lite, shuffled).
Dataset revision: EuniAI/ContextBench
`1436c28a8eb95496da4ea69ad458b9f8a8eb7d61` (matches
`metadata.evaluation.dataset_revision` and `evaluator_commit`). Gold
`data/full.parquet` and Lite `data/selected_500_instances.csv` are unchanged
from the initial dump in that repository.

| Slice | n |
| --- | ---: |
| Verified | 174 |
| Multi | 156 |
| Poly | 116 |
| Pro | 54 |
| **Total** | **500** |

This is the same instance set as the published Agent systems board (Lite 500),
not the 1,136-task full table.

**Agent command (eight parallel shards over CSV rows 1–500):**

```bash
./scripts/run_epimetheus_shuf500_dsv4pro_b4_quiet.sh --start-idx 1 --end-idx 63
./scripts/run_epimetheus_shuf500_dsv4pro_b4_quiet.sh --start-idx 64 --end-idx 125
./scripts/run_epimetheus_shuf500_dsv4pro_b4_quiet.sh --start-idx 126 --end-idx 188
./scripts/run_epimetheus_shuf500_dsv4pro_b4_quiet.sh --start-idx 189 --end-idx 250
./scripts/run_epimetheus_shuf500_dsv4pro_b4_quiet.sh --start-idx 251 --end-idx 313
./scripts/run_epimetheus_shuf500_dsv4pro_b4_quiet.sh --start-idx 314 --end-idx 375
./scripts/run_epimetheus_shuf500_dsv4pro_b4_quiet.sh --start-idx 376 --end-idx 438
./scripts/run_epimetheus_shuf500_dsv4pro_b4_quiet.sh --start-idx 439 --end-idx 500
```

Each shard calls `scripts/run_epimetheus_eval.py --bench Shuffled --csv-order
--allow-partial --delete-docker-images --run-name epimetheus_shuf500_dsv4pro_b4_quiet`.
That interleaves: agent → ContextBench retrieval eval → native SWE-bench
resolution (Verified / Multi / Poly / Pro harnesses).

**Retrieval eval (from the evaluator checkout, gold + repo cache required):**

```bash
python -m contextbench.evaluate \
  --gold data/full.parquet \
  --pred submissions/2026-09-12_openjiuwen-jiuwenswarm/logs/epimetheus_Shuffled_pred.jsonl \
  --cache ./repos \
  --out submissions/2026-09-12_openjiuwen-jiuwenswarm/logs/epimetheus_Shuffled_eval.jsonl
```

**Coverage and failures.** All 500 instances have an agent sidecar. Pass@1
denominator is **500**. Empty patches, harness infra errors, and missing harness
rows count as **unresolved** (not dropped). Retrieval file/block/line metrics
average **499** eval rows; one Pro instance has no retrieval score (missing C#
tree-sitter parser) and is omitted from those means only.

| Outcome | n | IDs |
| --- | ---: | --- |
| Resolved | 302 | see `logs/epimetheus_Shuffled_resolution.jsonl` (`resolved: true`) |
| Empty patch | 4 | `django__django-13513`, `mui__material-ui-34229`, `nlohmann__json-2225`, `ponylang__ponyc-1057` |
| Harness infra | 1 | `iamkun__dayjs-1414` |
| Retrieval eval error | 1 | `instance_ansible__ansible-bf98f031…` (C# tree-sitter) |


**Aggregation (from this PR; no agent re-run, no gold, no Docker, no LLM keys).**
From this directory:

```bash
python3 aggregate.py
```

That rebuilds `results.json` from packed artifacts and exits 0 if it matches the
committed file. `python3 aggregate.py --write` overwrites `results.json` (for
maintainers regenerating the summary). `aggregate.py` is stdlib-only.

| Field | Source | Denom |
| --- | --- | ---: |
| file / block / line | Macro mean of `final.file` / `final.symbol` / `final.line` in `logs/epimetheus_Shuffled_eval.jsonl` (recall = `coverage`; block = AST `symbol`) | 499 valid eval rows |
| pass_at_1 | `resolved` in `logs/epimetheus_Shuffled_resolution.jsonl` | 500 |
| avg_steps_per_instance | Mean `len(traj_data.pred_steps)` over `trajectories/*.epimetheus.json` | 500 |
| avg_lines_per_step | Sum of inclusive line-span lengths across steps / total steps | all steps |
| avg_cost_per_instance | Mean `api_usage.cost_usd` in `logs/sidecars/*.json` (USD, API-billed 10–11 Sep 2026; tokens in `input_tokens` / `output_tokens`) | 500 |
| efficiency | Mean `trajectory.auc_coverage.line` | 499 |
| redundancy | Mean `trajectory.redundancy.line` | 499 |
| usage_drop | `0.0` (script asserts `pred_spans` line ranges are the union of `pred_steps`) | 500 traj files |

F1 is the mean of per-instance F1, not F1 of mean recall/precision. Means are
`round(x, 3)` (Python banker's rounding).

## Artifacts

```text
aggregate.py
results.json
logs/
  ARTIFACTS.md
  SHA256SUMS
  epimetheus_Shuffled_eval.jsonl
  epimetheus_Shuffled_pred.jsonl
  epimetheus_Shuffled_resolution.jsonl
  epimetheus_{Verified,Multi,Poly,Pro}_resolution.jsonl
  instance_ids.txt
  sidecars/{instance_id}.json
  runs/run_{instance_id}.log
  harness/harness_{instance_id}.log
trajectories/
  {instance_id}.epimetheus.json
```

Verify checksums (paths in `SHA256SUMS` are relative to `logs/`):

```bash
(cd logs && sha256sum -c SHA256SUMS)
```

Filenames use `original_inst_id` from `logs/instance_ids.txt`. Agent logs are the
scored attempt (`logs/runs/run_{id}.log`). Retrieval + harness traces are
`logs/harness/harness_{id}.log`.
`django__django-13513` has no harness report because the patch was empty. See
`logs/ARTIFACTS.md`.

Source run (not committed here):
`results/agent_runs/epimetheus_shuf500_dsv4pro_b4_quiet/` in the agent checkout.
BM25 `*.index/` trees and Multi `multi_eval/workdir` dumps are omitted.

## Metrics

| Field | Value |
| --- | ---: |
| file F1 | 0.460 |
| block F1 | 0.297 |
| line recall / F1 | 0.753 / 0.257 |
| pass_at_1 | 0.604 |
| avg_steps_per_instance | 21.998 |
| avg_lines_per_step | 59.604 |
| avg_cost_per_instance | 0.571 USD (API-billed, 10–11 Sep 2026) |
| efficiency / redundancy / usage_drop | 0.642 / 0.165 / 0.0 |

## Disclosures

- **Quiet eval.** Prompts and tool observations do not name grader/gold dataset
  paths. Tests still run in official SWE-bench images.
- **No gold-context injection.** The agent does not receive `gold_context` or
  the reference patch as input.
- **Usage drop 0.** openJiuwen records `pred_spans` as the union of `pred_steps`,
  so explored gold is still in the final retrieval set. This is not “unused in
  the patch.”
- **Evaluator.** Retrieval metrics come from EuniAI/ContextBench
  `1436c28a8eb95496da4ea69ad458b9f8a8eb7d61` (`python -m contextbench.evaluate`).
  Pass@1 uses the native SWE-bench harnesses for each slice.
- **Credentials.** API keys are not in artifacts. Sidecars may include token
  counts and USD cost only.
