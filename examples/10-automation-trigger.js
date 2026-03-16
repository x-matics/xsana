// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, tasksApiInstance, storiesApiInstance, task_gid } from 'xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Smart Automation Trigger
 * 
 * A sophisticated automation that performs multiple actions based on custom field values.
 * This example demonstrates a complete workflow automation:
 * 
 * When a task's status changes:
 * - Status = "In Review" → Assign to reviewer, set due date, add comment
 * - Status = "Approved" → Mark as complete, notify team
 * - Status = "Blocked" → Add high priority tag, notify assignee
 * 
 * Configuration: Customize the ACTIONS object below
 */

// CONFIGURATION: Define automation rules
const TRIGGER_FIELD = 'Status'; // Custom field to watch

const ACTIONS = {
    'In Review': async (task, fieldGid) => {
        log('→ Triggering "In Review" automation');
        
        // Set reviewer as assignee
        const REVIEWER_EMAIL = 'reviewer@example.com'; // Update this
        
        await tasksApiInstance.updateTask({
            data: {
                assignee: REVIEWER_EMAIL,
                due_on: getDateDaysFromNow(3) // Due in 3 days
            }
        }, task.gid);
        
        await storiesApiInstance.createStoryForTask({
            data: {
                text: '🔍 This task has been moved to review. Please review within 3 days.'
            }
        }, task.gid);
        
        log('✓ Assigned to reviewer and set due date');
    },
    
    'Approved': async (task, fieldGid) => {
        log('→ Triggering "Approved" automation');
        
        await tasksApiInstance.updateTask({
            data: {
                completed: true
            }
        }, task.gid);
        
        await storiesApiInstance.createStoryForTask({
            data: {
                text: '✅ Task approved and completed!'
            }
        }, task.gid);
        
        log('✓ Task marked as complete');
    },
    
    'Blocked': async (task, fieldGid) => {
        log('→ Triggering "Blocked" automation');
        
        await storiesApiInstance.createStoryForTask({
            data: {
                text: '🚫 This task is now blocked! Please address the blockers immediately.'
            }
        }, task.gid);
        
        // Could also update priority or notify specific people here
        
        log('✓ Blocker notification added');
    }
};

// Helper function
function getDateDaysFromNow(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

async function run() {
    try {
        log('Running smart automation...');
        
        // Get the task with custom fields
        const task = await tasksApiInstance.getTask(task_gid, {
            opt_fields: 'name,custom_fields,completed,assignee'
        });
        
        log(`Task: "${task.data.name}"`);
        
        // Find the trigger field
        const triggerField = task.data.custom_fields?.find(f => f.name === TRIGGER_FIELD);
        
        if (!triggerField) {
            log(`Custom field "${TRIGGER_FIELD}" not found`);
            return;
        }
        
        // Get current value
        let currentValue = null;
        if (triggerField.type === 'enum' && triggerField.enum_value) {
            currentValue = triggerField.enum_value.name;
        } else if (triggerField.type === 'text') {
            currentValue = triggerField.text_value;
        }
        
        log(`Current ${TRIGGER_FIELD}: ${currentValue}`);
        
        // Execute corresponding action
        if (currentValue && ACTIONS[currentValue]) {
            await ACTIONS[currentValue](task.data, triggerField.gid);
            log('✓ Automation completed successfully');
        } else {
            log(`No automation defined for value: ${currentValue}`);
        }
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

