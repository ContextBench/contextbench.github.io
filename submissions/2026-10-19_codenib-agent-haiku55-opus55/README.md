# CodeNib: Haiku5.5 search pair + Opus5.5 mini SWE-agent

CodeNib is the agent system in this submission: it coordinates complementary
code-search workers, passes version-bound navigation to a repair agent, serves
source on demand, and assembles attributable context for evaluation. The model
roles are **Claude Haiku5.5 for search** and **Claude Opus5.5 for repair**, with the
adapted mini SWE-agent providing the repair execution loop. The category is
**Agent systems** (`system_type: agent`).

On all **500 tasks**, the submitted run records **388 resolved / 112 unresolved
(77.60% native Pass@1)**, **77.90% line Recall**, and **28.11% line F1**. Complete
search-plus-repair model usage is **$338.876600645**, or **$0.67775320129 per task**.
All failures and their model usage remain included.

| Final selected context | Recall | Precision | F1 |
| --- | ---: | ---: | ---: |
| File | 87.99% | 18.80% | 27.88% |
| Block / symbol | 85.18% | 14.27% | 21.61% |
| Line | 77.90% | 20.39% | 28.11% |

These context scores evaluate the selected source supported by the delivery
receipts described below. Arbitrary shell-source attribution remains partial.
The 500-task population was previously exposed during development, and three
development repairs have retrospective selection exports. The
[disclosures](#selection-exposure-and-failure-handling) explain these limits.
Submission status is **under review** in
[official PR #4](https://github.com/ContextBench/contextbench.github.io/pull/4).

## System and context strategy

The central design is **carry source locations across model boundaries, then
fetch source bodies when the receiving agent needs them**. The two search workers
have separate windows. The scout receives the original issue plus bounded
navigation metadata from the first worker, so it must inspect source itself when
it needs behavioral evidence. It is asked to investigate complementary entry
points, callers/callees, alternative paths, tests and configuration.

| Stage | Model / executor | Input and behavior | Output |
| --- | --- | --- | --- |
| First search | Haiku5.5 + CodeNib MCP source tools | Read the issue and inspect the pinned repository through `glob`, `grep`, and `read` | Observed files/ranges, raw tool replies, source and usage receipts |
| Complementary scout | A separate Haiku5.5 worker | Receive the same issue and first-worker locations; inspect missing relevant source in its own window | A second set of independently observed source spans |
| Navigation handoff | CodeNib | Authenticate the two workers, merge duplicate/adjacent intervals, and encode locations with source identity | At most 2,048 tokens of navigation metadata, with explicit omissions and **no source bodies** |
| Repair | Opus5.5 in adapted mini SWE-agent `DefaultAgent` | Read requested source using `codenib-read` / `codenib-grep`; execute edits, builds and self-tests through the container shell | The candidate's first-attempt final patch and confirmed model-input observations |
| Context assembly and grading | CodeNib + pinned ContextBench/native evaluators | Retain search observations, add confirmed original-version repair reads, grade the unchanged patch, and join unique usage records | Final context metrics, native outcome and search-plus-repair cost |

CodeNib's measured role is the search/source-tool route, navigation handoff,
source delivery, context assembly and solver orchestration. Embeddings, Jev
reranking and graph expansion are outside this frozen route. The result evaluates
the complete CodeNib agent/model combination; it does not isolate an embedding,
graph, router or other single-component gain.

**On-demand bodies.** The 2,048-token limit bounds navigation metadata, not the
issue or later source bodies. There is no fixed 4K source augmentation. Handles
bind a file/range to its commit and repository fingerprint; they are locators,
not a claim of implemented context eviction or cache-aware compaction.

**Source credit.** A source view needs a version-bound receipt and an exact
observation in a confirmed model input. A requested shell range, generated
summary, elided output or undelivered final diff alone earns no read credit.
Unmapped modified-file coordinates and arbitrary shell output stay unattributed.
Capped output and skipped files remain explicit. Gold uses the pinned
`Gold.line_spans_init()` normalization, with unavailable annotations and their
original denominators retained.

The implementation is pinned and inspectable: [worker-pair assembly](https://github.com/sysevol-ai/CodeNib/blob/25d4580c1d5b0e1fd90bcd1483ba3e31e04a770d/scripts/contextbench_search_pair.py),
[navigation/usage handoff](https://github.com/sysevol-ai/CodeNib/blob/25d4580c1d5b0e1fd90bcd1483ba3e31e04a770d/scripts/contextbench_search_pair_solver.py),
[mini SWE-agent adapter](https://github.com/sysevol-ai/CodeNib/blob/25d4580c1d5b0e1fd90bcd1483ba3e31e04a770d/scripts/benchmark_context_solver.py),
and [selected-context compiler](https://github.com/sysevol-ai/CodeNib/blob/25d4580c1d5b0e1fd90bcd1483ba3e31e04a770d/scripts/contextbench_selected_context.py).
The same source and exact prompts/configuration are retained in the raw archives.

### Models, tools and budgets

| Setting | Recorded value / scope |
| --- | --- |
| Search model | `claude-haiku-5-5`; two workers per task, ordered `first` then `scout` |
| Repair model | `claude-opus-5-5` |
| Reasoning effort | `medium` in both model adapters |
| Search turn bound | 20 SDK worker turns per worker |
| Search output request | 4,096 tokens requested; original SDK configuration/init records are archived |
| Search usage guard | $0.08 requested per worker; SDK guards are not account cash caps |
| Repair turn bound | 20 mini SWE-agent turns; confirmed in all 500 archived solver configurations |
| Whole-case usage guard | $4, including the actual original search usage; the remaining allowance is passed to repair |
| Initial navigation | 2,048 tokens; no source bodies |
| Repair source tools | `codenib-read PATH START END`: 1-based inclusive, at most 2,000 lines; `codenib-grep PATTERN PATH [LIMIT]`: default 100 / maximum 200 visible matches |
| Other repair actions | Shell commands for edits, builds and self-tests; no local tools exposed inside an individual repair SDK model request |
| Concurrency | Search: up to eight cases; the remaining 269 repairs: two shards across nine fixed phases |
| Solver environment | Pinned source-only Docker checkout, no network access; native grading uses separately recorded images/profiles |

The repair loop executes the model's bash command and returns formatted output in
the next model input. Each repair SDK query has one assistant turn; that is a
different unit from the outer mini SWE-agent turn bound and from a search
worker's SDK turns. Session counts below must not be interpreted as HTTP request
counts or substituted for the benchmark's trajectory-step metrics.

Usage guards are checked between requests. A final request can cross the guard;
its entire recorded usage is kept. The original stopped attempt with 20 repair
sessions and $4.1666292 repair usage, and two Rust attempts stopped at the 20-turn bound,
retain their original patches and outcomes. No temperature value is inferred from
another system's setup; the original SDK options are the configuration record.

## Evaluation setup and metric definitions

| Item | Pinned value |
| --- | --- |
| Dataset | `Contextbench/ContextBench`, configuration `contextbench_verified`, split `train` |
| Dataset revision | `c2855792b006af41c67202d33883fb9d46362853` (dataset repository) |
| Evaluator | `EuniAI/ContextBench` at `1436c28a8eb95496da4ea69ad458b9f8a8eb7d61` |
| CodeNib inference implementation | `25d4580c1d5b0e1fd90bcd1483ba3e31e04a770d` |
| Mini SWE-agent | Vendored `minisweagent` source in the pinned evaluator's `agent-frameworks/mini-swe-agent/multi-poly-pro-verified/mini-swe-agent/src/`; `DefaultAgent` + `DockerEnvironment` |
| Evaluated tasks | Exactly 500 canonical IDs; [instance list](logs/instance_ids.txt) |
| Valid context evaluations | 500 / 500; no retrieval-error rows dropped |
| Native outcome denominator | 500; every unsuccessful/conservative outcome remains included |

The dataset revision and evaluator commit identify different repositories and
are intentionally recorded separately. Exact task mappings, source commits,
images and native profiles are in [logs/protocol.json](logs/protocol.json) and
the archived per-case protocols. The instance-list SHA256 is
`94f05c340133973b068edc2ce5c11aaf40b3ebb30f1f537ba055b73eba829836`.

| Reported field | Source and aggregation | Denominator |
| --- | --- | ---: |
| File Recall / Precision / F1 | Per-case `final.file` in `logs/official-metrics.json`; `coverage` is Recall | 500 valid cases |
| Block Recall / Precision / F1 | Per-case `final.symbol`; the website calls the AST symbol level “block” | 500 valid cases |
| Line Recall / Precision / F1 | Per-case `final.line` | 500 valid cases |
| Pass@1 | Boolean `native_resolution` in `logs/joined-results.jsonl` | 500 attempts |
| Mean model usage | Sum each unique search/repair SDK session once, divided by 500 | 5,514 unique sessions / 500 cases |

F1 is calculated from each case's Recall/Precision before macro averaging; it is
not recomputed from the mean Recall and Precision. Slice means below use the same
rule. Macro Precision describes overlap with annotated context, not whether every
other read line was useless to the repair.

Optional `avg_steps_per_instance`, `avg_lines_per_step` and `dynamics` fields are
omitted from `results.json`. Raw evaluator trajectory summaries are available for
inspection, but cross-worker/solver step alignment and complete source attribution
were not separately certified for whole-system dynamic metrics. SDK sessions are
not relabeled as agent steps, and unreported values are not filled with zeroes.

## Results by task source

Every source slice includes its unsuccessful cases. These are descriptive
partitions of this run; repository composition, languages and native policies
differ between slices.

| Source | Tasks | Resolved | Unresolved | Pass@1 | Model USD/task |
| --- | ---: | ---: | ---: | ---: | ---: |
| SWE-Bench-Verified | 174 | 152 | 22 | 87.36% | $0.39100 |
| SWE-Bench-Pro | 54 | 34 | 20 | 62.96% | $1.32889 |
| SWE-PolyBench | 116 | 92 | 24 | 79.31% | $0.64857 |
| Multi-SWE-Bench | 156 | 110 | 46 | 70.51% | $0.79390 |
| **All tasks** | **500** | **388** | **112** | **77.60%** | **$0.67775** |

| Source | File Recall | Block Recall | Line Recall | Line Precision | Line F1 |
| --- | ---: | ---: | ---: | ---: | ---: |
| SWE-Bench-Verified | 95.25% | 89.77% | 83.95% | 20.22% | 29.74% |
| SWE-Bench-Pro | 78.67% | 78.34% | 71.09% | 25.87% | 35.88% |
| SWE-PolyBench | 85.57% | 86.17% | 81.03% | 23.37% | 31.90% |
| Multi-SWE-Bench | 84.91% | 81.70% | 71.17% | 16.48% | 20.79% |

Verified has the highest native resolution rate in this run. Pro has the highest
mean model usage ($1.32889/task) and the highest line F1; Multi has the lowest line
F1. These observations identify different recall/precision and cost profiles,
not controlled evidence of a language or benchmark effect.

[RESULTS.md](RESULTS.md) contains all nine context metrics for every source,
eight language slices with their sample sizes, exact role costs, and the full
same-ID stage comparison. [logs/result-breakdown.json](logs/result-breakdown.json)
retains unrounded values and input hashes. The report tool checks that weighted
slice means reproduce all nine submitted metrics, that native positives sum to
388, and that exact unique-session fees reconstruct the overall usage.

### Search-stage versus final selected context

| Stage, same 500 IDs | Line Recall | Line Precision | Line F1 | Recorded model usage scope |
| --- | ---: | ---: | ---: | --- |
| Complementary search pair | 77.07% | 20.52% | 28.16% | $5.680771745 search only |
| Final selected context after repair | 77.90% | 20.39% | 28.11% | $338.876600645 search + repair |

Final selection adds **0.83 percentage points of line Recall** while line F1
falls **0.05 points**. Line Recall increases on 35 tasks and is unchanged on 465;
line F1 improves on 23, falls on 100 and is unchanged on 377. Added confirmed
source increases annotated coverage while broadening the selected set.

This is a comparison of stages in one system, not two matched-model repair runs.
There is no search-only Pass@1 baseline here, and the three reused development
repairs have retrospective selected-context exports. The stage comparison does
not assign the 77.60% native Pass@1 to a context component or establish causal
repair-efficiency improvement.

### Why the search role uses Haiku

A separate, pre-full500 **32-task search selection gate** compared the selected
Haiku scout pair with an Opus source-search control. Its metadata selection,
source/raw seals and annotation-access timing are retained in
[the gate evidence](logs/verification/independent32-gate.json).

| Search configuration, separate 32 tasks | Line Recall | Line Precision | Line F1 | Model USD/task |
| --- | ---: | ---: | ---: | ---: |
| Haiku complementary pair | 40.00% | 24.14% | 27.18% | $0.01560 |
| Opus search control | 37.91% | 33.08% | 31.15% | $0.20087 |

The Recall-priority gate favored the pair's Recall/cost tradeoff; its lower F1
is explicitly retained. These are search-stage results on 32 tasks, not repair
outcomes or the full500 headline. Earlier dense/graph preparation stopped before
model evaluation and provides no graph-quality result; the exposed file-surface
screen was not promoted.

## Complete-system model usage

| Role | Unique SDK sessions | Recorded USD | USD/task | Share of model usage |
| --- | ---: | ---: | ---: | ---: |
| Haiku search pair | 1,000 | $5.680771745 | $0.01136154349 | 1.68% |
| Opus repair | 4,514 | $333.1958289 | $0.6663916578 | 98.32% |
| **Total** | **5,514** | **$338.876600645** | **$0.67775320129** | **100%** |

The headline cost includes the search workers and every repair session, including
unsuccessful and stopped attempts. Search receipts are reused without another
request or charge. The cost table is based on recorded SDK model-usage values,
with caching reflected in those records. It excludes compute, native-container
resources, subscription research controls and earlier strategy development;
it is not a reconciled cash invoice or a provider account-credit balance.

## Selection, exposure and failure handling

All 500 canonical annotations had already been exposed before this evaluation;
the full500 result is not an unseen-generalization claim. Three original
development repairs are reused with retrospective selection exports and archived
original inputs/configurations. The other 497 repairs retain their first
executions. The remaining 269 ran in nine fixed phases without external
model-policy retries, task replacement or outcome selection. Edits and self-tests
inside one attempt remain visible in its trajectory.

Each new candidate patch is generated by the solver. Native grading receives its
unchanged first-attempt final patch; reference fixes, native test patches and
grading feedback stay outside model inputs. Source/environment recoveries and
neutral/reference controls add no candidate score. All original failed controls,
base/test conflicts and collection errors remain retained.

| Native-policy detail | Treatment in this submission |
| --- | --- |
| Three Poly identifier defects | Retained as conservative negatives; not excluded |
| Pro base-source/test-patch conflicts and collection-blocked pylint case | Original unsuccessful outcomes and missing execution evidence retained |
| Baseline-positive `django-7530` | Included and explicitly disclosed |
| Resource/network/affinity/process/capture corrections | Recorded separately from inference, with source/test/scorer identities and original failed controls preserved |
| Native positive | The pinned required criteria passed; it does not mean every repository test passed |

[REVIEW_NOTES.md](REVIEW_NOTES.md) retains full native-policy, source admission,
failed-control, capture and redaction details. Maintainers must review task
population, source parser/attribution and native-policy comparability before
leaderboard publication.

## Artifact map and verification

| Path | What to inspect |
| --- | --- |
| [metadata.json](metadata.json), [results.json](results.json) | Submission identity/setup and unchanged leaderboard metrics |
| [logs/instance_ids.txt](logs/instance_ids.txt) | Exact 500-task denominator |
| [logs/official-metrics.json](logs/official-metrics.json) | Original per-case context output and source diagnostics |
| [logs/joined-results.jsonl](logs/joined-results.jsonl) | Native outcomes and unique search/repair usage |
| [logs/repair-index.jsonl](logs/repair-index.jsonl), [logs/evaluation-input.json](logs/evaluation-input.json) | First-patch/selection bindings and the exact evaluator input |
| [logs/verification/](logs/verification/) | Original-input provenance, staged record replay, native closure and release-review evidence |
| [trajectories/coverage-index.json](trajectories/coverage-index.json) | Each task's repair cohort, solver/native/selection archive members and hashes |
| `trajectories/repair-058`, `repair-064`, `repair-055`, `repair-pro-054`, `repair-269` | Five disjoint repair cohorts: 58 + 64 + 55 + 54 + 269 = 500 |
| `trajectories/search-500` | All 1,000 original search workers in ten independent gzip TAR files |
| [artifact-manifest.json](artifact-manifest.json) | SHA256 and size of every submission file except the manifest itself |

There are **69 actual archive files**, totaling **2,946,490,790 bytes (2.744 GiB)**.
Every committed file is at most 50 MiB. Archive indexes list every member,
checksum, byte count and extraction order. No LFS pointers or external links
substitute for raw trajectories. Historical stage readiness flags remain intact;
final companion checks supplement rather than rewrite earlier records.

Known workstation labels and opaque SDK UUIDs are normalized consistently;
original/public commitments preserve replay. Operator credentials are excluded.
Declared credential-pattern matches in pinned public fixtures/source are
contextually classified, including retained public TLS fixtures and upstream
application constants. See [the full redaction disclosure](REVIEW_NOTES.md#raw-evidence-and-redactions).
This is a scoped known-operator/pattern review, not a guarantee to detect arbitrary
secrets or all personal data.

### Rebuild the descriptive tables

From this submission directory, with Python 3.10+ and no extra dependencies:

```bash
python tools/summarize_results.py --check
```

Use `--write` to recreate only `RESULTS.md` and `logs/result-breakdown.json`.
The command verifies their contents against the committed raw records and frozen
`results.json`; it does not rescore contexts, run Docker or make model requests.

## Reproduce the submitted scores

From this submission directory, Python 3.10+ is sufficient; no model keys or
Docker are needed for aggregation and the descriptive report:

```bash
python tools/contextbench_submission_results.py \
  --protocol logs/protocol.json \
  --evaluation logs/official-metrics.json \
  --joined-results logs/joined-results.jsonl \
  --model 'CodeNib (Haiku5.5 search pair + Opus5.5 mini SWE-agent)' \
  --output reproduced-results.json --audit reproduced-aggregation.json
cmp results.json reproduced-results.json
python tools/summarize_results.py --check
```

Aggregation was tested on the actual public files and recreates `results.json`
byte for byte. It checks exactly 500 canonical IDs, explicit native outcomes and
all known search/repair session identities. The descriptive report independently
checks weighted source/language means and exact fee conservation.

[REPRODUCE.md](REPRODUCE.md) includes the complete archive extraction command,
all-500 recorded-input/selection/fee replay, pinned dependency/source locations,
and the original environment-dependent inference and scoring commands. The
record replay authenticates all 500 selected contexts, 4,514 repair interactions,
1,000 search-fee receipts and 269 new native snapshots (5,111 source-file
occurrences). It uses bundled frozen sources and Python audit guards; it is not
an OS sandbox or a fresh source-clone, model or Docker-test replication.

## Review status

This directory requests Agent systems review in [official PR #4](https://github.com/ContextBench/contextbench.github.io/pull/4). The format check, public-input aggregation and actual recorded-input replay pass. The replay is not a fresh model, source-clone or native-test replication. Maintainer comparability review and publication remain pending; this submission does not modify website ranking data.
