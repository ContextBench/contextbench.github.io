"""Replay published repair inputs, selections and fees in a relocated directory.

Only declared public artifact indices, their actual bounded parts and public
session-digest links are inputs. The worker imports the bundled frozen runtime,
not the original checkout. A Python audit hook restricts opens to the relocated
data/runtime and installed dependencies, and denies networking/child processes.
This also authenticates selected native runtimes and raw-log publication bindings.
It verifies receipt/selection/fee portability, not fresh-clone source footprints,
native test reproduction, new official scores or publication approval.

Exclusive output creation owns decoder/worker children; root owns interrupted
recovery. Original files, paid owners and financial ledgers remain read-only.
"""

import argparse
import collections
import hashlib
import io
import json
import os
import shutil
import subprocess
import sys
import tarfile
from decimal import Decimal
from pathlib import Path, PurePosixPath


def load(path):
    return json.loads(path.read_text())


def sha(path):
    value = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024**2), b""):
            value.update(block)
    return value.hexdigest()


def save(path, value):
    with path.open("x") as stream:
        json.dump(value, stream, indent=2)
        stream.write("\n")


def safe_relative(name):
    path = PurePosixPath(name)
    if path.is_absolute() or ".." in path.parts or "\\" in name or not path.parts:
        raise ValueError("Unsafe archived member name")
    return Path(*path.parts)


def needed_repair(name, closed_index):
    path = PurePosixPath(name)
    return (
        name == closed_index
        or "/native-runtime/" in name
        or path.name in {"protocol.json", "native-case.jsonl", "native-log-streams.json", "fix-patch-run.stdout.log", "fix-patch-run.stderr.log", "fix-patch-run.log"}
        or name == "publication-support/repair-runtime-source.tar.gz"
        or path.name in {
            "solver.json", "model-observations.json", "search-pair-handoff.json",
            "whole-run-usage.json", "selected-context.json", "selection-receipt.json",
            "resolution.json", "predictions.json", "whole-run-result.json",
            "redaction-manifest.json", "session-digest-linkage.json",
        }
        or path.name == "config.json" and path.parent.name in {"solver", "native", "native-recovery"}
    )


def decode_parts(folder, destination, select, *, zstd_work):
    index = load(folder / "artifact-index.json")
    expected = {row["name"]: row for row in index["members"]}
    assert len(expected) == len(index["members"])
    seen, selected = set(), set()
    whole = hashlib.sha256()
    paths = []
    for item in index["parts"]:
        assert Path(item["path"]).name == item["path"]
        path = folder / item["path"]
        assert path.stat().st_size == item["bytes"] and sha(path) == item["sha256"]
        paths.append(path)
    is_zstd = "compressed_stream_sha256" in index
    if is_zstd:
        with zstd_work.open("xb") as target:
            for path in paths:
                with path.open("rb") as source:
                    for block in iter(lambda: source.read(1024**2), b""):
                        target.write(block)
                        whole.update(block)
        assert whole.hexdigest() == index["compressed_stream_sha256"]

    def extract(archive):
        for member in archive:
            assert member.isfile() and member.name in expected and member.name not in seen
            relative = safe_relative(member.name)
            item = expected[member.name]
            size = item.get("publication_bytes", item.get("bytes"))
            checksum = item.get("publication_sha256", item.get("sha256"))
            assert member.size == size
            keep = select(member.name)
            target_path = destination / relative
            target, count, value = None, 0, hashlib.sha256()
            if keep:
                target_path.parent.mkdir(parents=True, exist_ok=True)
                if not target_path.exists():
                    target = target_path.open("xb")
            try:
                with archive.extractfile(member) as source:
                    for block in iter(lambda: source.read(1024**2), b""):
                        count += len(block)
                        value.update(block)
                        if target:
                            target.write(block)
            finally:
                if target:
                    target.close()
            assert count == size and value.hexdigest() == checksum
            if keep:
                assert target_path.stat().st_size == size and sha(target_path) == checksum
                selected.add(member.name)
            seen.add(member.name)

    if is_zstd:
        with zstd_work.with_suffix(".decoder.log").open("x") as log:
            child = subprocess.Popen(["zstd", "-d", "--memory=1024MB", "-c", str(zstd_work)], stdout=subprocess.PIPE, stderr=log)
            try:
                with tarfile.open(fileobj=child.stdout, mode="r|", bufsize=1024**2) as archive:
                    extract(archive)
                while child.stdout.read(1024**2):
                    pass
                child.stdout.close()
                assert child.wait(timeout=60) == 0
            finally:
                if child.poll() is None:
                    child.kill()
                    child.wait(timeout=30)
        zstd_work.unlink()
    else:
        for path in paths:
            with tarfile.open(path, "r:gz") as archive:
                extract(archive)
    assert seen == set(expected)
    return {"artifact_index_sha256": sha(folder / "artifact-index.json"), "parts_verified": len(paths), "all_archived_members_hashed": len(seen), "members_materialized_for_replay": len(selected)}


def extract_runtime(archive_path, destination):
    count = 0
    with tarfile.open(archive_path, "r:gz") as archive:
        for member in archive:
            relative = safe_relative(member.name)
            assert member.isdir() or member.isfile()
            path = destination / relative
            if member.isdir():
                path.mkdir(parents=True, exist_ok=True)
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                with path.open("xb") as target, archive.extractfile(member) as source:
                    shutil.copyfileobj(source, target)
                count += 1
    assert (destination / "scripts/benchmark_context_solver.py").is_file()
    return count


NATIVE_SNAPSHOT_SHA256 = {'scripts/contextbench_polybench.py': '4a3467355777288d4c5394974378011f9ff3cded10a4f0ce72b6ce6869d83fb9', 'scripts/contextbench_multiswe.py': 'cd57d1c4b0c511dec831de96303a8da43c6b97699d74563b3384a2cc676db356', 'scripts/contextbench_native_repos.py': '43452b86b1497b345ab6117239db86e650f3e27f8c8876275d394e4a3d66b42b', 'scripts/__init__.py': '1322eda6587c3ae7394160da8579f3f8f8644c106f42f95691e111fdfa2a7987'}
MULTI_NATIVE_SHA256 = ['2b9cb791df1f2a2192e52b97651920d2585e98156afa780062aef5085025a67b', 'cd57d1c4b0c511dec831de96303a8da43c6b97699d74563b3384a2cc676db356', 'c30a17eb2741e05ffe4e19f323ea2d82bf72fd9833dfee7d2a5ca1c4147d283c', 'fd90e187b50041cdf53fd816037653e8df56625a01cdd965fcd5a12daed7f5d5', 'd040d83583086a58fbb16e3160420a2584bdb249faae084f1776f5d485f4b71d']


def expected_native_manifest():
    expected = dict(NATIVE_SNAPSHOT_SHA256)
    for digest in MULTI_NATIVE_SHA256:
        for name in ["scripts/contextbench_multiswe.py", "scripts/contextbench_native_repos.py", "scripts/__init__.py"]:
            expected[f"multi-{digest}/{name}"] = digest if name.endswith("contextbench_multiswe.py") else NATIVE_SNAPSHOT_SHA256[name]
    return expected


def published_native_file(root, name, original, expected_original_sha256):
    """Bind original hashes to actual publication bytes without private inputs."""
    path = root / safe_relative(name)
    assert path.is_file() and not path.is_symlink()
    assert path.resolve().is_relative_to(root.resolve())
    item = original[name]
    assert item["original_sha256"] == expected_original_sha256
    assert path.stat().st_size == item["publication_bytes"]
    assert sha(path) == item["publication_sha256"]
    return path


def replay_native_raw_logs(root, row, config, resolution, original):
    bindings = row.get("native_log_capture_artifact_sha256", {})
    if config.get("native_log_streams", "merged") != "separate":
        assert not bindings
        return {}
    assert len(bindings) == 4
    capture_names = [name for name in bindings if PurePosixPath(name).name == "native-log-streams.json"]
    assert len(capture_names) == 1
    relative_capture = capture_names[0]
    capture_name = str(PurePosixPath(row["native_run"]) / safe_relative(relative_capture).as_posix())
    capture_path = published_native_file(root, capture_name, original, resolution["native_log_capture_sha256"])
    capture = load(capture_path)
    assert capture == resolution["native_log_capture"] and capture["mode"] == "separate"
    assert capture["composition"] == ["fix-patch-run.stdout.log", "fix-patch-run.stderr.log"]
    assert set(capture["files"]) == set(capture["composition"] + ["fix-patch-run.log"])
    relative_work = PurePosixPath(relative_capture).parent
    expected_bindings = {relative_capture: resolution["native_log_capture_sha256"]}
    contents = {}
    for name, details in capture["files"].items():
        relative = str(relative_work / name)
        expected_bindings[relative] = details["sha256"]
        full_name = str(PurePosixPath(row["native_run"]) / relative)
        path = published_native_file(root, full_name, original, details["sha256"])
        assert original[full_name]["original_bytes"] == details["bytes"]
        contents[name] = path.read_bytes()
    assert bindings == expected_bindings
    stdout, stderr = [contents[name] for name in capture["composition"]]
    separator = b"\n" if stdout and stderr and not stdout.endswith(b"\n") else b""
    assert bytes.fromhex(capture["separator_hex"]) == separator
    assert capture["separator_offset"] == capture["files"][capture["composition"][0]]["bytes"]
    assert contents["fix-patch-run.log"] == stdout + separator + stderr
    assert resolution["native_log_sha256"] == capture["files"]["fix-patch-run.log"]["sha256"]
    return {"separate_native_capture_records": 1, "native_raw_log_files": len(bindings)}


def replay_native_runtime(root, row, config, resolution, original):
    counters = replay_native_raw_logs(root, row, config, resolution, original)
    if "native_runtime" not in row:
        return counters
    expected = expected_native_manifest()
    assert row["native_runtime_artifact_sha256"] == expected
    solver = PurePosixPath(row["solver_run"])
    runtime = PurePosixPath(row["native_runtime"])
    assert runtime == solver.parent / "native-runtime"
    protocol_name = str(solver.parents[2] / "protocol.json")
    protocol = load(published_native_file(root, protocol_name, original, row["batch_protocol_sha256"]))
    assert protocol["native_implementation"] == expected
    selected = [case for case in protocol["cases"] if case["instance_id"] == row["instance_id"]]
    assert len(selected) == 1
    case = selected[0]
    assert case["reuse_completed_candidate_repair"] is False
    if case["source"] == "SWE-PolyBench":
        adapter = "scripts/contextbench_polybench.py"
        digest = NATIVE_SNAPSHOT_SHA256[adapter]
    else:
        assert case["source"] == "Multi-SWE-Bench"
        profile = case["native_execution_profile"]
        digest = profile["adapter_sha256"]
        assert digest in MULTI_NATIVE_SHA256
        adapter = f"multi-{digest}/scripts/contextbench_multiswe.py"
        assert config["timeout"] == profile["wall_timeout_s"]
        assert config.get("native_resources") == profile["native_resources"]
        resources = profile["native_resources"]
        prefix = ["/usr/bin/taskset", "--cpu-list", resources["cpu_affinity"]] if resources and resources.get("cpu_affinity") else []
        assert case["native_command_prefix"] == prefix
        assert case["native_outer_timeout_s"] == profile["wall_timeout_s"] + 420
    assert case["native_adapter"] == adapter and config["adapter_sha256"] == digest
    assert config["image_id"] == case["native_image_id"]
    assert config["source_commit"] == row["base_commit"] == case["base_commit"]
    assert config["source_tree"] == case["source_tree"]
    for name, digest in expected.items():
        published_native_file(root, str(runtime / name), original, digest)
    return {**counters, "native_runtime_snapshots": 1, "native_runtime_files": len(expected)}


def worker(args):
    output = args.output.resolve()
    data = output / "inputs"
    runtime = data / "frozen-runtime"
    roots = [output, Path(sys.prefix).resolve(), Path(sys.base_prefix).resolve(), Path("/usr/lib"), Path("/usr/local/lib"), Path("/usr/share")]
    exact = {Path(p) for p in ["/dev/null", "/dev/urandom", "/etc/localtime", "/etc/os-release", "/etc/ssl/openssl.cnf", "/etc/nsswitch.conf", "/etc/hosts", "/etc/resolv.conf"]}
    denied = collections.Counter()
    denial_details = []
    probes = True

    def audit(event, values):
        if event in {"subprocess.Popen", "os.system", "os.exec", "os.posix_spawn", "socket.connect", "socket.connect_ex", "socket.getaddrinfo"}:
            denied["probe" if probes else "external_process_or_network"] += 1
            if not probes:
                executable = values[0]
                denial_details.append({"event": event, "executable_basename": Path(os.fsdecode(executable)).name if isinstance(executable, (str, bytes)) else None, "operation": "blocked_before_execution"})
            raise PermissionError("Relocated receipt replay forbids processes and networking")
        if event != "open" or isinstance(values[0], int):
            return
        path = Path(os.fsdecode(values[0])).resolve()
        mode, flags = values[1:3]
        writing = any(x in (mode or "") for x in "wa+") or flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND)
        allowed = path == Path("/dev/null") or (path.is_relative_to(output) if writing else path in exact or any(path.is_relative_to(root) for root in roots))
        if not allowed:
            denied["probe" if probes else "outside_relocated_data_or_dependencies"] += 1
            if not probes:
                frame = sys._getframe(1)
                denial_details.append({"event": event, "basename": path.name, "operation": "blocked_before_open", "caller_module_file": Path(frame.f_code.co_filename).name, "caller_function": frame.f_code.co_name})
            raise PermissionError("File access outside declared replay/dependency roots")

    sys.addaudithook(audit)
    for operation in [lambda: open("/forbidden-original-evidence/probe.json"), lambda: subprocess.run(["/bin/true"])]:
        try:
            operation()
        except PermissionError:
            pass
        else:
            raise AssertionError("Replay isolation probe did not reject access")
    assert denied["probe"] == 2
    probes = False
    # Editable-install metadata can inject the original checkout into sys.path.
    # Keep only the declared runtime and installed dependency roots.
    sys.path[:] = [str(runtime)] + [entry for entry in sys.path if entry and any(Path(entry).resolve().is_relative_to(root) for root in roots)]
    from scripts.benchmark_context_solver import model_observations
    from scripts.contextbench_selected_context import selected_context
    from scripts.contextbench_search_pair_solver import _session, whole_run_usage

    origins = {}
    for name, module in list(sys.modules.items()):
        if name in {"scripts", "codenib"} or name.startswith(("scripts.", "codenib.")):
            filename = getattr(module, "__file__", None)
            assert filename and Path(filename).resolve().is_relative_to(runtime)
            origins[name] = {"file": Path(filename).resolve().relative_to(runtime).as_posix(), "sha256": sha(Path(filename))}
    manifest_paths = sorted((data / "repair/publication-support").rglob("redaction-manifest.json"))
    assert manifest_paths
    manifests = [load(path) for path in manifest_paths]
    original = {}
    for manifest in manifests:
        for item in manifest["members"]:
            name = item["name"]
            assert name not in original or original[name]["original_sha256"] == item["original_sha256"]
            original[name] = item
    links = {}
    for path in sorted((data / "repair/publication-support").rglob("session-digest-linkage.json")):
        for new, old in load(path).items():
            assert new not in links or links[new] == old
            links[new] = old
    search_links = load(data / "search-session-digest-linkage.json")
    rows = [json.loads(line) for line in (data / "repair" / safe_relative(args.closed_index)).read_text().splitlines()]
    assert len(rows) == len({row["instance_id"] for row in rows}) == args.cases
    assert set().union(*(set(m["canonical_case_ids"]) for m in manifests)) == {row["instance_id"] for row in rows}
    assert sum(len(m["canonical_case_ids"]) for m in manifests) == args.cases
    records, sessions, repair_calls, search_calls = [], set(), 0, 0
    repair_cost, search_cost = Decimal(0), Decimal(0)
    native_counters, native_ids = collections.Counter(), set()
    for number, row in enumerate(rows, 1):
        identity = row["instance_id"]
        solver_dir = data / "repair" / safe_relative(row["solver_run"])
        native_dir = data / "repair" / safe_relative(row["native_run"])
        solver = load(solver_dir / "solver.json")
        observations = model_observations(solver)
        assert observations == load(solver_dir / "model-observations.json") and observations["all_model_inputs_confirmed"]
        search = load(data / "search/logs/cases" / identity / "haiku_scout_pair-prediction.json")
        selected, _ = selected_context(search, observations, solver["model_patch"])
        assert selected == load(data / "repair" / safe_relative(row["selected_context"]))
        handoff = load(solver_dir / "search-pair-handoff.json")
        actual_search = []
        for label in ["first", "scout"]:
            raw = load(data / "search/trajectories" / identity / label / "trajectory.json")
            assert raw["sdk_reported_cost_usd"] == raw["sdk_result"]["total_cost_usd"]
            session = _session("search:" + label, raw["sdk_result"], raw["sdk_reported_cost_usd"], raw.get("billing_route"))
            session["session_id_sha256"] = search_links[session["session_id_sha256"]]
            actual_search.append(session)
            search_calls += 1
        assert actual_search == handoff["search_sessions"]
        usage = whole_run_usage(handoff, solver, True)
        for session in usage["sessions"]:
            if session["phase"].startswith("repair:"):
                session["session_id_sha256"] = links[session["session_id_sha256"]]
                repair_cost += Decimal(str(session["usage_usd"]))
            else:
                search_cost += Decimal(str(session["usage_usd"]))
            assert session["session_id_sha256"] not in sessions
            sessions.add(session["session_id_sha256"])
        assert usage == load(solver_dir / "whole-run-usage.json")
        native_config, native = load(native_dir / "config.json"), load(native_dir / "resolution.json")
        assert native_config["solver_sha256"] == original[row["solver_run"] + "/solver.json"]["original_sha256"]
        assert native_config["prediction_sha256"] == row["first_patch_sha256"] == sha(solver_dir / "predictions.json")
        predictions = load(solver_dir / "predictions.json")
        assert len(predictions) == 1 and predictions[0]["model_patch"] == solver["model_patch"]
        assert native["status"] == "graded" and native["resolved"] == row["resolved"]
        assert original[row["native_run"] + "/whole-run-result.json"]["original_sha256"] == row["whole_run_result_sha256"]
        whole = load(native_dir / "whole-run-result.json")
        assert whole["usage"] == usage and whole["native_resolution"] == row["resolved"]
        native_counters.update(replay_native_runtime(data / "repair", row, native_config, native, original))
        if "native_runtime" in row:
            native_ids.add(identity)
        repair_calls += len(solver["calls"])
        records.append({"instance_id": identity, "resolved": row["resolved"], "confirmed_repair_inputs": len(observations["confirmed_inputs"]), "search_sessions_from_actual_public_raw": 2, "selected_context_recompiled_identically": True, "usage_recompiled_identically": True, "native_result_bound_to_original_first_patch": True, "retrospective_selection_disclosed": row["retrospective_final_selection_disclosed"]})
        if number % 20 == 0:
            print(json.dumps({"relocated_cases_replayed": number, "model_calls": 0}), flush=True)
    assert len(records) == args.cases and search_calls == 2 * args.cases
    if args.cases == 500:
        canonical_name = str(PurePosixPath(args.closed_index).parents[1] / "protocol.json")
        canonical = load(data / "repair" / safe_relative(canonical_name))["queue"]
        assert len(canonical) == len({case["instance_id"] for case in canonical}) == 500
        assert {case["instance_id"] for case in canonical} == {row["instance_id"] for row in rows}
        expected_native_ids = {case["instance_id"] for case in canonical if case["source"] in {"SWE-PolyBench", "Multi-SWE-Bench"} and not case["reuse_completed_candidate_repair"]}
        assert len(expected_native_ids) == native_counters["native_runtime_snapshots"] == 269
        assert native_ids == expected_native_ids
    save(output / "guard-diagnostics.json", {"counts": dict(denied), "denied_operations": denial_details})
    # Optional user-config/processor probes may be caught by dependencies.
    # They remain blocked; record them rather than granting external access.
    nonprobe_denials = sum(count for label, count in denied.items() if label != "probe")
    assert nonprobe_denials == len(denial_details)
    save(output / "relocated-cases.json", records)
    save(output / "frozen-module-origins.json", origins)
    save(output / "worker-verification.json", {"cases": len(records), "resolved": sum(row["resolved"] for row in records), "unresolved": sum(not row["resolved"] for row in records), "repair_SDK_calls_replayed": repair_calls, "search_SDK_fees_replayed_from_actual_raw": search_calls, "unique_search_and_repair_sessions": len(sessions), "repair_usage_decimal": str(repair_cost), "search_usage_decimal": str(search_cost), "total_modeled_usage_decimal": str(repair_cost + search_cost), "all_original_first_patch_native_bindings_reauthenticated": True, "native_runtime_snapshots_authenticated": native_counters["native_runtime_snapshots"], "native_runtime_file_occurrences_authenticated": native_counters["native_runtime_files"], "separate_native_capture_records_authenticated": native_counters["separate_native_capture_records"], "native_raw_capture_files_authenticated": native_counters["native_raw_log_files"], "native_original_hashes_bound_through_actual_publication_manifests": True, "all_selected_contexts_and_usage_recomputed_identically": True, "all_CodeNib_modules_loaded_from_bundled_frozen_runtime": True, "original_checkout_and_original_experiment_files_not_opened": True, "Python_open_guard_scope_not_OS_sandbox": True, "network_and_external_processes_forbidden": True, "isolation_probe_rejections": denied["probe"], "nonprobe_denials": nonprobe_denials, "blocked_dependency_probes": denial_details, "fresh_clone_source_footprints_replayed": False, "native_tests_rerun": 0, "new_model_calls": 0, "financial_mutations": 0, "formal_full500_submission_ready": False})


def parent(args):
    args.output.mkdir(exist_ok=False)
    output = args.output.resolve()
    data = output / "inputs"
    data.mkdir()
    save(output / "intent.json", {"pid": os.getpid(), "driver_sha256": sha(Path(__file__)), "expected_cases": args.cases, "closed_index": args.closed_index, "inputs_are_public_parts_only": True, "originals_read_only": True, "new_model_calls": 0})
    repair_proofs = []
    for number, parts in enumerate(args.repair_parts):
        repair_proofs.append(decode_parts(parts, data / "repair", lambda name: needed_repair(name, args.closed_index), zstd_work=output / f"repair-{number}.tar.zst"))
        print(json.dumps({"repair_part_sets_decoded": number + 1, "all_members_hashed": repair_proofs[-1]["all_archived_members_hashed"]}), flush=True)
    runtime_archive = data / "repair/publication-support/repair-runtime-source.tar.gz"
    runtime_members = extract_runtime(runtime_archive, data / "frozen-runtime")
    search_proof = decode_parts(args.search_parts, data / "search", lambda name: name.endswith(("/haiku_scout_pair-prediction.json", "/trajectory.json")), zstd_work=output / "unused-search-stream")
    shutil.copyfile(args.search_linkage, data / "search-session-digest-linkage.json")
    save(output / "extraction-verification.json", {"repair_split_part_sets": repair_proofs, "search_split_part_set": search_proof, "runtime_archive_sha256": sha(runtime_archive), "runtime_files_extracted": runtime_members, "search_public_digest_linkage_sha256": sha(data / "search-session-digest-linkage.json")})
    driver = output / "replay-driver.py"
    shutil.copyfile(Path(__file__), driver)
    (output / "tmp").mkdir()
    env = {"PATH": "/usr/bin:/bin", "LC_ALL": "C.UTF-8", "LITELLM_LOCAL_MODEL_COST_MAP": "True", "HF_HUB_OFFLINE": "1", "TRANSFORMERS_OFFLINE": "1", "HF_HOME": str(output / "cache/hf"), "XDG_CACHE_HOME": str(output / "cache"), "TIKTOKEN_CACHE_DIR": str(output / "cache/tokenizers"), "TMPDIR": str(output / "tmp")}
    with (output / "worker.log").open("x") as log:
        completed = subprocess.run([sys.executable, "-I", "-B", str(driver), "--worker", "--output", str(output), "--cases", str(args.cases), "--closed-index", args.closed_index], cwd=output, env=env, stdout=log, stderr=subprocess.STDOUT, timeout=1800)
    assert completed.returncode == 0, "Relocated replay failed; original records are unchanged"
    proof = load(output / "worker-verification.json")
    proof.update({"repair_split_part_sets": repair_proofs, "search_split_part_set": search_proof, "bundled_runtime_files_extracted": runtime_members, "runtime_archive_sha256": sha(runtime_archive), "search_public_digest_linkage_sha256": sha(data / "search-session-digest-linkage.json"), "driver_sha256": sha(driver), "selective_extraction_only_full_archives_preserved": True, "official_context_scoring_rerun": False, "publication_approved": False})
    save(output / "verification.json", proof)
    print(json.dumps(proof), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repair-parts", action="append", type=Path)
    parser.add_argument("--search-parts", type=Path)
    parser.add_argument("--search-linkage", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--cases", type=int, required=True)
    parser.add_argument("--closed-index", required=True)
    parser.add_argument("--worker", action="store_true")
    args = parser.parse_args()
    worker(args) if args.worker else parent(args)
