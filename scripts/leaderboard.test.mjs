import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

// Test the production sorting/formatting code on Node 20 as well as local runtimes.
const source = readFileSync(new URL('../src/lib/leaderboard.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { rankResults, filterResults, nextSort, formatMetric, metricValue } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const result = (model, pass, f1, cost, efficiency) => ({
  model,
  performance: { pass_at_1: pass, line: { f1, recall: f1, precision: f1 }, file: { f1, recall: f1, precision: f1 }, block: { f1, recall: f1, precision: f1 } },
  patterns: cost === undefined ? undefined : { avg_cost_per_instance: cost },
  dynamics: efficiency === undefined ? undefined : { efficiency, redundancy: 0, usage_drop: 0 },
});
const fixture = [result('Alpha', .8, .2, 1, 0), result('Beta', .5, .4, 0, .2), result('Gamma', .5, .1), result('Delta', 0, 0, 2, .1)];
const names = rows => rows.map(row => row.result.model);

test('changing metrics starts with the best score, while repeated clicks reverse the order', () => {
  const f1 = nextSort({ key: 'pass_at_1', direction: 'desc' }, 'line_f1');
  assert.deepEqual(f1, { key: 'line_f1', direction: 'desc' });
  assert.equal(names(rankResults(fixture, f1))[0], 'Beta');
  assert.deepEqual(nextSort(f1, 'line_f1'), { key: 'line_f1', direction: 'asc' });
  assert.deepEqual(nextSort(f1, 'cost'), { key: 'cost', direction: 'asc' });
});
test('equal scores share competition ranks, preserved when reversing display order', () => {
  const descending = rankResults(fixture, { key: 'pass_at_1', direction: 'desc' });
  const ascending = rankResults(fixture, { key: 'pass_at_1', direction: 'asc' });
  assert.deepEqual(descending.map(({result, rank}) => [result.model, rank]), [['Alpha', 1], ['Beta', 2], ['Gamma', 2], ['Delta', 4]]);
  assert.deepEqual(ascending.map(({result, rank}) => [result.model, rank]), [['Delta', 4], ['Beta', 2], ['Gamma', 2], ['Alpha', 1]]);
});
test('zero cost is best and missing costs are last in either display direction', () => {
  assert.deepEqual(names(rankResults(fixture, { key: 'cost', direction: 'asc' })), ['Beta', 'Alpha', 'Delta', 'Gamma']);
  const descending = rankResults(fixture, { key: 'cost', direction: 'desc' });
  assert.deepEqual(descending.map(({result, rank}) => [result.model, rank]), [['Delta', 3], ['Alpha', 2], ['Beta', 1], ['Gamma', null]]);
});
test('missing efficiency stays last without hiding a reported zero', () => {
  assert.deepEqual(names(rankResults(fixture, { key: 'efficiency', direction: 'asc' })), ['Alpha', 'Delta', 'Beta', 'Gamma']);
  assert.deepEqual(names(rankResults(fixture, { key: 'efficiency', direction: 'desc' })), ['Beta', 'Delta', 'Alpha', 'Gamma']);
});
test('search is case-insensitive, ignores outer whitespace and retains the full-view rank', () => {
  const rows = rankResults(fixture, { key: 'pass_at_1', direction: 'desc' });
  assert.deepEqual(filterResults(rows, ' DELTA ').map(row => row.rank), [4]);
  assert.equal(filterResults(rows, ' a ').length, 4);
  assert.equal(filterResults(rows, 'no matches').length, 0);
  assert.deepEqual(filterResults(rows, '  '), rows);
});
test('zero values display as numbers, and missing or non-finite values display as unavailable', () => {
  assert.equal(formatMetric(0, 'cost'), '$0.00');
  assert.equal(formatMetric(0, 'pass_at_1'), '0.0%');
  assert.equal(formatMetric(0, 'efficiency'), '0.000');
  for (const value of [undefined, NaN, Infinity]) assert.equal(formatMetric(value, 'cost'), '—');
  assert.equal(metricValue(result('Invalid', 0, 0, NaN), 'cost'), undefined);
});
test('empty datasets and entirely missing optional metrics remain usable', () => {
  assert.deepEqual(rankResults([], { key: 'cost', direction: 'asc' }), []);
  const rows = rankResults([result('Z', 0, 0), result('A', 0, 0)], { key: 'cost', direction: 'asc' });
  assert.deepEqual(names(rows), ['A', 'Z']);
  assert.deepEqual(rows.map(row => row.rank), [null, null]);
});
test('sorting and filtering do not mutate published results', () => {
  const snapshot = structuredClone(fixture);
  filterResults(rankResults(fixture, { key: 'line_f1', direction: 'desc' }), 'a');
  assert.deepEqual(fixture, snapshot);
});
test('published boards retain every result and sort correctly on each selectable metric', () => {
  for (const filename of ['backbone_results.json', 'agent_results.json']) {
    const data = JSON.parse(readFileSync(new URL(`../src/data/${filename}`, import.meta.url)));
    for (const key of ['pass_at_1', 'line_f1', 'efficiency', 'cost']) {
      const direction = key === 'cost' ? 'asc' : 'desc';
      const rows = rankResults(data, { key, direction });
      assert.equal(rows.length, data.length);
      assert.equal(new Set(names(rows)).size, data.length);
      let last;
      let seenMissing = false;
      for (const row of rows) {
        const value = metricValue(row.result, key);
        if (value === undefined) { seenMissing = true; assert.equal(row.rank, null); continue; }
        assert.equal(seenMissing, false);
        if (last !== undefined) assert.ok(direction === 'asc' ? value >= last : value <= last);
        last = value;
      }
    }
  }
});
