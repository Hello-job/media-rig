import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { components, parseArgs, installerArgs, run } from '../cli/index.mjs';

function fixture(t, initialized = true) {
  const cwd = mkdtempSync(join(tmpdir(), 'media-rig-cli-'));
  writeFileSync(join(cwd, 'package.json'), '{}');
  if (initialized) writeFileSync(join(cwd, 'components.json'), '{}');
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  return cwd;
}

test('CLI component names stay aligned with published registry', () => {
  const registry = JSON.parse(readFileSync(new URL('../../../registry.json', import.meta.url)));
  assert.deepEqual([...components].sort(), registry.items.map(item => item.name).sort());
});
test('maps multiple names to registry URLs and preserves paths as single arguments', () => {
  const cwd = resolve('/tmp/a project $(example)');
  const parsed = parseArgs(['add', 'image-editor', 'light-sphere', 'image-editor', '-c', cwd, '-y', '--dry-run']);
  assert.deepEqual(installerArgs(parsed), ['--yes', 'shadcn@4.11.0', 'add',
    'https://media-rig.vercel.app/r/image-editor.json', 'https://media-rig.vercel.app/r/light-sphere.json', '--cwd', cwd, '--yes', '--dry-run']);
  assert.ok(!installerArgs(parsed).includes('--overwrite'));
});
test('rejects invalid input before launching any installer', async () => {
  for (const args of [['add'], ['add', '../secret'], ['add', 'image-editor;touch x'], ['add', 'unknown'], ['add', 'image-editor', '--force'], ['init', 'image-editor'], ['add', 'image-editor', '--cwd'], ['list', '--yes']]) {
    let launched = false;
    const code = await run(args, { launch: () => { launched = true; }, error: () => {} });
    assert.equal(code, 1);
    assert.equal(launched, false);
  }
});
test('offline commands do not start a process', async () => {
  for (const args of [[], ['--help'], ['--version'], ['list']]) {
    const lines = [];
    assert.equal(await run(args, { launch: () => assert.fail('installer launched'), out: text => lines.push(text) }), 0);
    assert.ok(lines[0].length);
  }
});
test('requires project configuration and explains initialization', async t => {
  const cwd = fixture(t, false);
  const messages = [];
  assert.equal(await run(['add', 'image-editor', '-c', cwd], { error: text => messages.push(text), launch: () => assert.fail('installer launched') }), 1);
  assert.match(messages[0], /media-rig init/);
});
test('init permits missing components.json and forwards exit status', async t => {
  const cwd = fixture(t, false);
  const status = await run(['init', '-c', cwd, '-y'], {
    out: () => {},
    launch(command, args, options) {
      assert.equal(command, 'npx');
      assert.ok(args.includes('init'));
      assert.equal(options.cwd, cwd);
      assert.equal(options.stdio, 'inherit');
      const child = new EventEmitter();
      queueMicrotask(() => child.emit('close', 7, null));
      return child;
    },
  });
  assert.equal(status, 7);
});
test('handles missing npx and cancellation without reporting success', async t => {
  const cwd = fixture(t);
  for (const kind of ['missing', 'cancel']) {
    const messages = [];
    const status = await run(['add', 'image-editor', '-c', cwd], {
      out: () => {}, error: text => messages.push(text),
      launch() {
        const child = new EventEmitter();
        queueMicrotask(() => kind === 'missing' ? child.emit('error', Object.assign(new Error('missing'), {code:'ENOENT'})) : child.emit('close', null, 'SIGINT'));
        return child;
      },
    });
    assert.equal(status, kind === 'missing' ? 1 : 130);
    if (kind === 'missing') assert.match(messages[0], /npx was not found/);
  }
});
