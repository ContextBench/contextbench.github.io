"""Verify bounded support parts and their evidence links without extraction.

This authenticates declared bytes and prior-proof linkage, not the full agent
replay, fresh native execution, privacy absence or leaderboard comparability.
"""
import argparse
import hashlib
import io
import json
import tarfile
from pathlib import Path, PurePosixPath


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main(parts):
    index = json.loads((parts / "artifact-index.json").read_text())
    assert index["compression"] == "gzip" and index["cases"] == 231
    assert len(index["parts"]) <= 4
    chunks = []
    for item in index["parts"]:
        assert Path(item["path"]).name == item["path"]
        assert item["bytes"] <= 50 * 1024**2
        data = (parts / item["path"]).read_bytes()
        assert len(data) == item["bytes"] and sha(data) == item["sha256"]
        chunks.append(data)
    combined = b"".join(chunks)
    assert len(combined) <= 100 * 1024**2
    assert sha(combined) == index["compressed_stream_sha256"]
    expected = {row["name"]: row for row in index["members"]}
    assert len(expected) == len(index["members"])
    assert sum(row["bytes"] for row in expected.values()) <= 64 * 1024**2
    files = {}
    with tarfile.open(fileobj=io.BytesIO(combined), mode="r:gz") as archive:
        for member in archive:
            name = PurePosixPath(member.name)
            assert not name.is_absolute() and ".." not in name.parts
            assert member.isfile() and member.name in expected and member.name not in files
            assert member.size == expected[member.name]["bytes"]
            data = archive.extractfile(member).read()
            assert sha(data) == expected[member.name]["sha256"]
            files[member.name] = data
    assert set(files) == set(expected)
    prefix = "review-support231/"
    read = lambda name: json.loads(files[prefix + name])
    manifest = read("support-manifest.json")
    assert sha(files[prefix + "support-manifest.json"]) == index["manifest_sha256"]
    assert {prefix + row["name"] for row in manifest["files"]} == set(files) - {prefix + "support-manifest.json"}
    for row in manifest["files"]:
        assert row["sha256"] == sha(files[prefix + row["name"]])
    assert sha(Path(__file__).read_bytes()) == sha(files[prefix + "verify_support_bundle.py"])
    original = read("Pro54-source-classification/verification.json")
    portable = read("Pro54-portable-check/verification.json")
    findings = read("Pro54-pattern-review/findings.json")["patterns"]
    old_rows = read("Pro54-source-classification/classifications.json")
    new_rows = read("Pro54-portable-check/classifications.json")
    canonical = lambda row: json.dumps(row, sort_keys=True, separators=(",", ":"))
    assert sorted(map(canonical, old_rows)) == sorted(map(canonical, new_rows))
    assert sorted(map(canonical, findings)) == sorted(canonical(row["finding"]) for row in new_rows)
    assert original["original_pattern_findings_retained"] == len(findings) == 216
    assert original["unclassified_findings"] == portable["unclassified_findings"] == 0
    assert original["findings_sha256"] == sha(files[prefix + "Pro54-pattern-review/findings.json"])
    assert original["classifications_sha256"] == sha(files[prefix + "Pro54-source-classification/classifications.json"])
    assert portable["classifications_sha256"] == sha(files[prefix + "Pro54-portable-check/classifications.json"])
    for folder, proof in [("Pro54-source-classification", original), ("Pro54-portable-check", portable)]:
        assert proof["public_provenance_sha256"] == sha(files[prefix + folder + "/public-source-provenance.json"])
        assert proof["actual_part_index_sha256"] == sha(files[prefix + "repair-previews/Pro54/artifact-index.json"])
    assert portable["driver_sha256"] == sha(files[prefix + "verify_pinned_public_source_findings.py"])
    assert portable["portable_git_helper_sha256"] == sha(files[prefix + "portable_review_git.py"])
    assert portable["queue_metadata_sha256"] == sha(files[prefix + "queue-metadata.json"])
    composition = read("231-composition/verification.json")
    replay = read("231-relocated-replay/verification.json")
    assert (composition["cases"], composition["resolved"], composition["unresolved"]) == (231, 188, 43)
    assert composition["all_original55_and_Pro54_findings_retained"] == 344
    assert composition["unclassified_declared_findings"] == 0
    previous = read("177-composition/verification.json")
    previous55 = read("55-source-classification/verification.json")
    previous_findings = read("55-pattern-review/findings.json")["patterns"]
    previous_rows = read("55-source-classification/classifications.json")["records"]
    assert previous55["original_pattern_findings_retained"] == len(previous_findings) == 128
    assert previous55["unclassified_findings"] == 0
    assert previous55["findings_sha256"] == sha(files[prefix + "55-pattern-review/findings.json"])
    assert previous55["classifications_sha256"] == sha(files[prefix + "55-source-classification/classifications.json"])
    assert sorted(map(canonical, previous_findings)) == sorted(canonical(row["finding"]) for row in previous_rows)
    assert composition["previous177_composition_sha256"] == sha(files[prefix + "177-composition/verification.json"])
    bound55 = next(row for row in previous["support"] if row["preview_cases"] == 55)
    assert bound55["contextual_classification"]["proof_sha256"] == sha(files[prefix + "55-source-classification/verification.json"])
    bound_pro = next(row for row in composition["support"] if row["preview_cases"] == 54)
    assert bound_pro["contextual_classification_sha256"] == sha(files[prefix + "Pro54-source-classification/verification.json"])
    assert replay["driver_sha256"] == sha(files[prefix + "replay_publication_repair_receipts.py"])
    assert replay["cases"] == 231 and replay["unique_search_and_repair_sessions"] == 2521
    assert replay["all_selected_contexts_and_usage_recomputed_identically"]
    print(json.dumps({
        "support_members_verified": len(files), "actual_support_parts": len(index["parts"]),
        "recorded_receipt_replay_cases": 231, "all_216_classifications_unchanged": True,
        "all_344_declared_findings_retained_and_bound": True,
        "recorded_total_usage_decimal": replay["total_modeled_usage_decimal"],
        "raw_benchmark_parts_and_native_tests_rerun": False,
        "model_calls": 0, "network_calls": 0,
        "publication_or_full500_approved": False,
    }))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--parts", type=Path, required=True)
    main(parser.parse_args().parts)
