import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

export async function run(name) {
  const cwd = process.cwd();
  const scriptDir = join(cwd, 'scripts', name);
  const scriptFile = join(scriptDir, 'index.js');

  if (!existsSync(scriptDir)) {
    console.error(`Error: Script "${name}" not found`);
    // List available scripts
    const scriptsDir = join(cwd, 'scripts');
    if (existsSync(scriptsDir)) {
      const { readdirSync } = await import('fs');
      const scripts = readdirSync(scriptsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      if (scripts.length > 0) {
        console.error('Available scripts:');
        scripts.forEach(s => console.error(`  - ${s}`));
      }
    }
    process.exit(1);
  }

  if (!existsSync(scriptFile)) {
    console.error(`Error: Script file "index.js" not found in scripts/${name}/`);
    process.exit(1);
  }

  console.log(`Running script: ${name}`);
  console.log('----------------------------------------');
  console.log('');

  try {
    execSync(`node "${scriptFile}"`, { cwd, stdio: 'inherit' });
  } catch (error) {
    // execSync throws on non-zero exit; the child's output was already shown via stdio: 'inherit'
    process.exit(error.status || 1);
  }

  console.log('');
  console.log('----------------------------------------');
  console.log('Script execution completed');
}
