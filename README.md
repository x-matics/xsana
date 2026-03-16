# xsana

**Develop and test Asana Run Script actions locally before deploying them.**

xsana is the xmatics Asana script execution tool. It provides the same environment that Asana's "Run Script" feature uses, so you can write, test, and debug automation scripts on your local machine and then copy them directly to Asana.

## Installation

```bash
npm install -g xsana
```

Requires Node.js 18 or later.

## Quick Start

### 1. Set up a new project

```bash
mkdir my-asana-scripts && cd my-asana-scripts
xsana setup
```

This creates the project structure, installs dependencies (`asana` + `xsana`), and generates a config file.

### 2. Configure your credentials

Edit `config/local.config.js` and add your Asana Personal Access Token and GIDs:

```js
export default {
  environments: {
    development: {
      accessToken: "YOUR_ACCESS_TOKEN_HERE",
      workspace_gid: "123456789",
      project_gid: "987654321",
      task_gid: "111222333"
    }
  },
  activeEnvironment: "development"
};
```

**Getting your Access Token:**
1. Go to Asana → My Settings → Apps → Personal Access Tokens
2. Create a new token and paste it into your config

**Finding GIDs:**
Open any project or task in Asana and look at the URL: `https://app.asana.com/0/PROJECT_GID/TASK_GID`

### 3. Create and run a script

```bash
xsana create my-first-script
# Edit scripts/my-first-script/index.js
xsana run my-first-script
```

### 4. Deploy to Asana

1. Open your script file
2. Copy everything **below** the `===== COPY EVERYTHING BELOW THIS LINE =====` comment
3. In Asana, create a Rule with a "Run Script" action and paste the code

## Configuration

### Multi-Environment Support

Define multiple environments for easy switching between dev, staging, and production:

```js
// config/local.config.js
export default {
  environments: {
    development: {
      accessToken: "dev_token",
      workspace_gid: "dev_workspace",
      project_gid: "dev_project",
      task_gid: "dev_task"
    },
    production: {
      accessToken: "prod_token",
      workspace_gid: "prod_workspace",
      project_gid: "prod_project",
      task_gid: "prod_task"
    }
  },
  activeEnvironment: "development"
};
```

### Switching Environments

**Command-line (temporary):**
```bash
ASANA_ENV=production xsana run my-script
```

**Per-script (permanent for that script):**
```js
// At the top of your script, before the import
process.env.ASANA_ENV = 'production';
import { log, tasksApiInstance, ... } from 'xsana';
```

## Usage

### Commands

```bash
xsana setup                  # Set up a new project in current directory
xsana create <name>          # Create a new script from template
xsana run <name>             # Run a script locally
xsana update-agents          # Fetch latest API methods, update agents.md
xsana completion             # Output shell completion script
xsana --help                 # Show help
xsana --version              # Show version
```

## Script Structure

Every script has two parts — a local testing header and the actual script:

```js
// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
import { log, tasksApiInstance, project_gid, task_gid, workspace_gid } from 'xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

async function run() {
    try {
        const task = await tasksApiInstance.getTask(task_gid, {
            opt_fields: 'name,notes,completed'
        });
        log(`Task: ${task.data.name}`);
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();
```

### Available Variables and APIs

In Asana's Run Script environment (and locally via xsana):

| Variable | Description |
|---|---|
| `log(...)` | Logging function (like `console.log`) |
| `project_gid` | GID of the project where the rule is triggered |
| `task_gid` | GID of the triggering task |
| `workspace_gid` | GID of the workspace |
| `*ApiInstance` | All Asana API instances (`tasksApiInstance`, `projectsApiInstance`, etc.) |

See [agents.md](agents.md) for the full list of available API methods.

## Examples

11 ready-to-use example scripts are included in the `examples/` directory:

| # | Script | Description |
|---|---|---|
| 1 | task-duplicator | Duplicate tasks with all their properties |
| 2 | bulk-comment-adder | Add comments to multiple tasks at once |
| 3 | project-reporter | Generate project status reports |
| 4 | task-dependency-mapper | Visualize task dependencies |
| 5 | custom-field-updater | Bulk update custom fields |
| 6 | subtask-creator | Create subtasks from templates |
| 7 | team-workload-analyzer | Analyze team member workload |
| 8 | due-date-shifter | Shift due dates for multiple tasks |
| 9 | task-mover | Move tasks between sections |
| 10 | automation-trigger | Conditional workflows based on field values |
| 11 | portfolio-finder | Find portfolios containing a project |

See [examples/README.md](examples/README.md) for detailed descriptions.

## Shell Completion

Shell completion is automatically installed to your `~/.bashrc` or `~/.zshrc` during `xsana setup`.

To install it manually:

```bash
# Add to ~/.bashrc or ~/.zshrc:
eval "$(xsana completion)"
```

Use `xsana completion --bash` or `xsana completion --zsh` to force a specific shell.

## Best Practices

### Use async/await and parallelism
Scripts timeout after ~20 seconds in Asana. Run independent API calls in parallel:

```js
const [task, project] = await Promise.all([
    tasksApiInstance.getTask(task_gid),
    projectsApiInstance.getProject(project_gid)
]);
```

### Specify opt_fields
Only fetch the fields you need:

```js
const task = await tasksApiInstance.getTask(task_gid, {
    opt_fields: 'name,due_on,custom_fields'
});
```

### Handle errors
Always wrap your script in try/catch:

```js
async function run() {
    try {
        // your logic
    } catch (error) {
        log('Error:', error.message || error);
    }
}
run();
```

### Batch operations
Process items in parallel batches:

```js
const batchSize = 10;
for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    await Promise.all(batch.map(task => updateTask(task)));
}
```

### Handle pagination
For large datasets:

```js
let allTasks = [];
let offset = null;
let hasMore = true;

while (hasMore) {
    const opts = { opt_fields: 'name', limit: 100 };
    if (offset) opts.offset = offset;

    const response = await tasksApiInstance.getTasksForProject(project_gid, opts);
    allTasks = allTasks.concat(response.data);

    if (response._response && response._response.next_page) {
        offset = response._response.next_page.offset;
    } else {
        hasMore = false;
    }
}
```

## Tips & Gotchas

**Email as User GID** — Use email addresses wherever a user GID is expected:
```js
await tasksApiInstance.updateTask({ data: { assignee: 'user@example.com' } }, task_gid);
```

**"me" as current user** — The special value `"me"` refers to the API token owner:
```js
await tasksApiInstance.updateTask({ data: { assignee: 'me' } }, task_gid);
```

**Body parameter in opts** — Some API calls require `body` in the options object:
```js
await sectionsApiInstance.addTaskForSection(section_gid, {
    body: { data: { task: task_gid } }
});
```

**Comments are stories** — In the Asana API, comments are called "stories":
```js
await storiesApiInstance.createStoryForTask({ data: { text: 'A comment' } }, task_gid);
```

**Description is "notes"** — The task description field is `notes` in the API:
```js
const task = await tasksApiInstance.getTask(task_gid, { opt_fields: 'notes' });
log(task.data.notes); // This is the description
```

## Troubleshooting

| Problem | Solution |
|---|---|
| Script works locally but not in Asana | Only copy code below the "COPY EVERYTHING BELOW" line. Don't use Node.js-specific features (`fs`, `path`, etc.). Ensure it completes within 20 seconds. |
| "Environment not found" error | Check that `config/local.config.js` exists and the environment name matches. Try `ASANA_ENV=development xsana run your-script`. |
| "Access token invalid" error | Verify your Personal Access Token is correct and hasn't expired. Check workspace/project/task access. |
| "Cannot find module" error | Run `xsana setup` to reinstall dependencies. |
| Script times out | Use `Promise.all()` for parallel execution. Reduce API calls. Use pagination limits. |

## Updating API Reference

The `agents.md` file contains all available Asana API method signatures. To update it with the latest methods from the node-asana SDK:

```bash
xsana update-agents
```

Set `GITHUB_TOKEN` for higher GitHub API rate limits (5000/hr vs 60/hr).

## Contributing

Contributions are welcome! If you have useful example scripts or improvements, please submit a pull request at [github.com/x-matics/xsana](https://github.com/x-matics/xsana).

## License

[MIT](LICENSE)

## Links

- [Asana API Reference](https://developers.asana.com/docs)
- [Asana Node.js Client (node-asana)](https://github.com/Asana/node-asana)
- [xsana on GitHub](https://github.com/x-matics/xsana)
