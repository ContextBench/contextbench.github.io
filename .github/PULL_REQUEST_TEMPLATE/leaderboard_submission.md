## ContextBench leaderboard submission

- Submission directory: `submissions/YYYY-MM-DD_system-name`
- System display name:
- System type (`backbone` / `agent`):
- Dataset/configuration, revision, split/task selection and instance count:
- Reported Pass@1 and context line F1:
- Reproduction instructions (path in this PR):

## Submitter checklist

- [ ] I followed `submissions/README.md` and filled in all template fields.
- [ ] The display name matches in metadata and results, and all scores come from this run.
- [ ] I committed raw evaluation outputs, issue-resolution outcomes, execution logs, and trajectories.
- [ ] Artifacts cover all evaluated instances and attempts, including failures; the README includes the instance list and any omissions.
- [ ] I documented model/agent versions, dataset/evaluator commits, commands, metric aggregation and denominators.
- [ ] I disclosed task filtering, retries/selection, benchmark-specific tuning, and access to gold context or reference solutions.
- [ ] I removed credentials and personal data and documented redactions.
- [ ] `npm run submissions:validate -- submissions/<my-submission>` passes.
- [ ] I understand that leaderboard publication requires maintainer review.

## Maintainer review

- [ ] Evaluation population and protocol match the target leaderboard.
- [ ] Raw artifacts, instance coverage, Pass@1 outcomes and aggregate metrics have been verified.
- [ ] The approved score update and evidence link have been reviewed, or a follow-up publication PR is linked below.

Publication PR (if separate):
