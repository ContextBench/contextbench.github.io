import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { publishSubmission, validateAll, validateSubmission } from "./submissions.mjs";

// Synthetic artifacts only; all writes happen in isolated temporary repositories.
function fixture(t, systemType = "agent") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "contextbench-submission-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const directory = "submissions/2026-09-12_test-system";
  const base = path.join(root, directory);
  const write = (file, data) => fs.writeFileSync(path.join(base, file), typeof data === "string" ? data : JSON.stringify(data));
  fs.mkdirSync(path.join(base, "logs"), { recursive: true });
  fs.mkdirSync(path.join(base, "trajectories"));
  fs.mkdirSync(path.join(root, "src/data"), { recursive: true });
  const metadata = {
    schema_version: 1, date: "2026-09-12", model: "Test System", system_type: systemType,
    submitter: { name: "Researcher", organization: "Independent", github: "https://github.com/researcher" },
    evaluation: { dataset: "Synthetic test data", dataset_revision: "a".repeat(40), split: "test", instance_count: 1, evaluator_commit: "b".repeat(40), command: "python -m contextbench.evaluate --gold gold.parquet --pred run.traj.json --out results.jsonl" },
  };
  const result = {
    model: "Test System",
    performance: { file: { recall: 0, precision: 1, f1: 0 }, block: { recall: 0.6, precision: 0.5, f1: 0.4 }, line: { recall: 0.4, precision: 0.3, f1: 0.2 }, pass_at_1: 0 },
  };
  write("metadata.json", metadata);
  write("results.json", result);
  write("README.md", "Synthetic test fixture. Instance: test-1. This is not a real evaluation.");
  write("logs/test-1.json", { instance_id: "test-1", resolved: false });
  write("trajectories/test-1.json", { instance_id: "test-1", steps: ["synthetic test"] });
  for (const kind of ["agent", "backbone"]) fs.writeFileSync(path.join(root, `src/data/${kind}_results.json`), "[]\n");
  return { root, directory, base, write, metadata, result };
}

test("accepts zero/boundary metrics and omitted optional metrics without publishing", t => {
  const f = fixture(t);
  assert.equal(validateSubmission(f.directory, f.root).result.performance.pass_at_1, 0);
  assert.equal(validateAll(f.root), 1);
  assert.equal(fs.readFileSync(path.join(f.root, "src/data/agent_results.json"), "utf8"), "[]\n");
});

for (const [label, change, expected] of [
  ["percentage instead of fraction", f => { f.result.performance.pass_at_1 = 53; }, /pass_at_1/],
  ["null performance", f => { f.result.performance.line.f1 = null; }, /line.f1/],
  ["string performance", f => { f.result.performance.line.recall = "0.5"; }, /line.recall/],
  ["missing metric", f => { delete f.result.performance.block; }, /block is required/],
  ["unknown metric", f => { f.result.performance.line.fscore = 0.5; }, /fscore is not supported/],
  ["negative cost", f => { f.result.patterns = { avg_cost_per_instance: -1 }; }, /avg_cost/],
  ["null optional metrics", f => { f.result.dynamics = null; }, /dynamics must be an object/],
  ["incomplete dynamics", f => { f.result.dynamics = { efficiency: 0.5 }; }, /redundancy is required/],
  ["mismatched model", f => { f.result.model = "Another Model"; }, /must match/],
  ["unknown category", f => { f.metadata.system_type = "other"; }, /system_type/],
  ["invalid date", f => { f.metadata.date = "2026-02-30"; }, /not a valid date/],
  ["mismatched date", f => { f.metadata.date = "2026-09-11"; }, /directory date/],
  ["unfinished metadata", f => { f.metadata.submitter.name = "TODO"; }, /placeholder/],
  ["mutable evaluator ref", f => { f.metadata.evaluation.evaluator_commit = "main"; }, /commit SHA/],
  ["noninteger instance count", f => { f.metadata.evaluation.instance_count = 1.5; }, /positive integer/],
]) {
  test(`rejects ${label}`, t => {
    const f = fixture(t);
    change(f);
    f.write("metadata.json", f.metadata);
    f.write("results.json", f.result);
    assert.throws(() => validateSubmission(f.directory, f.root), expected);
  });
}

test("rejects empty, README-only, and missing artifact directories", t => {
  const f = fixture(t);
  f.write("logs/test-1.json", "");
  f.write("logs/README.md", "Description without evidence");
  assert.throws(() => validateSubmission(f.directory, f.root), /non-empty artifacts/);
  fs.rmSync(path.join(f.base, "logs"), { recursive: true });
  assert.throws(() => validateSubmission(f.directory, f.root), /ENOENT/);
});

test("rejects malformed JSON and unfinished reports", t => {
  const f = fixture(t);
  f.write("results.json", "{");
  assert.throws(() => validateSubmission(f.directory, f.root), SyntaxError);
  f.write("results.json", f.result);
  f.write("README.md", "TODO: describe this run");
  assert.throws(() => validateSubmission(f.directory, f.root), /placeholder/);
});

test("rejects symlink artifacts, oversized files, and paths outside submissions", t => {
  const f = fixture(t);
  fs.symlinkSync(path.join(f.base, "README.md"), path.join(f.base, "logs/link"));
  assert.throws(() => validateSubmission(f.directory, f.root), /symbolic links/);
  fs.unlinkSync(path.join(f.base, "logs/link"));
  fs.truncateSync(path.join(f.base, "logs/test-1.json"), 50 * 1024 * 1024 + 1);
  assert.throws(() => validateSubmission(f.directory, f.root), /50 MiB/);
  assert.throws(() => validateSubmission("src/data", f.root), /Use submissions/);
});

test("ships an explicitly invalid template that validation and publication exclude", t => {
  const f = fixture(t);
  const template = fileURLToPath(new URL("../submissions/template", import.meta.url));
  fs.cpSync(template, path.join(f.root, "submissions/template"), { recursive: true });
  assert.equal(validateAll(f.root), 1);
  assert.throws(() => publishSubmission("submissions/template", { root: f.root }), /Use submissions/);
  fs.cpSync(template, path.join(f.root, "submissions/2026-09-12_unfinished"), { recursive: true });
  assert.throws(() => validateAll(f.root), /YYYY-MM-DD/);
});

for (const category of ["agent", "backbone"]) {
  test(`publishes reviewed ${category} results with evidence, preserving the other board`, t => {
    const f = fixture(t, category);
    const other = category === "agent" ? "backbone" : "agent";
    f.result.patterns = { avg_cost_per_instance: 0 };
    f.result.dynamics = { efficiency: 1, redundancy: 0, usage_drop: 0.5 };
    f.write("results.json", f.result);
    const destination = publishSubmission(f.directory, { root: f.root });
    const rows = JSON.parse(fs.readFileSync(destination, "utf8"));
    assert.deepEqual(rows, [{ ...f.result, submission: "2026-09-12_test-system" }]);
    assert.equal(fs.readFileSync(path.join(f.root, `src/data/${other}_results.json`), "utf8"), "[]\n");
    assert.throws(() => publishSubmission(f.directory, { root: f.root }), /already exists/);
    f.result.performance.pass_at_1 = 1;
    f.write("results.json", f.result);
    publishSubmission(f.directory, { root: f.root, replace: true });
    const updated = JSON.parse(fs.readFileSync(destination, "utf8"));
    assert.equal(updated.length, 1);
    assert.equal(updated[0].performance.pass_at_1, 1);
  });
}

test("invalid submissions cannot alter leaderboard data", t => {
  const f = fixture(t);
  f.result.performance.pass_at_1 = 100;
  f.write("results.json", f.result);
  assert.throws(() => publishSubmission(f.directory, { root: f.root }), /pass_at_1/);
  assert.equal(fs.readFileSync(path.join(f.root, "src/data/agent_results.json"), "utf8"), "[]\n");
});
