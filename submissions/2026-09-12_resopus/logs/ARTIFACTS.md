# Log artifacts

Aggregator inputs (do not need extraction):

- `epimetheus_Shuffled_pred.jsonl` — 500 agent trajectories (`traj_data`) for `python -m contextbench.evaluate --pred`
- `epimetheus_Shuffled_eval.jsonl` — ContextBench retrieval scores (500 rows; 499 valid, 1 tree-sitter error)
- `epimetheus_Shuffled_resolution.jsonl` — Pass@1 harness rows (500)
- `epimetheus_{Verified,Multi,Poly,Pro}_resolution.jsonl` — native-slice copies (evidence only)
- `sidecars/{instance_id}.json` — 500 agent sidecars (`api_usage.cost_usd`)
- `instance_ids.txt` — 500 `original_inst_id` values in CSV order

Per-instance logs (scored attempt only):

- `runs/run_{instance_id}.log` — 500 agent traces (through `Epimetheus done:`)
- `harness/harness_{instance_id}.log` — 500 retrieval + SWE-bench resolution traces

`django__django-13513` has no harness report (empty patch, counted unresolved).

Checksums cover every file in this directory except `ARTIFACTS.md` and `SHA256SUMS` itself.
Paths in `SHA256SUMS` are relative to `logs/`. From the submission directory:

```bash
(cd logs && sha256sum -c SHA256SUMS)
```
