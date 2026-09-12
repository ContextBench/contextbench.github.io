# ContextBench leaderboard

Source for [contextbench.github.io](https://contextbench.github.io), built with
Next.js and exported as a static GitHub Pages site.

## Submit a result

See the [submission guide](submissions/README.md) and copy the
[submission template](submissions/template). Add your results, evaluation logs and
trajectories under `submissions/YYYY-MM-DD_system-name/`, then open a pull request.
Maintainers verify the evidence and publish approved scores to the leaderboard.

Benchmark evaluation code and documentation live in
[EuniAI/ContextBench](https://github.com/EuniAI/ContextBench).

## Website development

Use Node.js 20.9 or newer:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The home page is `src/app/page.tsx`, with interactive
views in `src/components/HomePage.tsx`; the submission page is
`src/app/submit/page.tsx`. Submission URLs live in `src/lib/submissions.ts`.

```bash
npm run lint
npm run test:leaderboard
npm run test:submissions
npm run submissions:validate
npm run build
```

`npm run build` exports the website to `out/`. Pushing a reviewed update to `main`
runs the existing GitHub Pages deployment workflow. Submission PR checks only
validate formats; they never publish unreviewed scores.

The website reads approved scores from `src/data/backbone_results.json` and
`src/data/agent_results.json`. The `submissions:publish` command described in the
submission guide helps maintainers update those files after review.

## Leaderboard views

- **Fixed harness** compares models using the ContextBench-adapted mini SWE-agent.
- **Agent systems** compares agent–model combinations, including the mini
  SWE-agent baselines.

The underlying `backbone` / `agent` schema keys and JSON filenames are unchanged.
Sorting, ranks, missing-value handling, and search live in
`src/lib/leaderboard.ts`. Both display modes share these controls. Equal scores
share competition ranks; reversing the display order and searching preserve
ranks within the selected setup and metric. Missing optional metrics always
appear last and have no rank. Reported zero values remain visible.

The results update date comes from the last commit touching either score file.
Builds without full Git history omit it. Dataset totals describe the whole
benchmark, while run-specific coverage belongs in each submission's metadata.
