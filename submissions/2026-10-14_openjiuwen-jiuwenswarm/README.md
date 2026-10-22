# openJiuwen-JiuwenSwarm + DeepSeek-V4-Pro

Agent-systems submission (`system_type: agent`) on ContextBench Lite, 500 tasks.
openJiuwen-JiuwenSwarm is the agent; DeepSeek-V4-Pro is the model. This entry
replaces `2026-09-12_openjiuwen-jiuwenswarm`.

## System

A single-process ReAct coding agent. It works inside the task's repository,
searches and edits the code with file, bash and code-graph tools (a tree-sitter
graph built during the run), and submits a patch. Its final answer ends with a
`<PATCH_CONTEXT>` block of files and line ranges: the code around its edits that
it viewed during the run. The scored context is the last such block.


| Setting     | Value                                                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Code        | [openJiuwen/agent-core](https://gitcode.com/openJiuwen/agent-core) ; [openJiuwen/jiuwenswarm](https://gitcode.com/openJiuwen/jiuwenswarm) |
| Model       | `deepseek/deepseek-v4-pro` via OpenRouter, provider Alibaba                                                                               |
| Sampling    | temperature 0; `max_tokens` 48768; reasoning budget 16000                                                                                 |
| Limits      | 60 minutes per task; connection errors retried up to 5 times                                                                              |
| Environment | each slice's official instance image                                                                                                      |


## Evaluation and reproduction

**Population.** ContextBench Lite 500 (`data/selected_500_instances.csv`), gold
`data/full.parquet` from [EuniAI/ContextBench](https://github.com/EuniAI/ContextBench)
`1436c28a8eb95496da4ea69ad458b9f8a8eb7d61`. Denominator 500 for every metric.
Each task's result comes from one run; all ran 13–14 October 2026 in nine
batches with the same configuration:

```bash
python scripts/eval/cb_pipeline/cb_pipeline.py launch --name <batch> --list <ids> \
  --engine <agent env> --budget <USD> --workers 10 --max-tokens 48768 --temperature 0.0 \
  --openrouter-provider '{"order": ["Alibaba"], "only": ["Alibaba"], "allow_fallbacks": false}' \
  --openrouter-reasoning '{"max_tokens": 16000}'
```

**Retrieval.**

```bash
python -m contextbench.evaluate --gold data/full.parquet --pred logs/cb_preds.jsonl \
  --cache ./repos --out logs/eval_final.jsonl
```

**Pass@1.** Each slice's native harness on the raw agent patch:


| Slice     | n       | Resolved | Harness commit              | Dataset revision                            |
| --------- | ------- | -------- | --------------------------- | ------------------------------------------- |
| Verified  | 174     | 123      | SWE-bench `328da6e1`        | `SWE-bench/SWE-bench_Verified` `78f471bf`   |
| Multi     | 156     | 83       | multi-swe-bench `24f493f8`  | `ByteDance-Seed/Multi-SWE-bench` `56ff018c` |
| Poly      | 116     | 74       | SWE-PolyBench `9c836c5d`    | `AmazonScience/SWE-PolyBench` `d56445f9`    |
| Pro       | 54      | 24       | SWE-bench_Pro-os `ca10a60a` | `ScaleAI/SWE-bench_Pro` `7ab51149`          |
| **Total** | **500** | **304**  |                             |                                             |


**Failures.** Whatever patch is in the workspace when a run ends is scored;
empty patches and harness errors count as unresolved. The context block is
collected during the agent run; scoring uses it as is.


| Case                                                                                   | Instances                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 60-minute limit                                                                        | `huggingface__transformers-27663` (empty patch), `huggingface__transformers-29449`, `huggingface__transformers-30556`, `nushell__nushell-13357`, `ponylang__ponyc-2168` |
| Model call refused upstream (Alibaba: "Output data may contain inappropriate content") | `facebook__zstd-1243`, `instance_NodeBB__NodeBB-f2082d7de85eb62a70819f4f3396dd85626a0c0a-vd59a5728dfc977f44533186ace531248c2917516`                                                                                  |
| Empty final context block (F1 = 0)                                                     | `ponylang__ponyc-2168`, `facebook__zstd-1243`, `huggingface__transformers-27663`, `huggingface__transformers-30556`                                                                                                  |
| Empty patch (unresolved)                                                               | `django__django-13513`, `huggingface__transformers-27663`                                                                                                                                                            |
| Multi harness error: test output could not be parsed (unresolved)                      | 21 `mui/material-ui`, 1 `expressjs/express` (`error_ids` in `logs/official_scoring/cb-engine44-multi-b*-official/multi__output__final_report.json.gz`)                                                               |


**Aggregation.** `python3 aggregate.py` (stdlib only) rebuilds `results.json`
from `logs/instance_ids.txt`, `logs/eval_final.jsonl` and
`logs/resolution.jsonl`. File / block / line scores are the macro mean of
per-instance F1 over 500; block is the `symbol` granularity.

## Artifacts

```text
logs/
  SHA256SUMS                         (cd logs && sha256sum -c SHA256SUMS)
  instance_ids.txt                   original_inst_id, instance_id, slice, run
  cb_preds.jsonl, eval_final.jsonl   retrieval predictions and evaluation
  resolution.jsonl                   Pass@1 per instance
  cost.jsonl                         requests and USD cost per instance
  patches/{id}.patch.gz              submitted patch
  runs/{id}.log.gz                   agent run log (incl. per-request cost)
  results/{id}.json.gz               run record (status, token usage)
  harness/{id}.log.gz                per-instance Pass@1 harness output
  official_scoring/                  scoring summaries and run logs
trajectories/
  SHA256SUMS                         (cd trajectories && sha256sum -c SHA256SUMS)
  {id}.history.jsonl.gz              full agent interaction
```

Files are named by `original_inst_id`. `django__django-13513` has an empty
patch, so the harness did not evaluate it; its harness file is a 165-byte
placeholder with no verdict.

## Metrics


| Field                         | Value                 |
| ----------------------------- | --------------------- |
| file recall / precision / F1  | 0.617 / 0.919 / 0.683 |
| block recall / precision / F1 | 0.450 / 0.765 / 0.490 |
| line recall / precision / F1  | 0.411 / 0.607 / 0.389 |
| pass_at_1                     | 0.608                 |
| avg_cost_per_instance         | 0.556 USD             |


Cost is the provider-reported USD cost of every model request (OpenRouter,
13–14 October 2026): 22,390 requests, $277.99 in total, divided by 500. Each
request's cost is the `total_cost` in its `llm_usage chunk` line in
`logs/runs/{id}.log.gz`; `logs/cost.jsonl` has the per-instance sums. Token
counts per task are in `logs/results/`.

## Disclosures

- The agent does not receive gold context, the reference patch or the
evaluation tests. It has no per-task or per-repository rules, and no results
were selected across runs.
- Multi scoring: the harness has one local change (ponyc builds with `-j8`),
which does not change test selection or judging. When a fix run's test log
was cut short (fewer than 95% of the dataset run's tests), our script reran
that instance alone on the same image and patch; 25 instances were rerun
(`logs/official_scoring/*/multi__retried.json.gz`). The rerun is scored; the
first attempt is kept in the same `logs/harness/{id}.log.gz` under
`multi/cut_short/`.
- API keys are not in the artifacts.

