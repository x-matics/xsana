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

    // Match method definitions: exports.prototype.methodName = function(
    // or: ClassName.prototype.methodName = function(
    const methodRegex = /\.prototype\.(\w+)\s*=\s*function\s*\(([^)]*)\)/g;
    const methods = [];
    let match;

    while ((match = methodRegex.exec(content)) !== null) {
      const methodName = match[1];
      const params = match[2].trim();

      // Skip internal methods and WithHttpInfo variants
      if (methodName.endsWith('WithHttpInfo') || methodName.startsWith('_')) {
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
  const agentsPath = join(dirname(__dirname), '..', 'agents.md');

  let tmpDir;
  try {
    const result = await fetchAndExtractTarball();
    tmpDir = result.tmpDir;

    console.log('Parsing API methods...');
    const apiMethods = parseApiFiles(result.repoDir);

    const instanceCount = Object.keys(apiMethods).length;
    const methodCount = Object.values(apiMethods).reduce((sum, m) => sum + m.length, 0);
    console.log(`Found ${methodCount} methods across ${instanceCount} API instances`);

    // Read current agents.md
    let content;
    try {
      content = readFileSync(agentsPath, 'utf8');
    } catch {
      console.error('Error: agents.md not found. Make sure you are in the xsana project directory.');
      process.exit(1);
    }

    // Replace content between markers
    const beginIndex = content.indexOf(BEGIN_MARKER);
    const endIndex = content.indexOf(END_MARKER);

    if (beginIndex === -1 || endIndex === -1) {
      console.error('Error: Could not find auto-generated markers in agents.md');
      console.error('Expected markers:');
      console.error(`  ${BEGIN_MARKER}`);
      console.error(`  ${END_MARKER}`);
      process.exit(1);
    }

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
