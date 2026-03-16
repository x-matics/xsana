import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMPLETION_LINE = 'eval "$(xsana completion)"';

function installCompletion() {
  const shell = process.env.SHELL || '';
  let rcFile;

  if (shell.includes('zsh')) {
    rcFile = join(homedir(), '.zshrc');
  } else {
    rcFile = join(homedir(), '.bashrc');
  }

  // Check if already installed
  if (existsSync(rcFile)) {
    const content = readFileSync(rcFile, 'utf8');
    if (content.includes(COMPLETION_LINE)) {
      return null; // already present
    }
  }

  appendFileSync(rcFile, `\n# xsana shell completion\n${COMPLETION_LINE}\n`);
  return rcFile;
}

export async function setup() {
  const cwd = process.cwd();
  console.log('Setting up xsana project...');

  // Create necessary directories
  for (const dir of ['config', 'scripts']) {
    const dirPath = join(cwd, dir);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
      console.log(`  Created ${dir}/`);
    }
  }

  // Initialize package.json if it doesn't exist
  if (!existsSync(join(cwd, 'package.json'))) {
    console.log('  Initializing npm project...');
    execSync('npm init -y', { cwd, stdio: 'pipe' });
    // Add type: module
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    pkg.type = 'module';
    writeFileSync(join(cwd, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  } else {
    // Ensure type: module is set
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    if (!pkg.type) {
      pkg.type = 'module';
      writeFileSync(join(cwd, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
    }
  }

  // Install dependencies
  console.log('  Installing dependencies...');
  execSync('npm install asana @x-matics/xsana', { cwd, stdio: 'inherit' });

  // Copy example config if local config doesn't exist
  const localConfigPath = join(cwd, 'config', 'local.config.js');
  if (!existsSync(localConfigPath)) {
    const exampleConfigSrc = join(__dirname, '..', '..', 'templates', 'example.config.js');
    if (existsSync(exampleConfigSrc)) {
      copyFileSync(exampleConfigSrc, localConfigPath);
      console.log('  Created config/local.config.js');
    }
  }

  // Install shell completion
  const rcFile = installCompletion();
  if (rcFile) {
    console.log(`  Added shell completion to ${rcFile}`);
  }

  console.log('');
  console.log('Setup complete!');
  if (rcFile) {
    console.log(`  Restart your shell or run: source ${rcFile}`);
  }
  console.log('');
  console.log('Next steps:');
  console.log('  1. Edit config/local.config.js and add your Asana access token');
  console.log('  2. Run: xsana create my-first-script');
  console.log('  3. Edit scripts/my-first-script/index.js');
  console.log('  4. Run: xsana run my-first-script');
}
