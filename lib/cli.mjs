import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function printHelp() {
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
  console.log(`xsana v${pkg.version} - ${pkg.description}`);
  console.log('');
  console.log('Usage: xsana <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  setup              Set up a new xsana project in the current directory');
  console.log('  create <name>      Create a new Asana script from template');
  console.log('  run <name>         Run an existing Asana script locally');
  console.log('  update-agents      Fetch latest API methods and update agents.md');
  console.log('  completion         Output shell completion script for eval');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h         Show this help message');
  console.log('  --version, -v      Show version number');
  console.log('');
  console.log('Environment Variables:');
  console.log('  ASANA_ENV          Set the active environment (development, staging, production)');
  console.log('');
  console.log('Examples:');
  console.log('  xsana setup');
  console.log('  xsana create my-task-updater');
  console.log('  xsana run my-task-updater');
  console.log('  ASANA_ENV=production xsana run my-task-updater');
}

export async function run(args) {
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === '--version' || command === '-v') {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));
    console.log(pkg.version);
    return;
  }

  switch (command) {
    case 'setup': {
      const { setup } = await import('./commands/setup.mjs');
      await setup();
      break;
    }
    case 'create': {
      const name = args[1];
      if (!name) {
        console.error('Error: Please provide a script name');
        console.error('Usage: xsana create <name>');
        process.exit(1);
      }
      const { create } = await import('./commands/create.mjs');
      await create(name);
      break;
    }
    case 'run': {
      const name = args[1];
      if (!name) {
        console.error('Error: Please provide a script name');
        console.error('Usage: xsana run <name>');
        process.exit(1);
      }
      const { run: runScript } = await import('./commands/run.mjs');
      await runScript(name);
      break;
    }
    case 'update-agents': {
      const { updateAgents } = await import('./commands/update-agents.mjs');
      await updateAgents();
      break;
    }
    case 'completion': {
      const { completion } = await import('./commands/completion.mjs');
      completion(args.slice(1));
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "xsana --help" for usage information.');
      process.exit(1);
  }
}
