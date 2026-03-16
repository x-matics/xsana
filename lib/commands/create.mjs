import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function create(name) {
  const cwd = process.cwd();
  const scriptDir = join(cwd, 'scripts', name);

  if (existsSync(scriptDir)) {
    console.error(`Error: Script "${name}" already exists at ${scriptDir}`);
    process.exit(1);
  }

  const templatePath = join(__dirname, '..', '..', 'templates', 'basic-template.js');
  if (!existsSync(templatePath)) {
    console.error('Error: Template file not found. Is xsana installed correctly?');
    process.exit(1);
  }

  mkdirSync(scriptDir, { recursive: true });
  copyFileSync(templatePath, join(scriptDir, 'index.js'));

  console.log(`Created new script: scripts/${name}/index.js`);
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Edit scripts/${name}/index.js and add your script logic`);
  console.log(`  2. Test locally: xsana run ${name}`);
  console.log('  3. Copy the script section to Asana\'s Run Script action');
}
