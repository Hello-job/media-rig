// Registry files are UTF-8 text; embed binary models as data URLs in constants.
import { readFile, writeFile } from 'node:fs/promises';
const path = 'apps/docs/public/r/director-stage.json';
const item = JSON.parse(await readFile(path, 'utf8'));
const constants = item.files.find((file) => file.path.endsWith('DirectorStage.constants.ts'));
for (const file of item.files.filter((file) => file.path.endsWith('.glb'))) {
  const name = file.path.split('/').pop();
  const base64 = (await readFile(file.path)).toString('base64');
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  constants.content = constants.content.replace(new RegExp(`import (\\w+) from "\\./assets/${escaped}\\?url";`), (_, variable) => `const ${variable} = "data:model/gltf-binary;base64,${base64}";`);
}
item.files = item.files.filter((file) => !file.path.endsWith('.glb'));
await writeFile(path, JSON.stringify(item, null, 2) + '\n');

const registry = JSON.parse(await readFile('registry.json', 'utf8'));
for (const entry of registry.items) {
  const output = `apps/docs/public/r/${entry.name}.json`;
  const built = JSON.parse(await readFile(output, 'utf8'));
  for (const asset of built.files.filter((file) => file.path.endsWith('.png'))) {
    const data = (await readFile(asset.path)).toString('base64');
    const assetUrl = '/' + asset.target.replace(/^public\//, '');
    for (const file of built.files) {
      if (file.content.includes(JSON.stringify(assetUrl))) {
        file.content = 'import registryDefaultImage from "./registry-default-image";\n' + file.content.replaceAll(JSON.stringify(assetUrl), 'registryDefaultImage');
      }
    }
    built.files.push({path: `registry/${entry.name}/registry-default-image.ts`, type: 'registry:lib', target: `@components/${entry.name}/registry-default-image.ts`, content: `export default "data:image/png;base64,${data}";\n`});
  }
  built.files = built.files.filter((file) => !file.path.endsWith('.png'));
  for (const file of built.files) {
    if (file.path.endsWith('/index.ts')) file.content = '"use client";\n\n' + file.content;
  }
  await writeFile(output, JSON.stringify(built, null, 2) + '\n');
}
