import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const registry = JSON.parse(await readFile('registry.json', 'utf8'));
for (const item of registry.items) {
  const json = process.env.REGISTRY_URL
    ? await fetch(`${process.env.REGISTRY_URL}/r/${item.name}.json`).then(response => {
        assert.equal(response.status, 200, item.name);
        return response.json();
      })
    : JSON.parse(await readFile(`apps/docs/public/r/${item.name}.json`, 'utf8'));
  assert.equal(json.name, item.name);
  assert.ok(json.files.every(file => file.target.startsWith('@components/')), item.name);
  assert.ok(json.files.find(file => file.path.endsWith('/index.ts')).content.startsWith('"use client"'));
  const content = json.files.map(file => file.content).join('\n');
  for (const file of item.files.filter(file => /\.(png|glb)$/.test(file.path))) {
    const original = await readFile(file.path);
    assert.ok(content.includes(original.toString('base64')), `${item.name}: lossless binary asset ${file.path}`);
    assert.ok(!json.files.some(output => output.path === file.path), 'Do not distribute binary files as UTF-8 text');
  }
  console.log(`${item.name}: ${json.files.length} source files, valid client entry and lossless assets`);
}
