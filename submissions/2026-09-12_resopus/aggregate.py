#!/usr/bin/env python3
"""Rebuild leaderboard ``results.json`` from packed submission artifacts.

Reads ``logs/`` and ``trajectories/`` next to this script. No gold data, Docker,
or ContextBench checkout is required.

Usage:
    python3 aggregate.py           # print JSON and compare to results.json
    python3 aggregate.py --write   # overwrite results.json
"""

import argparse
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
LOGS = ROOT / "logs"
TRAJ = ROOT / "trajectories"
SIDECARS = LOGS / "sidecars"
EVAL_PATH = LOGS / "epimetheus_Shuffled_eval.jsonl"
RES_PATH = LOGS / "epimetheus_Shuffled_resolution.jsonl"
META_PATH = ROOT / "metadata.json"
RESULTS_PATH = ROOT / "results.json"
N_INSTANCES = 500
ROUND_DIGITS = 3


def load_jsonl(path: Path) -> list[dict]:
    """Load a JSONL file into a list of objects.

    Args:
        path: JSONL path.

    Returns:
        Parsed records.

    Raises:
        FileNotFoundError: If ``path`` is missing.
        ValueError: If a line is not a JSON object.
    """
    rows: list[dict] = []
    with path.open(encoding="utf-8") as handle:
        for lineno, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            if not isinstance(rec, dict):
                raise ValueError(f"{path}:{lineno} is not a JSON object")
            rows.append(rec)
    return rows


def mean(values: list[float]) -> float:
    """Return the arithmetic mean.

    Args:
        values: Non-empty numeric sample.

    Returns:
        Mean of ``values``.

    Raises:
        ValueError: If ``values`` is empty.
    """
    if not values:
        raise ValueError("cannot average an empty list")
    return sum(values) / len(values)


def r3(value: float) -> float:
    """Round a metric to three decimal places.

    Args:
        value: Unrounded mean.

    Returns:
        ``round(value, 3)``.
    """
    return round(value, ROUND_DIGITS)


def span_key(span: dict) -> tuple:
    """Hashable identity for a recorded line span.

    Args:
        span: Span dict with ``type`` / ``start`` / ``end``.

    Returns:
        ``(type, start, end)`` tuple.
    """
    return (span.get("type"), span.get("start"), span.get("end"))


def union_step_spans(pred_steps: list) -> dict[str, set[tuple]]:
    """Collect unique spans from ordered trajectory steps.

    Args:
        pred_steps: ``traj_data.pred_steps`` list.

    Returns:
        Map of file path to span-key sets.
    """
    union: dict[str, set[tuple]] = {}
    for step in pred_steps or []:
        spans = (step or {}).get("spans") or {}
        if not isinstance(spans, dict):
            continue
        for path, items in spans.items():
            bucket = union.setdefault(path, set())
            for span in items or []:
                if isinstance(span, dict):
                    bucket.add(span_key(span))
    return {path: keys for path, keys in union.items() if keys}


def pred_span_sets(pred_spans: dict) -> dict[str, set[tuple]]:
    """Collect unique spans from the final ``pred_spans`` map.

    Empty file entries (touched files with no line ranges) are ignored so the
    comparison is over actual line evidence.

    Args:
        pred_spans: ``traj_data.pred_spans`` map.

    Returns:
        Map of file path to span-key sets.
    """
    out: dict[str, set[tuple]] = {}
    for path, items in (pred_spans or {}).items():
        keys = {span_key(span) for span in (items or []) if isinstance(span, dict)}
        if keys:
            out[path] = keys
    return out


def assert_pred_spans_are_step_union(instance_id: str, traj: dict) -> None:
    """Fail if final spans are not the union of step spans.

    Args:
        instance_id: Instance being checked.
        traj: ``traj_data`` object.

    Raises:
        ValueError: If span sets differ.
    """
    union = union_step_spans(traj.get("pred_steps") or [])
    final = pred_span_sets(traj.get("pred_spans") or {})
    if union != final:
        raise ValueError(
            f"{instance_id}: pred_spans is not the union of pred_steps spans "
            "(usage_drop cannot be reported as 0.0)"
        )


def step_line_count(step: dict) -> int:
    """Inclusive line-span length recorded on one step.

    Args:
        step: One ``pred_steps`` entry.

    Returns:
        Sum of ``end - start + 1`` over line spans.
    """
    total = 0
    spans = (step or {}).get("spans") or {}
    if not isinstance(spans, dict):
        return 0
    for items in spans.values():
        for span in items or []:
            if not isinstance(span, dict):
                continue
            start = span.get("start")
            end = span.get("end")
            if isinstance(start, int) and isinstance(end, int):
                total += max(0, end - start + 1)
    return total


def macro_level(rows: list[dict], gran: str) -> dict[str, float]:
    """Macro-mean coverage / precision / F1 for one granularity.

    Args:
        rows: Valid eval records (no ``error``).
        gran: ``file``, ``symbol``, or ``line``.

    Returns:
        Rounded recall (coverage), precision, and F1.
    """
    metrics = [row.get("final", {}).get(gran) or {} for row in rows]
    missing = [i for i, item in enumerate(metrics) if not item]
    if missing:
        raise ValueError(f"eval rows missing final.{gran}: {len(missing)}")
    return {
        "recall": r3(mean([float(item["coverage"]) for item in metrics])),
        "precision": r3(mean([float(item["precision"]) for item in metrics])),
        "f1": r3(mean([float(item["f1"]) for item in metrics])),
    }


def aggregate() -> dict:
    """Build the leaderboard results object from packed artifacts.

    Returns:
        ``results.json`` payload.

    Raises:
        ValueError: If coverage counts or span-union checks fail.
    """
    meta = json.loads(META_PATH.read_text(encoding="utf-8"))
    eval_rows = load_jsonl(EVAL_PATH)
    res_rows = load_jsonl(RES_PATH)
    if len(eval_rows) != N_INSTANCES:
        raise ValueError(f"eval jsonl has {len(eval_rows)} rows, expected {N_INSTANCES}")
    if len(res_rows) != N_INSTANCES:
        raise ValueError(f"resolution jsonl has {len(res_rows)} rows, expected {N_INSTANCES}")

    valid = [row for row in eval_rows if "error" not in row]
    if len(valid) != N_INSTANCES - 1:
        raise ValueError(f"expected {N_INSTANCES - 1} valid eval rows, got {len(valid)}")

    resolved = sum(1 for row in res_rows if row.get("resolved") is True)

    traj_files = sorted(TRAJ.glob("*.epimetheus.json"))
    if len(traj_files) != N_INSTANCES:
        raise ValueError(f"trajectories has {len(traj_files)} files, expected {N_INSTANCES}")

    n_steps = 0
    n_step_lines = 0
    for path in traj_files:
        rec = json.loads(path.read_text(encoding="utf-8"))
        traj = rec.get("traj_data") or {}
        instance_id = rec.get("instance_id") or path.name
        assert_pred_spans_are_step_union(str(instance_id), traj)
        steps = traj.get("pred_steps") or []
        n_steps += len(steps)
        n_step_lines += sum(step_line_count(step) for step in steps)

    sidecar_files = sorted(SIDECARS.glob("*.json"))
    if len(sidecar_files) != N_INSTANCES:
        raise ValueError(f"sidecars has {len(sidecar_files)} files, expected {N_INSTANCES}")
    costs: list[float] = []
    for path in sidecar_files:
        rec = json.loads(path.read_text(encoding="utf-8"))
        usage = rec.get("api_usage") or {}
        if "cost_usd" not in usage:
            raise ValueError(f"{path.name} missing api_usage.cost_usd")
        costs.append(float(usage["cost_usd"]))

    auc: list[float] = []
    red: list[float] = []
    for row in valid:
        traj_metrics = row.get("trajectory") or {}
        auc_val = (traj_metrics.get("auc_coverage") or {}).get("line")
        red_val = (traj_metrics.get("redundancy") or {}).get("line")
        if auc_val is None or red_val is None:
            raise ValueError(
                f"{row.get('instance_id')}: missing trajectory.auc_coverage.line "
                "or redundancy.line"
            )
        auc.append(float(auc_val))
        red.append(float(red_val))

    avg_steps = n_steps / N_INSTANCES
    avg_lines = n_step_lines / n_steps if n_steps else 0.0

    return {
        "model": meta["model"],
        "performance": {
            "file": macro_level(valid, "file"),
            "block": macro_level(valid, "symbol"),
            "line": macro_level(valid, "line"),
            "pass_at_1": r3(resolved / N_INSTANCES),
        },
        "patterns": {
            "avg_steps_per_instance": r3(avg_steps),
            "avg_lines_per_step": r3(avg_lines),
            "avg_cost_per_instance": r3(mean(costs)),
        },
        "dynamics": {
            "efficiency": r3(mean(auc)),
            "redundancy": r3(mean(red)),
            "usage_drop": 0.0,
        },
    }


def dumps_results(payload: dict) -> str:
    """Serialize results with stable two-space indent.

    Args:
        payload: Results object.

    Returns:
        JSON text ending in a newline.
    """
    return json.dumps(payload, indent=2) + "\n"


def main() -> int:
    """Run aggregation and optionally write ``results.json``.

    Returns:
        Process exit code.
    """
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--write",
        action="store_true",
        help="Overwrite results.json with the aggregated payload",
    )
    args = parser.parse_args()

    payload = aggregate()
    text = dumps_results(payload)
    sys.stdout.write(text)

    if args.write:
        RESULTS_PATH.write_text(text, encoding="utf-8")
        print(f"wrote {RESULTS_PATH}", file=sys.stderr)
        return 0

    if not RESULTS_PATH.is_file():
        print("results.json is missing; pass --write to create it", file=sys.stderr)
        return 1
    committed = json.loads(RESULTS_PATH.read_text(encoding="utf-8"))
    if committed != payload:
        print("aggregated payload does not match results.json", file=sys.stderr)
        return 1
    print("matches results.json", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
