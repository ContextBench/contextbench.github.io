# CodeNib: Haiku5.5 search pair + Opus5.5 mini SWE-agent

This submission reports one complete canonical500 evaluation of the CodeNib agent system. Its context metrics describe the final selected source under the confirmed-delivery contract below; arbitrary shell-source attribution remains partial. Submission and structural validation do not establish leaderboard comparability or publication approval, which require maintainer review.

## Results and population

| Level | Recall | Precision | F1 |
| --- | ---: | ---: | ---: |
| File | 87.99% | 18.80% | 27.88% |
| Block / symbol | 85.18% | 14.27% | 21.61% |
| Line | 77.90% | 20.39% | 28.11% |

Native Pass@1 is **388/500 =77.60%**, with all112 unsuccessful cases retained. Recorded search-plus-repair SDK usage is **$338.876600645**, or **$0.67775320129 per instance**, across1,000 search and4,514 repair SDK sessions. These are recorded model-usage values, with caching reflected in the SDK records; they exclude compute, subscription research controls and prior strategy development, and are not reconciled cash invoices or an account credit balance. SDK sessions are not asserted to equal individual HTTP requests.

| Source | Instances | Natively resolved |
| --- | ---: | ---: |
| SWE-Bench-Verified | 174 | 152 |
| SWE-Bench-Pro | 54 | 34 |
| SWE-PolyBench | 116 | 92 |
| Multi-SWE-Bench | 156 | 110 |

The task source is `Contextbench/ContextBench`, configuration `contextbench_verified`, immutable revision `c2855792b006af41c67202d33883fb9d46362853`, split `train`. The exact500 IDs are in `logs/instance_ids.txt`; its SHA256 is `94f05c340133973b068edc2ce5c11aaf40b3ebb30f1f537ba055b73eba829836`. There are no candidate-task exclusions or successful-case filters. The ContextBench evaluator is pinned to `1436c28a8eb95496da4ea69ad458b9f8a8eb7d61`. Website block metrics use its symbol metric. Each instance's F1 is computed from that instance's evaluated P/R before macro averaging; F1 is not recomputed from macro P/R.

## Agent and context contract

CodeNib orchestrates two complementary Claude Haiku5.5 search workers, version-bound source delivery on demand, and Claude Opus5.5 in the adapted mini SWE-agent `DefaultAgent` repair loop. The measured route does not select embeddings, Jev reranking or graph expansion. The inference implementation is pinned to CodeNib commit `25d4580c1d5b0e1fd90bcd1483ba3e31e04a770d`; the exact source, prompts, configuration, dependency metadata and per-case implementation hashes are archived.

The canonical continuation uses Opus5.5 medium effort, a20-turn limit and the recorded$4 whole-case usage guard. The guard is checked between requests rather than being a provider cash cap; a final call may cross it and is fully counted. Original stopped/turn-limited attempts remain in the denominator. The initial2,048-token bound applies only to navigation metadata. Source bodies are pulled when requested, without a4K static augmentation or initial source-body token cap. Tool output caps, elisions and skipped files are not treated as delivered source.

The scored selected context retains the two original search workers' observed spans and adds authenticated original-version source observations confirmed in repair-model inputs. A requested range, assistant summary, elided output or undelivered final diff alone earns no read credit. Unknown arbitrary shell output and modified-file coordinates remain unattributed. This is full500 instance coverage, not a claim to complete capture of all source exposures; missing attribution can affect both Recall and Precision. The raw interactions and compiler are retained for parser/comparability review. Gold paths use the pinned evaluator's `Gold.line_spans_init()` normalization; unavailable annotations and `gold_source_issues` are not silently remapped or dropped.

## Native grading and failure handling

Each new solver generates its own candidate patch. Native grading receives that unchanged first-attempt final patch; reference fixes, test patches and grading feedback stay outside model inputs. Native environment/source recovery and neutral/reference controls add no candidate score. All original failed controls and recovery records remain archived.

The original pinned Verified, Pro, Poly and Multi criteria are retained with the recorded native resource/source profiles and explicit conservative negative policies. All116 Poly and153 remaining Multi source environments were admitted before their paid attempts. The Multi admission binds306 actual paired control records and28 independently executed baselines. Poly has113 strict positive-reference cases and three declared identifier defects retained as conservative negatives. Native-only image caches, public dependencies, memory, CPU/thread/process/worker settings, networking, deadlines and log capture are recorded separately from inference; all19 native runtime source files per new case are retained and authenticated.

Native positives mean the pinned required criteria passed; they do not imply every repository test passed or the issue was independently proven fixed. A recorded django-7530 baseline-positive task remains included. Pro base-source/test-patch conflicts, the collection-blocked pylint case and conservative Poly negatives retain their original unsuccessful outcomes and missing execution evidence. They are not recast as executed behavioral failures. Separate raw stdout/stderr and their composition are preserved for the admitted Logstash profile; cross-stream chronology is unavailable.

## Selection, exposure and tuning disclosures

All500 canonical annotations had already been exposed before this evaluation. This is not an unseen generalization result. The independent32 metadata-selected validation is a separate recorded gate; its source/raw seals and timing are in the review evidence. Its Recall-priority choice reports F1 and cost rather than requiring F1 nondecrease. Early dense/graph preparation failed before model evaluation, so it supplies no graph-quality result; the exposed file-surface screen was not promoted.

Three original development repairs are reused with retrospective selected-context exports; their original configurations and input receipts remain archived. The other497 repairs retain their first executions. The remaining269 ran in nine fixed phases, with no external model-policy retry, outcome replacement or task substitution. Infrastructure controls/recoveries are separate from candidate attempts. All failures, stopped attempts and SDK charges are kept. Internal model edits and self-tests within an attempt remain visible in its trajectory.

On the same500 search-stage IDs, line Recall/F1 are77.07%/28.16%; final selection is77.90%/28.11%. Recall rises0.83 percentage points and F1 falls0.05. Thirty-five tasks gain Recall and465 are unchanged; F1 improves on23, falls on100 and is unchanged on377. This descriptive stage comparison does not isolate a causal component gain or establish matched-model repair efficiency. The search-only$5.680771745 is not presented as full-system cost.

## Files, raw evidence and redactions

`logs/official-metrics.json` is the original official per-instance context output, and `logs/official-evaluation.log` retains evaluation diagnostics. `logs/joined-results.jsonl` retains native outcomes and unique-session fees. `logs/repair-index.jsonl`, `logs/evaluation-input.json`, `logs/protocol.json` and the archive manifests bind cases, original patch/receipt hashes, evaluation inputs and versions. The raw stage-specific verification files keep their original scope and readiness flags; later checks are separate rather than rewriting earlier records.

All actual raw interactions and native logs are committed in69 bounded archive files under `trajectories/`. Five repair cohorts contain58+64+55+54+269 disjoint candidate records, while the search cohort contains all1,000 original workers. The archive indexes list every member, checksum and byte count. Repair streams are zstd-compressed TARs split into ordered parts; concatenate their listed parts before decompression. The ten search files are independent gzip TARs and must be extracted individually rather than concatenated. Each committed file is at most50MiB. These are actual files, not Git LFS pointers or external-link substitutes.

Known workstation filesystem labels and opaque SDK UUIDs are normalized or pseudonymized consistently. Original-before/public-after commitments and session-digest links preserve verification. Model requests, source observations, patches, selections, fees and native outcomes retain their verified semantics. The current operator credential is excluded; matched credential values are never printed or stored in audit reports. Original code/object bytes and public test data remain intact where needed for source verification.

The new269 scan reviews44,618 publication members and1,704,188 unique decompressed Git objects. Its102 declared-pattern findings are all bound to complete anonymous immutable public source or the complete pinned public native CSV:51 test/example TLS keys,37 public-source literal collisions with the workstation hostname,7 editor test-input strings,2 published upstream application authorization constants, and5 public-native-dataset markers. The two application constants are preexisting yt-dlp extractor source, not operator or user-session credentials; exact source URLs/commits and the retention decision are disclosed in `logs/verification/remaining269-classifications.json`. Prior55/Pro54 declared findings are independently classified; prior58/64 scans record no remaining matches. This is a contextual, declared-pattern and known-operator review, not a guarantee to detect arbitrary secrets or all personal data. Canonical upstream source, including public authorship and fixtures, is retained as provenance. No unselected native-dataset row bodies were rendered or supplied to a model during the opaque full-file comparison.

## Reproduce aggregation

From this submission directory, Python3.10+ is sufficient for the aggregation tool:

```bash
python tools/contextbench_submission_results.py \
  --protocol logs/protocol.json \
  --evaluation logs/official-metrics.json \
  --joined-results logs/joined-results.jsonl \
  --model 'CodeNib (Haiku5.5 search pair + Opus5.5 mini SWE-agent)' \
  --output reproduced-results.json --audit reproduced-aggregation.json
cmp results.json reproduced-results.json
```

This command was tested on the actual public files and recreates `results.json` byte for byte. It requires exactly500 unique canonical IDs and all known search/repair session identities, including unsuccessful attempts. Structural website validation and this aggregation do not by themselves establish raw-content fidelity.

## Reproduce recorded inputs, selections and fees

Use the recorded CodeNib dependencies (the frozen `pyproject.toml`/`uv.lock` and `logs/verification/runtime-environment-reference.json`). The Python package/source and vendored mini SWE-agent are included in the runtime archive inside the repair58 part set; CodeNib commit `25d4580c1d5b0e1fd90bcd1483ba3e31e04a770d` is the public dependency reference. In an environment prepared from that revision, the following command uses the committed data and bundled frozen modules:

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

The replay reauthenticates4,514 repair interactions,1,000 search-fee receipts, all500 selected contexts/native first-patch bindings and269 new native snapshots (5,111 source-file occurrences). It selectively materializes the needed members while hashing every archived member. The full archives retain the other logs, failed preparation records, source seeds and constructor scripts for inspection. Source constructors retain their recorded anonymized path aliases; full fresh source-clone, model inference and Docker grading are not claimed by the record replay.

Python audit hooks deny original-checkout opens, network operations and external processes during the worker replay; this is a Python guard, not an OS sandbox. It is not a fresh native-test run or model-quality replication. Per-case image IDs, native harness revisions/configs/scripts, original raw test reports, source recovery recipes and commands support deeper inspection or native reconstruction. The captured environment reference is descriptive at capture time; archived per-case protocols and SDK init/config records provide execution evidence.

The expected replay outputs are500 cases,388 resolved/112 unresolved,5,514 unique sessions and$338.876600645 modeled usage. The original and the actual staged candidate replay checks are supplied under `logs/verification/`. Native repetitions or model inference require the recorded environment and, for models, credentials and additional provider usage; none is required by the two verification commands above.

## Archive extraction and environment-dependent runs

`artifact-manifest.json` lists SHA256 and size for every committed file except itself. `trajectories/coverage-index.json` maps each of the 500 candidate IDs to its repair cohort, exact solver/native/selection members, hashes and outcome. Each cohort's `artifact-index.json` lists all archived members and ordered parts; its `redaction-manifest.json` binds original and published bytes. For complete extraction into an empty `evidence` directory:

```bash
mkdir evidence
for cohort in repair-058 repair-064 repair-055 repair-pro-054 repair-269; do
  cat trajectories/"$cohort"/*.part* | zstd -d --memory=1024MB -c | tar -xf - -C evidence
done
for part in trajectories/search-500/*.tar.gz; do
  tar -xzf "$part" -C evidence
done
```

The lexically ordered repair part names have zero-padded suffixes; verify their index checksums before extraction. Extraction installs evidence only; it does not execute archived scripts, Git hooks or native tests. Search members contain the pinned evaluator, frozen search protocols, prompts, exact worker interactions and original launch scripts. Repair members contain the frozen agent package, adapted mini SWE-agent, per-case native source and commands.

Fresh inference/native reconstruction needs the recorded Python dependencies, Claude Agent SDK/CLI, Docker, pinned source commits/submodules, native datasets and recorded source-only/native images. Public reconstruction may need to fetch/rebuild images and dependencies: recorded local image IDs are commitments, not a promise of registry availability. Paths in archived protocols are anonymized labels, so reconstruct their aliases outside the submission rather than silently editing hash-bound evidence. Original billing/reservation drivers also retain their owner/credential checks; they are archived evidence, not a portable launcher to rerun over completed output directories.

For example, the final phase's exact command construction is in `evidence/canonical500-candidate-repair/batches/canonical-positions-475-499/shards/0/run_dispatch.py` (and shard1). Its `protocol.json` supplies the task IDs, source-only image IDs, model, native dataset/image, resource options and hashes. In a separately prepared CodeNib checkout, the repair invocation is:

```bash
python scripts/benchmark_context_solver.py \
  --search-pair "$SEARCH_ROOT" --instance-id "$INSTANCE_ID" \
  --upstream "$CONTEXTBENCH_CHECKOUT" --image "$SOLVER_IMAGE_ID" \
  --output "$NEW_SOLVER_OUTPUT" --model claude-opus-5-5 \
  --billing-route anthropic-api --initial-context retrieved \
  --navigation-tokens 2048 --total-meter-usd 4 --max-turns 20 --live
```

Bind these variables to that case's archived protocol and a fresh output directory; supply the reviewer-owned `ANTHROPIC_API_KEY` through the environment. The frozen adapter records medium effort in its model configuration. This command makes new billed model requests, and its result is not expected to be byte deterministic. The native invocation is separately constructed in the same archived dispatcher from `native_command_prefix`, `native_adapter`, `native_dataset`, `native_image_id`, `native_extra` and the case's outer deadline. Use the case's archived native runtime rather than substituting the default adapter; grading and source-only solver images are distinct.

The original final context scoring command, after restoring the input's pinned source snapshots/path aliases and the frozen CodeNib environment, is:

```bash
python "$CODENIB_CHECKOUT/codenib/eval/benchmarks/_contextbench_evaluate.py" \
  --upstream "$CONTEXTBENCH_CHECKOUT" \
  --input logs/evaluation-input.json --output rescored-official-metrics.json
```

The wrapper uses the pinned upstream evaluator recorded above. The original 500-case scoring log and output are committed. The independently tested public verification is the recorded-input replay and byte-identical aggregation above; a fresh full inference, source-clone or Docker-test replication has not been performed for this submission.

## Review status

This directory requests review in the Agent systems category. It does not change website ranking data or run the maintainer publication helper. Evidence coverage, parser/native-policy comparability and publication remain subject to maintainer review.
