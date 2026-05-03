import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function completion(args) {
  let shell = null;

  if (args.includes('--bash')) {
    shell = 'bash';
  } else if (args.includes('--zsh')) {
    shell = 'zsh';
  } else {
    // Auto-detect from $SHELL
    const shellEnv = process.env.SHELL || '';
    if (shellEnv.includes('zsh')) {
      shell = 'zsh';
    } else {
      shell = 'bash';
    }
  }

  const scriptFile = join(__dirname, '..', `completion.${shell}`);
  try {
    const script = readFileSync(scriptFile, 'utf8');
    process.stdout.write(script);
  } catch {
    console.error(`Error: Could not read completion script for ${shell}`);
    process.exit(1);
  }
}
