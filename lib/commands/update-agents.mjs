import { readFileSync, writeFileSync, mkdtempSync, rmSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TARBALL_URL = 'https://api.github.com/repos/Asana/node-asana/tarball/master';
const BEGIN_MARKER = '<!-- BEGIN AUTO-GENERATED -->';
const END_MARKER = '<!-- END AUTO-GENERATED -->';

// Map API class names to instance variable names
function classToInstance(className) {
  // e.g. "TasksApi" -> "tasksApiInstance"
  return className.charAt(0).toLowerCase() + className.slice(1) + 'Instance';
}

async function fetchAndExtractTarball() {
  const tmpDir = mkdtempSync(join(tmpdir(), 'xsana-'));

  const headers = { 'User-Agent': 'xsana' };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  console.log('Downloading node-asana source...');
  const tarballPath = join(tmpDir, 'repo.tar.gz');

  const response = await fetch(TARBALL_URL, { headers, redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`Failed to download tarball: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(tarballPath, buffer);

  console.log('Extracting...');
  execSync(`tar xzf "${tarballPath}" -C "${tmpDir}"`, { stdio: 'pipe' });

  // Find the extracted directory (GitHub tarballs extract to Owner-Repo-SHA/)
  const entries = readdirSync(tmpDir, { withFileTypes: true });
  const extractedDir = entries.find(e => e.isDirectory());
  if (!extractedDir) {
    throw new Error('Failed to find extracted directory');
  }

  return { tmpDir, repoDir: join(tmpDir, extractedDir.name) };
}

function parseApiFiles(repoDir) {
  const apiDir = join(repoDir, 'src', 'api');
  let files;
  try {
    files = readdirSync(apiDir).filter(f => f.endsWith('Api.js'));
  } catch {
    throw new Error(`Could not find API files at ${apiDir}`);
  }

  const apiMethods = {};

  for (const file of files) {
    const content = readFileSync(join(apiDir, file), 'utf8');
    const className = basename(file, '.js');
    const instanceName = classToInstance(className);

    // Match ES6 class method definitions: methodName(params) {
    // Indented with 4 spaces inside the class body
    const methodRegex = /^ {4}(\w+)\s*\(([^)]*)\)\s*\{/gm;
    const methods = [];
    let match;

    while ((match = methodRegex.exec(content)) !== null) {
      const methodName = match[1];
      const params = match[2].trim();

      // Skip constructor, internal methods, and WithHttpInfo variants
      if (methodName === 'constructor' || methodName.endsWith('WithHttpInfo') || methodName.startsWith('_')) {
        continue;
      }

      // Clean up parameter names - remove callbacks and internal params
      const paramList = params
        .split(',')
        .map(p => p.trim())
        .filter(p => p && p !== 'callback');

      methods.push(`- ${methodName}(${paramList.join(', ')})`);
    }

    if (methods.length > 0) {
      methods.sort();
      apiMethods[instanceName] = methods;
    }
  }

  return apiMethods;
}

function formatApiMethods(apiMethods) {
  const sections = [];
  const sortedInstances = Object.keys(apiMethods).sort();

  for (const instance of sortedInstances) {
    sections.push(`### ${instance}`);
    sections.push(apiMethods[instance].join('\n'));
    sections.push('');
  }

  return sections.join('\n');
}

export async function updateAgents() {
  const agentsPath = join(process.cwd(), 'agents.md');

  let tmpDir;
  try {
    const result = await fetchAndExtractTarball();
    tmpDir = result.tmpDir;

    console.log('Parsing API methods...');
    const apiMethods = parseApiFiles(result.repoDir);

    const instanceCount = Object.keys(apiMethods).length;
    const methodCount = Object.values(apiMethods).reduce((sum, m) => sum + m.length, 0);
    console.log(`Found ${methodCount} methods across ${instanceCount} API instances`);

    // Read current agents.md or create a new one
    let content;
    try {
      content = readFileSync(agentsPath, 'utf8');
    } catch {
      content = `# Asana API Reference\n\nAvailable API methods for use in xsana scripts.\n\n${BEGIN_MARKER}\n${END_MARKER}\n`;
    }

    // Ensure markers exist
    if (!content.includes(BEGIN_MARKER) || !content.includes(END_MARKER)) {
      content += `\n${BEGIN_MARKER}\n${END_MARKER}\n`;
    }

    const beginIndex = content.indexOf(BEGIN_MARKER);
    const endIndex = content.indexOf(END_MARKER);
    const before = content.substring(0, beginIndex + BEGIN_MARKER.length);
    const after = content.substring(endIndex);
    const formatted = formatApiMethods(apiMethods);
    const today = new Date().toISOString().split('T')[0];

    const newContent = `${before}\n<!-- Last updated: ${today} -->\n\n${formatted}${after}`;

    writeFileSync(agentsPath, newContent);
    console.log(`Updated agents.md (${today})`);

  } catch (error) {
    console.error('Error:', error.message);
    if (!process.env.GITHUB_TOKEN) {
      console.error('');
      console.error('Tip: Set GITHUB_TOKEN to increase GitHub API rate limits (60/hr -> 5000/hr)');
    }
    process.exit(1);
  } finally {
    if (tmpDir) {
      rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}
