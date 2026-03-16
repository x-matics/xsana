# xsana Examples

This directory contains 10 practical, ready-to-use xsana script examples. Each example demonstrates different aspects of the Asana API and can be used as-is or customized for your needs.

## Using Examples

Examples are meant to be copied into your own scripts. Here's how:

```bash
# 1. Create a new script
xsana create my-duplicator

# 2. Open the example and your new script
# Copy the code from examples/1-task-duplicator.js into scripts/my-duplicator/index.js

# 3. Customize as needed

# 4. Run your script
xsana run my-duplicator
```

Make sure you've configured your credentials in `config/local.config.js` first!

## Understanding Asana Triggers

Run Scripts in Asana are executed as part of **Rules**. When you deploy a script to Asana, you'll attach it to a rule with one of these trigger types:

**Available Asana Rule Triggers:**
- **Task added to this project** - When a new task is created or moved into the project
- **Task moved to section** - When a task is moved to a specific section
- **Custom field changed** - When a specific custom field value changes
- **Assignee changed** - When a task's assignee is modified
- **Due date is approaching** - When a task's due date is within a specified timeframe
- **Task completed** - When a task is marked as complete
- **Task name or description changed** - When task details are edited

**Note about "Manual Execution":**
For scripts marked as "Manual execution", you'll need to run them locally using `xsana run script-name` or set up external scheduling (e.g., cron jobs, GitHub Actions) to trigger them via the Asana API.

**Note about "Scheduled":**
Asana doesn't have built-in scheduled triggers for Run Scripts. For scheduled execution, run scripts locally with a scheduler (cron, Task Scheduler) or use external automation tools.

## Available Examples

### 1. Task Duplicator (`1-task-duplicator.js`)
**Use Case:** Duplicate a task with all its properties

Duplicates the triggering task including:
- Name (with "Copy" suffix)
- Description
- Custom fields
- Due date
- Assignee
- Projects

**Trigger:** Task added to project, Custom field changed, or manual execution
**Configuration:** None required

---

### 2. Bulk Comment Adder (`2-bulk-comment-adder.js`)
**Use Case:** Add the same comment to multiple tasks

Adds a comment to all incomplete tasks in a specific section. Great for:
- Team announcements
- Status reminders
- Policy updates

**Trigger:** Manual execution or scheduled (via external scheduler)
**Configuration:** Update `SECTION_GID` and `COMMENT_TEXT`

---

### 3. Project Reporter (`3-project-reporter.js`)
**Use Case:** Generate comprehensive project status reports

Creates a detailed report showing:
- Total, completed, and incomplete tasks
- Overdue tasks
- Tasks by section
- Tasks by assignee
- Completion percentage

**Trigger:** Manual execution or scheduled (via external scheduler)
**Configuration:** None required (uses `project_gid`)

---

### 4. Task Dependency Mapper (`4-task-dependency-mapper.js`)
**Use Case:** Visualize task dependencies

Shows all dependencies for a task:
- Tasks this task depends on (blockers)
- Tasks that depend on this task (blocked)
- Completion status for each
- Due dates

**Trigger:** Custom field changed, Task moved to section, or manual execution
**Configuration:** None required

---

### 5. Custom Field Updater (`5-custom-field-updater.js`)
**Use Case:** Bulk update custom fields

Updates a specific custom field for all tasks in a section. Supports:
- Enum fields (dropdown)
- Text fields
- Number fields
- People fields

**Trigger:** Manual execution
**Configuration:** Update `SECTION_GID`, `CUSTOM_FIELD_NAME`, and `NEW_VALUE`

---

### 6. Subtask Creator (`6-subtask-creator.js`)
**Use Case:** Create standardized subtasks from a template

Automatically creates a predefined set of subtasks. Perfect for:
- Onboarding checklists
- Standard workflows
- Quality control processes

**Trigger:** Task added to project, Custom field changed, or Task moved to section
**Configuration:** Update `SUBTASK_TEMPLATE` array

---

### 7. Team Workload Analyzer (`7-team-workload-analyzer.js`)
**Use Case:** Analyze team member workload

Generates a workload report showing:
- Tasks per team member
- Completed vs incomplete
- Overdue tasks
- Workload indicators (high/medium/low)

**Trigger:** Manual execution or scheduled (via external scheduler)
**Configuration:** None required

---

### 8. Due Date Shifter (`8-due-date-shifter.js`)
**Use Case:** Bulk shift due dates

Shifts due dates for all incomplete tasks in a section by X days. Useful when:
- Project timeline changes
- Delays occur
- Schedules need adjustment

**Trigger:** Manual execution
**Configuration:** Update `SECTION_GID`, `DAYS_TO_SHIFT`, and `ONLY_FUTURE_DATES`

---

### 9. Task Mover (`9-task-mover.js`)
**Use Case:** Move tasks between sections based on criteria

Moves tasks from one section to another based on:
- Completion status
- Custom field values
- Other criteria

**Trigger:** Manual execution or scheduled (via external scheduler)
**Configuration:** Update `SOURCE_SECTION_GID`, `TARGET_SECTION_GID`, and filter options

---

### 10. Smart Automation Trigger (`10-automation-trigger.js`)
**Use Case:** Create complex, conditional automations

A sophisticated workflow automation that performs different actions based on custom field values. Example actions:
- Status "In Review" → Assign to reviewer, set due date
- Status "Approved" → Mark complete, notify team
- Status "Blocked" → Add comment, escalate priority

**Trigger:** Custom field changed (recommended: Status field)
**Configuration:** Update `TRIGGER_FIELD` and `ACTIONS` object

---

### 11. Portfolio Finder (`11-portfolio-finder.js`)
**Use Case:** Find all portfolios containing a project

Searches through all portfolios in a workspace to find which ones contain a specific project. Useful for:
- Understanding project organization
- Auditing portfolio membership
- Project discovery and tracking

**Trigger:** Manual execution
**Configuration:** None required (uses `project_gid`)

---

## Customizing Examples

All examples follow the same structure:

```javascript
// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { ... } from 'xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

// Your script code here
```

To customize:
1. Copy the example to a new script: `xsana create my-custom-script`
2. Copy the code from the example into your new script
3. (Optional) Uncomment environment override if needed
4. Modify the configuration section (usually at the top of the script)
5. Test locally: `xsana run my-custom-script`
6. Deploy to Asana by copying the code below the marker line

## Tips

- **Always test locally first** before deploying to Asana
- **Update configuration constants** at the top of each script
- **Use opt_fields** to only fetch the data you need
- **Batch operations** to stay within the 20-second timeout
- **Handle errors gracefully** with try/catch blocks

## Need More Examples?

Check out:
- [Asana API Documentation](https://developers.asana.com/docs)
- [Asana Node.js Client Docs](https://github.com/Asana/node-asana)
- Create an issue in this repository to request specific examples

---

Happy Automating! 🚀

