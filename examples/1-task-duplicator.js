// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, tasksApiInstance, project_gid, task_gid } from '@x-matics/xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Task Duplicator
 * 
 * Duplicates the triggering task including:
 * - Name
 * - Description (notes)
 * - Custom fields
 * - Due date
 * - Assignee
 * - Projects
 * 
 * The new task will be created as an incomplete copy of the original.
 */

async function run() {
    try {
        log('Starting task duplication...');
        
        // Get the original task with all relevant fields
        const originalTask = await tasksApiInstance.getTask(task_gid, {
            opt_fields: 'name,notes,custom_fields,due_on,assignee,projects'
        });
        
        log(`Duplicating task: "${originalTask.data.name}"`);
        
        // Prepare custom fields for the new task
        const customFields = {};
        if (originalTask.data.custom_fields) {
            for (const field of originalTask.data.custom_fields) {
                if (field.type === 'enum' && field.enum_value) {
                    customFields[field.gid] = field.enum_value.gid;
                } else if (field.type === 'text' && field.text_value) {
                    customFields[field.gid] = field.text_value;
                } else if (field.type === 'number' && field.number_value !== null) {
                    customFields[field.gid] = field.number_value;
                }
            }
        }
        
        // Create the duplicate task
        const duplicateTask = await tasksApiInstance.createTask({
            data: {
                name: `${originalTask.data.name} (Copy)`,
                notes: originalTask.data.notes || '',
                due_on: originalTask.data.due_on,
                assignee: originalTask.data.assignee ? originalTask.data.assignee.gid : null,
                projects: originalTask.data.projects ? [originalTask.data.projects[0].gid] : [project_gid],
                custom_fields: customFields
            }
        });
        
        log(`✓ Task duplicated successfully! New task GID: ${duplicateTask.data.gid}`);
        log(`  View at: https://app.asana.com/0/${project_gid}/${duplicateTask.data.gid}`);
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

