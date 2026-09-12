import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const submissionName = /^\d{4}-\d{2}-\d{2}_[a-z0-9]+(?:-[a-z0-9]+)*$/;

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function object(value, label, required, optional = []) {
  check(value !== null && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  for (const key of required) check(Object.hasOwn(value, key), `${label}.${key} is required`);
  for (const key of Object.keys(value)) check([...required, ...optional].includes(key), `${label}.${key} is not supported`);
}

function text(value, label) {
  check(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`);
  check(!/\bTODO\b|\bREPLACE_ME\b/i.test(value), `${label} still contains a template placeholder`);
}

function number(value, label, max = Infinity) {
  check(typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max, `${label} must be a finite number between 0 and ${max}`);
}

function date(value, label) {
  check(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value), `${label} must use YYYY-MM-DD`);
  const parsed = new Date(`${value}T00:00:00Z`);
  check(!Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value, `${label} is not a valid date`);
}

// Only inspect regular files. Submitted artifacts are never executed or extracted.
function filesIn(directory) {
  check(fs.lstatSync(directory).isDirectory(), `${directory} must be a regular directory`);
  return fs.readdirSync(directory).flatMap(name => {
    const file = path.join(directory, name);
    const stat = fs.lstatSync(file);
    check(!stat.isSymbolicLink(), `${file}: symbolic links are not allowed`);
    if (stat.isDirectory()) return filesIn(file);
    check(stat.isFile(), `${file} must be a regular file`);
    check(stat.size <= 50 * 1024 * 1024, `${file} exceeds the 50 MiB submission file limit`);
    return [{ file, size: stat.size }];
  });
}

export function validateSubmission(directory, root = repoRoot) {
  const resolved = path.resolve(root, directory);
  const id = path.basename(resolved);
  check(path.dirname(resolved) === path.join(root, "submissions") && submissionName.test(id), "Use submissions/YYYY-MM-DD_system-name (lowercase letters, digits, and hyphens)");
  filesIn(resolved);
  const read = name => JSON.parse(fs.readFileSync(path.join(resolved, name), "utf8"));
  const metadata = read("metadata.json");
  object(metadata, "metadata", ["schema_version", "date", "model", "system_type", "submitter", "evaluation"]);
  check(metadata.schema_version === 1, "metadata.schema_version must be 1");
  date(metadata.date, "metadata.date");
  check(id.startsWith(`${metadata.date}_`), "metadata.date must match the submission directory date");
  text(metadata.model, "metadata.model");
  check(["backbone", "agent"].includes(metadata.system_type), "metadata.system_type must be backbone or agent");
  object(metadata.submitter, "metadata.submitter", ["name", "organization", "github"]);
  for (const key of ["name", "organization", "github"]) text(metadata.submitter[key], `metadata.submitter.${key}`);
  check(/^https:\/\/github\.com\/[a-zA-Z0-9-]+\/?$/.test(metadata.submitter.github), "metadata.submitter.github must be a GitHub profile URL");
  const evaluation = metadata.evaluation;
  object(evaluation, "metadata.evaluation", ["dataset", "dataset_revision", "split", "instance_count", "evaluator_commit", "command"]);
  for (const key of ["dataset", "dataset_revision", "split", "evaluator_commit", "command"]) text(evaluation[key], `metadata.evaluation.${key}`);
  for (const key of ["dataset_revision", "evaluator_commit"]) check(/^[a-f0-9]{40}$/i.test(evaluation[key]), `metadata.evaluation.${key} must be a full 40-character commit SHA`);
  check(Number.isSafeInteger(evaluation.instance_count) && evaluation.instance_count > 0, "metadata.evaluation.instance_count must be a positive integer");

  const result = read("results.json");
  object(result, "results", ["model", "performance"], ["patterns", "dynamics"]);
  check(result.model === metadata.model, "results.model must match metadata.model");
  object(result.performance, "results.performance", ["file", "block", "line", "pass_at_1"]);
  number(result.performance.pass_at_1, "results.performance.pass_at_1", 1);
  for (const level of ["file", "block", "line"]) {
    object(result.performance[level], `results.performance.${level}`, ["recall", "precision", "f1"]);
    for (const metric of ["recall", "precision", "f1"]) number(result.performance[level][metric], `results.performance.${level}.${metric}`, 1);
  }
  if (Object.hasOwn(result, "patterns")) {
    object(result.patterns, "results.patterns", [], ["avg_steps_per_instance", "avg_lines_per_step", "avg_cost_per_instance"]);
    check(Object.keys(result.patterns).length > 0, "Omit patterns when no pattern metrics were evaluated");
    for (const [key, value] of Object.entries(result.patterns)) number(value, `results.patterns.${key}`);
  }
  if (Object.hasOwn(result, "dynamics")) {
    object(result.dynamics, "results.dynamics", ["efficiency", "redundancy", "usage_drop"]);
    for (const [key, value] of Object.entries(result.dynamics)) number(value, `results.dynamics.${key}`, 1);
  }
  text(fs.readFileSync(path.join(resolved, "README.md"), "utf8"), "README.md");
  for (const kind of ["logs", "trajectories"]) {
    const artifacts = filesIn(path.join(resolved, kind)).filter(({ file, size }) => size > 0 && !/^(readme(?:\.md)?|\..*)$/i.test(path.basename(file)));
    check(artifacts.length > 0, `${kind}/ must contain non-empty artifacts, not just a README or .gitkeep`);
  }
  return { id, metadata, result };
}

export function validateAll(root = repoRoot) {
  const directories = fs.readdirSync(path.join(root, "submissions"), { withFileTypes: true })
    .filter(entry => entry.name !== "template" && entry.name !== "README.md");
  for (const entry of directories) {
    check(entry.isDirectory(), `Unexpected entry in submissions/: ${entry.name}`);
    validateSubmission(path.join("submissions", entry.name), root);
  }
  return directories.length;
}

// Maintainers run this after checking the evidence. It only edits local JSON;
// the reviewed PR merge and existing Pages workflow control publication.
export function publishSubmission(directory, { root = repoRoot, replace = false } = {}) {
  const { id, metadata, result } = validateSubmission(directory, root);
  const target = path.join(root, "src", "data", `${metadata.system_type}_results.json`);
  const rows = JSON.parse(fs.readFileSync(target, "utf8"));
  check(Array.isArray(rows), `${target} must contain an array`);
  const index = rows.findIndex(row => row.model.trim().toLowerCase() === result.model.trim().toLowerCase());
  check(index < 0 || replace, `${result.model} already exists; use --replace only for an approved update`);
  const row = { ...result, submission: id };
  if (index < 0) rows.push(row);
  else rows[index] = row;
  fs.writeFileSync(target, `${JSON.stringify(rows, null, 2)}\n`);
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [command, directory, ...flags] = process.argv.slice(2);
    check(flags.every(flag => flag === "--replace") && flags.length <= 1, "Only --replace is supported");
    if (command === "validate") {
      check(flags.length === 0, "validate does not accept --replace");
      const count = directory ? (validateSubmission(directory), 1) : validateAll();
      console.log(`Validated ${count} submission(s). Scores and evaluation coverage still require maintainer review.`);
    } else if (command === "publish" && directory) {
      console.log(`Updated ${publishSubmission(directory, { replace: flags.includes("--replace") })}. Review the diff and include it in the approved PR.`);
    } else {
      throw new Error("Usage: node scripts/submissions.mjs validate [submissions/<id>] | publish submissions/<id> [--replace]");
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
