# Reproduce the CodeNib submitted records

Run these commands from the submission directory. They preserve the verification and
environment-dependent reconstruction instructions from the original 500-task submission.
The [README](README.md) explains the model, context and native scoring contract;
[RESULTS.md](RESULTS.md) contains descriptive tables.

## Reproduce aggregation

From this submission directory, Python 3.10+ is sufficient for the aggregation tool:

```bash
python tools/contextbench_submission_results.py \
  --protocol logs/protocol.json \
  --evaluation logs/official-metrics.json \
  --joined-results logs/joined-results.jsonl \
  --model 'CodeNib (Haiku5.5 search pair + Opus5.5 mini SWE-agent)' \
  --output reproduced-results.json --audit reproduced-aggregation.json
cmp results.json reproduced-results.json
```

This command was tested on the actual public files and recreates `results.json` byte for
byte. It requires exactly 500 unique canonical IDs and all known search/repair session
identities, including unsuccessful attempts. Structural website validation and this
aggregation do not by themselves establish raw-content fidelity.

## Reproduce recorded inputs, selections and fees

Use the recorded CodeNib dependencies (the frozen `pyproject.toml`/`uv.lock` and
`logs/verification/runtime-environment-reference.json`). The Python package/source and
vendored mini SWE-agent are included in the runtime archive inside the repair-058 part
set; CodeNib commit `25d4580c1d5b0e1fd90bcd1483ba3e31e04a770d` is the public dependency
reference. In an environment prepared from that revision, the following command uses the
committed data and bundled frozen modules:

```bash
python tools/replay_publication_repair_receipts.py \
  --repair-parts trajectories/repair-058 \
  --repair-parts trajectories/repair-064 \
  --repair-parts trajectories/repair-055 \
  --repair-parts trajectories/repair-pro-054 \
  --repair-parts trajectories/repair-269 \
  --search-parts trajectories/search-500 \
  --search-linkage logs/search-session-digest-linkage.json \
  --cases 500 \
  --closed-index canonical500-candidate-repair/completed500-raw-index/repair-index.jsonl \
  --output /tmp/codenib-record-replay
```

The replay reauthenticates 4,514 repair interactions, 1,000 search-fee receipts, all 500
selected contexts/native first-patch bindings and 269 new native snapshots (5,111
source-file occurrences). It selectively materializes the needed members while hashing
every archived member. The full archives retain the other logs, failed preparation
records, source seeds and constructor scripts for inspection. Source constructors retain
their recorded anonymized path aliases; full fresh source-clone, model inference and
Docker grading are not claimed by the record replay.

Python audit hooks deny original-checkout opens, network operations and external
processes during the worker replay; this is a Python guard, not an OS sandbox. It is not
a fresh native-test run or model-quality replication. Per-case image IDs, native harness
revisions/configs/scripts, original raw test reports, source recovery recipes and
commands support deeper inspection or native reconstruction. The captured environment
reference is descriptive at capture time; archived per-case protocols and SDK
init/config records provide execution evidence.

The expected replay outputs are 500 cases, 388 resolved / 112 unresolved, 5,514 unique
sessions and $338.876600645 modeled usage. The original and the actual staged candidate
replay checks are supplied under `logs/verification/`. Native repetitions or model
inference require the recorded environment and, for models, credentials and additional
provider usage; none is required by the two verification commands above.

## Archive extraction and environment-dependent runs

`artifact-manifest.json` lists SHA256 and size for every committed file except itself.
`trajectories/coverage-index.json` maps each of the 500 candidate IDs to its repair
cohort, exact solver/native/selection members, hashes and outcome. Each cohort's
`artifact-index.json` lists all archived members and ordered parts; its
`redaction-manifest.json` binds original and published bytes. For complete extraction
into an empty `evidence` directory:

```bash
mkdir evidence
for cohort in repair-058 repair-064 repair-055 repair-pro-054 repair-269; do
  cat trajectories/"$cohort"/*.part* | zstd -d --memory=1024MB -c | tar -xf - -C evidence
done
for part in trajectories/search-500/*.tar.gz; do
  tar -xzf "$part" -C evidence
done
```

The lexically ordered repair part names have zero-padded suffixes; verify their index
checksums before extraction. Extraction installs evidence only; it does not execute
archived scripts, Git hooks or native tests. Search members contain the pinned
evaluator, frozen search protocols, prompts, exact worker interactions and original
launch scripts. Repair members contain the frozen agent package, adapted mini SWE-agent,
per-case native source and commands.

Fresh inference/native reconstruction needs the recorded Python dependencies, Claude
Agent SDK/CLI, Docker, pinned source commits/submodules, native datasets and recorded
source-only/native images. Public reconstruction may need to fetch/rebuild images and
dependencies: recorded local image IDs are commitments, not a promise of registry
availability. Paths in archived protocols are anonymized labels, so reconstruct their
aliases outside the submission rather than silently editing hash-bound evidence.
Original billing/reservation drivers also retain their owner/credential checks; they are
archived evidence, not a portable launcher to rerun over completed output directories.

For example, the final phase's exact command construction is in
`evidence/canonical500-candidate-repair/batches/canonical-positions-475-499/shards/0/run_dispatch.py`
(and shard 1). Its `protocol.json` supplies the task IDs, source-only image IDs, model,
native dataset/image, resource options and hashes. In a separately prepared CodeNib
checkout, the repair invocation is:

```bash
python scripts/benchmark_context_solver.py \
  --search-pair "$SEARCH_ROOT" --instance-id "$INSTANCE_ID" \
  --upstream "$CONTEXTBENCH_CHECKOUT" --image "$SOLVER_IMAGE_ID" \
  --output "$NEW_SOLVER_OUTPUT" --model claude-opus-5-5 \
  --billing-route anthropic-api --initial-context retrieved \
  --navigation-tokens 2048 --total-meter-usd 4 --max-turns 20 --live
```

Bind these variables to that case's archived protocol and a fresh output directory;
supply the reviewer-owned `ANTHROPIC_API_KEY` through the environment. The frozen
adapter records medium effort in its model configuration. This command makes new billed
model requests, and its result is not expected to be byte deterministic. The native
invocation is separately constructed in the same archived dispatcher from
`native_command_prefix`, `native_adapter`, `native_dataset`, `native_image_id`,
`native_extra` and the case's outer deadline. Use the case's archived native runtime
rather than substituting the default adapter; grading and source-only solver images are
distinct.

The original final context scoring command, after restoring the input's pinned source
snapshots/path aliases and the frozen CodeNib environment, is:

```bash
python "$CODENIB_CHECKOUT/codenib/eval/benchmarks/_contextbench_evaluate.py" \
  --upstream "$CONTEXTBENCH_CHECKOUT" \
  --input logs/evaluation-input.json --output rescored-official-metrics.json
```

The wrapper uses the pinned upstream evaluator recorded above. The original 500-case
scoring log and output are committed. The independently tested public verification is
the recorded-input replay and byte-identical aggregation above; a fresh full inference,
source-clone or Docker-test replication has not been performed for this submission.
