"""Reproduce descriptive result tables from the committed evaluation records.

No model, repository checkout, native test, or optional dependency is needed.
This does not rescore contexts or modify the submitted results.json.
"""

import argparse
import hashlib
import json
import math
import statistics
from collections import Counter
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = (
    "SWE-Bench-Verified",
    "SWE-Bench-Pro",
    "SWE-PolyBench",
    "Multi-SWE-Bench",
)
LEVELS = {"file": "file", "block": "symbol", "line": "line"}


def load(name):
    return json.loads((ROOT / name).read_text())


def digest(name):
    return hashlib.sha256((ROOT / name).read_bytes()).hexdigest()


def close(actual, expected):
    if not math.isclose(actual, expected, rel_tol=0, abs_tol=1e-12):
        raise ValueError(f"Aggregate differs from frozen result: {actual}, {expected}")


def build():
    report = load("logs/official-metrics.json")
    results = load("results.json")
    reference = load("logs/verification/canonical500-summary.json")
    joined = [
        json.loads(line)
        for line in (ROOT / "logs/joined-results.jsonl").read_text().splitlines()
    ]
    ids = (ROOT / "logs/instance_ids.txt").read_text().splitlines()
    cases = {row["instance_id"]: row for row in report["cases"]}
    if (
        len(joined) != 500
        or len(cases) != 500
        or len(set(ids)) != 500
        or set(ids) != set(cases)
        or Counter(row["instance_id"] for row in joined) != Counter(ids)
        or report["summary"]["num_valid"] != 500
    ):
        raise ValueError("Expected exactly the complete 500 canonical cases")

    identities = set()
    for row in joined:
        if type(row["native_resolution"]) is not bool:
            raise ValueError("Native outcome must be an explicit boolean")
        if not row["usage"]["all_session_fees_and_identities_known"]:
            raise ValueError("Unknown session identity or fee")
        for session in row["usage"]["sessions"]:
            identity = session["session_id_sha256"]
            if identity in identities or Decimal(str(session["usage_usd"])) < 0:
                raise ValueError("Duplicate session or negative fee")
            if not session["phase"].startswith(("search:", "repair:")):
                raise ValueError("Unrecognized model role")
            identities.add(identity)
    if len(identities) != 5514:
        raise ValueError("Expected all 5,514 unique metered sessions")

    def summarize(rows):
        n = len(rows)
        metrics = {}
        for public, internal in LEVELS.items():
            scores = [cases[row["instance_id"]]["final"][internal] for row in rows]
            metrics[public] = {
                "recall": statistics.fmean(x["coverage"] for x in scores),
                "precision": statistics.fmean(x["precision"] for x in scores),
                "f1": statistics.fmean(
                    (
                        2
                        * x["coverage"]
                        * x["precision"]
                        / (x["coverage"] + x["precision"])
                        if x["coverage"] + x["precision"]
                        else 0.0
                    )
                    for x in scores
                ),
            }
        costs = {}
        for phase in ("search", "repair"):
            sessions = [
                s
                for row in rows
                for s in row["usage"]["sessions"]
                if s["phase"].startswith(phase + ":")
            ]
            costs[phase] = {
                "SDK_sessions": len(sessions),
                "usage_usd_decimal": str(
                    sum((Decimal(str(s["usage_usd"])) for s in sessions), Decimal(0))
                ),
            }
        total = sum(
            (Decimal(c["usage_usd_decimal"]) for c in costs.values()), Decimal(0)
        )
        resolved = sum(row["native_resolution"] for row in rows)
        return {
            "cases": n,
            "resolved": resolved,
            "unresolved": n - resolved,
            "pass_at_1": resolved / n,
            "context": metrics,
            "model_usage_by_role": costs,
            "total_model_usage_usd_decimal": str(total),
            "model_usage_per_case_usd": float(total / n),
        }

    overall = summarize(joined)
    by_source = {
        source: summarize(
            [r for r in joined if r["instance_id"].split("__")[0] == source]
        )
        for source in SOURCES
    }
    languages = sorted({r["instance_id"].split("__")[1] for r in joined})
    by_language = {
        language: summarize(
            [r for r in joined if r["instance_id"].split("__")[1] == language]
        )
        for language in languages
    }
    for level in LEVELS:
        for metric, value in overall["context"][level].items():
            close(value, results["performance"][level][metric])
            for groups in (by_source, by_language):
                close(
                    sum(
                        g["cases"] * g["context"][level][metric]
                        for g in groups.values()
                    )
                    / 500,
                    value,
                )
    close(overall["pass_at_1"], results["performance"]["pass_at_1"])
    close(
        overall["model_usage_per_case_usd"],
        results["patterns"]["avg_cost_per_instance"],
    )
    for groups in (by_source, by_language):
        if sum(g["cases"] for g in groups.values()) != 500:
            raise ValueError("Group denominators do not sum to 500")
        if sum(g["resolved"] for g in groups.values()) != 388:
            raise ValueError("Group resolutions do not sum to 388")
        if sum(
            (Decimal(g["total_model_usage_usd_decimal"]) for g in groups.values()),
            Decimal(0),
        ) != Decimal(overall["total_model_usage_usd_decimal"]):
            raise ValueError("Group fees do not reconstruct exact overall fees")
    return {
        "scope": (
            "Descriptive regrouping of unchanged submitted500; "
            "not a new run or causal ablation"
        ),
        "input_sha256": {
            name: digest(name)
            for name in (
                "logs/official-metrics.json",
                "logs/joined-results.jsonl",
                "logs/instance_ids.txt",
                "results.json",
                "logs/verification/canonical500-summary.json",
            )
        },
        "aggregation": (
            "Per-case F1 then macro mean; every original native outcome "
            "and unique model session retained"
        ),
        "overall": overall,
        "by_source": by_source,
        "by_language": by_language,
        "same500_search_context": reference["same500_search_reference_macro"],
        "same500_descriptive_delta_counts": reference[
            "same_ID_descriptive_delta_audit"
        ],
        "all_group_weighted_metrics_and_exact_fees_reconstruct_submitted_results": True,
        "new_model_calls": 0,
        "native_tests_rerun": 0,
        "official_context_rescoring": False,
    }


def percent(value):
    return f"{100 * value:.2f}%"


def render(data):
    lines = [
        "# Descriptive results for the submitted 500 tasks",
        "",
        "Generated by `python tools/summarize_results.py --write`; verify with",
        "`python tools/summarize_results.py --check`. All values come from the",
        "unchanged committed records. This is neither a new experiment nor a",
        "causal ablation. Exact values and input hashes are in",
        "[logs/result-breakdown.json](logs/result-breakdown.json).",
        "",
        "Every context mean includes every case in its row. F1 is calculated per",
        "case before averaging. Full-system source attribution remains partial;",
        "prior annotation exposure and native-policy disclosures in the",
        "[README](README.md) apply to every slice below.",
        "",
        "## Native outcomes and model usage by source",
        "",
        "| Source | Cases | Resolved | Unresolved | Pass@1 | Search USD | "
        "Repair USD | Total USD/case |",
        "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for source, row in [*data["by_source"].items(), ("All tasks", data["overall"])]:
        fees = row["model_usage_by_role"]
        lines.append(
            f"| {source} | {row['cases']} | {row['resolved']} | "
            f"{row['unresolved']} | {percent(row['pass_at_1'])} | "
            f"{float(fees['search']['usage_usd_decimal']):.6f} | "
            f"{float(fees['repair']['usage_usd_decimal']):.6f} | "
            f"{row['model_usage_per_case_usd']:.6f} |"
        )
    lines.extend(
        [
            "",
            "SDK model usage excludes compute and prior strategy development;",
            "it is not a reconciled cash invoice. SDK sessions are not HTTP counts",
            "or a substitute for the benchmark's trajectory-step definition.",
            "",
            "## Context metrics by source",
            "",
            "| Source | Level | Recall | Precision | F1 |",
            "| --- | --- | ---: | ---: | ---: |",
        ]
    )
    for source, row in data["by_source"].items():
        for level, metrics in row["context"].items():
            lines.append(
                f"| {source} | {level} | {percent(metrics['recall'])} | "
                f"{percent(metrics['precision'])} | {percent(metrics['f1'])} |"
            )
    lines.extend(
        [
            "",
            "## Descriptive language slices",
            "",
            "Language labels come from canonical task IDs. These groups differ in",
            "size, source benchmark and repository composition, so they do not isolate",
            "a language effect or establish performance on unseen repositories.",
            "",
            "| Language | Cases | Resolved | Pass@1 | Line Recall | Line F1 | USD/case |",
            "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for language, row in data["by_language"].items():
        line = row["context"]["line"]
        lines.append(
            f"| {language} | {row['cases']} | {row['resolved']} | "
            f"{percent(row['pass_at_1'])} | {percent(line['recall'])} | "
            f"{percent(line['f1'])} | {row['model_usage_per_case_usd']:.6f} |"
        )
    lines.extend(
        [
            "",
            "## Search-stage and final selected context on the same 500 IDs",
            "",
            "| Level | Search Recall | Final Recall | Search Precision | "
            "Final Precision | Search F1 | Final F1 |",
            "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for level in LEVELS:
        before = data["same500_search_context"][level]
        after = data["overall"]["context"][level]
        cells = [
            percent(row[metric])
            for metric in ("recall", "precision", "f1")
            for row in (before, after)
        ]
        lines.append(f"| {level} | " + " | ".join(cells) + " |")
    lines.extend(
        [
            "",
            "The final selection retains search observations and adds confirmed",
            "original-version repair reads. The two rows are stages of one pipeline,",
            "not separate matched-model repair systems. Three development repairs",
            "have retrospective selection exports. See the README for selection and",
            "source-attribution scope. Unreported optional dynamics are not filled",
            "with zeroes. No frozen score, outcome or original receipt is rewritten.",
        ]
    )
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument(
        "--write", action="store_true", help="Write only descriptive outputs"
    )
    mode.add_argument(
        "--check",
        action="store_true",
        help="Check committed descriptive outputs (default)",
    )
    args = parser.parse_args()
    data = build()
    outputs = {
        ROOT / "logs/result-breakdown.json": json.dumps(data, indent=2) + "\n",
        ROOT / "RESULTS.md": render(data),
    }
    for path, expected in outputs.items():
        if args.write:
            path.write_text(expected)
        elif path.read_text() != expected:
            raise ValueError(f"Descriptive output differs: {path.name}")
    print(
        "Verified 500 cases, 388 resolutions, 5,514 unique sessions "
        "and all frozen aggregate metrics."
    )


if __name__ == "__main__":
    main()
