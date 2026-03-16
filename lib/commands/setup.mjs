import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  execSync('npm install asana xsana', { cwd, stdio: 'inherit' });

  // Copy example config if local config doesn't exist
  const localConfigPath = join(cwd, 'config', 'local.config.js');
  if (!existsSync(localConfigPath)) {
    const exampleConfigSrc = join(__dirname, '..', '..', 'templates', 'example.config.js');
    if (existsSync(exampleConfigSrc)) {
      copyFileSync(exampleConfigSrc, localConfigPath);
      console.log('  Created config/local.config.js');
    }
  }

  console.log('');
  console.log('Setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Edit config/local.config.js and add your Asana access token');
  console.log('  2. Run: xsana create my-first-script');
  console.log('  3. Edit scripts/my-first-script/index.js');
  console.log('  4. Run: xsana run my-first-script');
}
