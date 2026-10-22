#!/usr/bin/env python3
# Copyright (c) Huawei Technologies Co., Ltd. 2026. All rights reserved.
"""Rebuild results.json of a ContextBench submission folder from its raw logs (stdlib only).

  python3 aggregate.py          # exit 0 when the rebuilt performance block matches results.json
  python3 aggregate.py --write  # overwrite the performance block

Retrieval: macro mean over every instance in logs/instance_ids.txt of the per-instance values in
logs/eval_final.jsonl (final.file / final.symbol / final.line; recall = coverage). Instances whose eval
row has no "final" (empty block, evaluation error) count as 0. F1 is the mean of per-instance F1.
Pass@1: logs/resolution.jsonl, denominator = number of instances.
"""

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def f1(m):
    c, p = float(m.get("coverage") or 0), float(m.get("precision") or 0)
    return 0.0 if c + p == 0 else 2 * c * p / (c + p)


def main():
    ids = [line.split("\t")[1] for line in (HERE / "logs" / "instance_ids.txt").read_text().splitlines() if line.strip()]
    ev = {e["instance_id"]: e for e in map(json.loads, open(HERE / "logs" / "eval_final.jsonl"))}
    res = [json.loads(line) for line in open(HERE / "logs" / "resolution.jsonl")]
    perf = {}
    for lvl, name in (("file", "file"), ("symbol", "block"), ("line", "line")):
        vals = [ev.get(i, {}).get("final", {}).get(lvl) for i in ids]
        perf[name] = {
            "recall": round(sum((v or {}).get("coverage", 0.0) for v in vals) / len(ids), 3),
            "precision": round(sum((v or {}).get("precision", 0.0) for v in vals) / len(ids), 3),
            "f1": round(sum(f1(v) if v else 0.0 for v in vals) / len(ids), 3),
        }
    perf["pass_at_1"] = round(sum(bool(r.get("resolved")) for r in res) / len(ids), 3)
    path = HERE / "results.json"
    current = json.loads(path.read_text())
    if "--write" in sys.argv:
        current["performance"] = perf
        path.write_text(json.dumps(current, indent=2) + "\n")
        print("wrote", path)
        return 0
    ok = current.get("performance") == perf
    print("match" if ok else f"MISMATCH\nrebuilt  {perf}\ncommitted {current.get('performance')}")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
