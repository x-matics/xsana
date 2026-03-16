// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// This import is only needed for local testing. It provides the same environment
// that Asana's "Run Script" feature provides automatically.

// Optional: Override the environment for this script
// Uncomment one of these to use a specific environment instead of the default
// process.env.ASANA_ENV = 'development';
// process.env.ASANA_ENV = 'staging';
// process.env.ASANA_ENV = 'production';

import { log, tasksApiInstance, projectsApiInstance, customFieldsApiInstance, sectionsApiInstance, storiesApiInstance, project_gid, task_gid, workspace_gid } from '@x-matics/xsana';

// Optional: Override the default GIDs for local testing of this specific script
// Uncomment and update these if you want to test with different projects/tasks
// const project_gid = "1234567890";
// const task_gid = "9876543210";
// const workspace_gid = "1111111111";

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Asana Script - [Description of what this script does]
 * 
 * Available in Asana Run Script environment:
 * - log(message) - Logs output (like console.log)
 * - project_gid - GID of the project where the rule is triggered
 * - task_gid - GID of the task that triggered the rule (if triggered by a task)
 * - workspace_gid - GID of the workspace
 * - *ApiInstance - All Asana API instances (tasksApiInstance, projectsApiInstance, etc.)
 * 
 * For full API documentation, see: https://github.com/Asana/node-asana
 */

async function run() {
    try {
        log('Script started');
        
        // Example: Get task information
        if (task_gid) {
            const task = await tasksApiInstance.getTask(task_gid, {
                opt_fields: 'name,notes,completed,due_on'
            });
            log(`Task: ${task.data.name}`);
        }
        
        // Your script logic goes here
        // Use async/await for API calls
        // Remember: scripts timeout after ~20 seconds
        
        log('Script completed successfully');
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();
