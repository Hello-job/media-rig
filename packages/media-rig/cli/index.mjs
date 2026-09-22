#!/usr/bin/env node
import { readFileSync, existsSync, statSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import spawn from 'cross-spawn';

export const components = [
  'video-trim', 'image-annotation', 'layer-separator', 'image-editor',
  'image-angle-rig', 'light-sphere', 'director-stage',
];
export const registryUrl = 'https://media-rig.vercel.app/r';
// Keep installation behavior reproducible; upgrade after testing the consumer fixture.
export const installer = 'shadcn@4.11.0';
const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
const help = `MediaRig ${version} — install React media component source

Usage:
  media-rig init [--cwd <directory>] [--yes]
  media-rig list
  media-rig add <component...> [options]

Options:
  -c, --cwd <directory>  Target project (defaults to current directory)
  -y, --yes              Skip installer confirmation prompts
  -o, --overwrite        Replace existing component files (add only)
      --dry-run          Preview changes without installing (add only)
  -h, --help             Show help
  -v, --version          Show version

Examples:
  media-rig add image-annotation
  media-rig add light-sphere director-stage --cwd ./my-app
  media-rig add image-editor --dry-run

Requires Node.js 22.12+ and npm/npx. The target project needs React 19
and Tailwind CSS 4. Run init once if components.json does not exist.
See https://media-rig.vercel.app for pnpm 11 setup and component APIs.
`;

export function parseArgs(argv) {
  if (argv.length === 0 || argv[0] === 'help' || argv.includes('--help') || argv.includes('-h')) return { command: 'help' };
  if (argv.length === 1 && ['--version', '-v'].includes(argv[0])) return { command: 'version' };
  const [command, ...args] = argv;
  if (!['init', 'list', 'add'].includes(command)) throw new Error(`Unknown command: ${command}. Run media-rig --help.`);
  const names = [];
  const options = [];
  let cwd = process.cwd();
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--cwd' || arg === '-c' || arg.startsWith('--cwd=')) {
      const value = arg.startsWith('--cwd=') ? arg.slice(6) : args[++index];
      if (!value || value.startsWith('-')) throw new Error('--cwd requires a directory.');
      cwd = resolve(value);
    } else if (arg === '--yes' || arg === '-y') options.push('--yes');
    else if (command === 'add' && ['--overwrite', '-o', '--dry-run'].includes(arg)) options.push(arg === '-o' ? '--overwrite' : arg);
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}. Run media-rig --help.`);
    else names.push(arg);
  }
  if (command === 'list' && args.length) throw new Error('list does not accept arguments.');
  if (command === 'init' && names.length) throw new Error('init does not accept component names.');
  if (command === 'add') {
    if (!names.length) throw new Error('Choose a component, e.g. media-rig add image-annotation. Run media-rig list.');
    for (const name of names) {
      if (!components.includes(name)) throw new Error(`Unknown component: ${name}. Available: ${components.join(', ')}`);
    }
  }
  return { command, names: [...new Set(names)], options: [...new Set(options)], cwd };
}

export function installerArgs(parsed) {
  const urls = parsed.command === 'add' ? parsed.names.map(name => `${registryUrl}/${name}.json`) : [];
  return ['--yes', installer, parsed.command, ...urls, '--cwd', parsed.cwd, ...parsed.options];
}

export function run(argv, { launch = spawn, out = console.log, error = console.error } = {}) {
  let parsed;
  try {
    parsed = parseArgs(argv);
    if (parsed.command === 'help') { out(help); return Promise.resolve(0); }
    if (parsed.command === 'version') { out(version); return Promise.resolve(0); }
    if (parsed.command === 'list') { out(components.join('\n')); return Promise.resolve(0); }
    if (!existsSync(parsed.cwd) || !statSync(parsed.cwd).isDirectory()) throw new Error(`Project directory does not exist: ${parsed.cwd}`);
    if (!existsSync(resolve(parsed.cwd, 'package.json'))) throw new Error('No package.json found. Run this command in an existing React project, or use --cwd.');
    if (parsed.command === 'add' && !existsSync(resolve(parsed.cwd, 'components.json'))) throw new Error('Missing components.json. Run media-rig init in the target project first.');
  } catch (cause) {
    error(`MediaRig: ${cause.message}`);
    return Promise.resolve(1);
  }
  out(`MediaRig: ${parsed.command === 'add' ? `adding ${parsed.names.join(', ')}` : 'initializing shadcn'}\n`);
  return new Promise(resolveExit => {
    // Pass arguments as an array; cross-spawn safely handles Windows npm shims.
    let child;
    try {
      child = launch('npx', installerArgs(parsed), { stdio: 'inherit', cwd: parsed.cwd });
    } catch (cause) {
      error(`MediaRig: could not start installer: ${cause.message}`);
      resolveExit(1);
      return;
    }
    const onInterrupt = () => child.kill('SIGINT');
    const onTerminate = () => child.kill('SIGTERM');
    const cleanUp = () => {
      process.removeListener('SIGINT', onInterrupt);
      process.removeListener('SIGTERM', onTerminate);
    };
    process.once('SIGINT', onInterrupt);
    process.once('SIGTERM', onTerminate);
    child.once('error', cause => {
      cleanUp();
      error(cause.code === 'ENOENT' ? 'MediaRig: npx was not found. Install Node.js with npm and try again.' : `MediaRig: ${cause.message}`);
      resolveExit(1);
    });
    child.once('close', (code, signal) => {
      cleanUp();
      resolveExit(code ?? (signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1));
    });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  process.exitCode = await run(process.argv.slice(2));
}
