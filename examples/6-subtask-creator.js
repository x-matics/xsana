// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, tasksApiInstance, task_gid } from 'xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Subtask Creator from Template
 * 
 * Creates a predefined set of subtasks for the triggering task.
 * Useful for standardizing workflows, checklists, or onboarding processes.
 * 
 * Configuration: Update SUBTASK_TEMPLATE below
 */

// CONFIGURATION: Define your subtask template
const SUBTASK_TEMPLATE = [
    {
        name: '1. Review requirements',
        notes: 'Review all project requirements and clarify any questions'
    },
    {
        name: '2. Create initial draft',
        notes: 'Create the first version based on requirements'
    },
    {
        name: '3. Internal review',
        notes: 'Get feedback from team members'
    },
    {
        name: '4. Make revisions',
        notes: 'Implement feedback and make necessary changes'
    },
    {
        name: '5. Final approval',
        notes: 'Get final sign-off from stakeholders'
    }
];

async function run() {
    try {
        log('Creating subtasks from template...');
        
        // Get the parent task
        const parentTask = await tasksApiInstance.getTask(task_gid, {
            opt_fields: 'name,assignee,projects'
        });
        
        log(`Parent task: "${parentTask.data.name}"`);
        log(`Creating ${SUBTASK_TEMPLATE.length} subtasks...`);
        
        // Create all subtasks in parallel
        const subtaskPromises = SUBTASK_TEMPLATE.map(subtaskData =>
            tasksApiInstance.createSubtaskForTask({
                data: {
                    name: subtaskData.name,
                    notes: subtaskData.notes || '',
                    assignee: parentTask.data.assignee ? parentTask.data.assignee.gid : null
                }
            }, task_gid)
        );
        
        const createdSubtasks = await Promise.all(subtaskPromises);
        
        log(`✓ Successfully created ${createdSubtasks.length} subtasks:`);
        createdSubtasks.forEach((subtask, index) => {
            log(`   ${index + 1}. ${subtask.data.name}`);
        });
        
        log('\n✓ Subtask creation completed');
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

