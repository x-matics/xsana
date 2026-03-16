// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, tasksApiInstance, sectionsApiInstance } from '@x-matics/xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Task Mover
 * 
 * Moves all tasks matching certain criteria from one section to another.
 * Useful for automating workflow transitions, organizing tasks, or cleanup.
 * 
 * Configuration: Update the values below
 */

// CONFIGURATION
const SOURCE_SECTION_GID = '1234567890'; // Section to move FROM
const TARGET_SECTION_GID = '0987654321'; // Section to move TO
const MOVE_COMPLETED = false; // Move completed tasks?
const MOVE_INCOMPLETE = true; // Move incomplete tasks?
const CUSTOM_FIELD_FILTER = null; // Optional: { field: 'Status', value: 'Done' }

async function run() {
    try {
        log('Starting task move operation...');
        
        // Get all tasks in the source section
        let allTasks = [];
        let offset = null;
        let hasMore = true;
        
        while (hasMore) {
            const opts = {
                opt_fields: 'name,completed,custom_fields',
                limit: 100
            };
            
            if (offset) {
                opts.offset = offset;
            }
            
            const response = await tasksApiInstance.getTasksForSection(SOURCE_SECTION_GID, opts);
            allTasks = allTasks.concat(response.data);
            
            if (response._response && response._response.next_page) {
                offset = response._response.next_page.offset;
            } else {
                hasMore = false;
            }
        }
        
        log(`Found ${allTasks.length} tasks in source section`);
        
        // Filter tasks based on criteria
        let tasksToMove = allTasks.filter(task => {
            // Filter by completion status
            if (task.completed && !MOVE_COMPLETED) return false;
            if (!task.completed && !MOVE_INCOMPLETE) return false;
            
            // Optional custom field filter
            if (CUSTOM_FIELD_FILTER) {
                const field = task.custom_fields?.find(f => f.name === CUSTOM_FIELD_FILTER.field);
                if (!field) return false;
                
                let fieldValue = null;
                if (field.type === 'enum' && field.enum_value) {
                    fieldValue = field.enum_value.name;
                } else if (field.type === 'text') {
                    fieldValue = field.text_value;
                } else {
                    fieldValue = field.value;
                }
                
                if (fieldValue !== CUSTOM_FIELD_FILTER.value) return false;
            }
            
            return true;
        });
        
        log(`Moving ${tasksToMove.length} tasks to target section...`);
        
        if (tasksToMove.length === 0) {
            log('No tasks match the criteria');
            return;
        }
        
        // Move tasks in batches
        const batchSize = 10;
        let moved = 0;
        
        for (let i = 0; i < tasksToMove.length; i += batchSize) {
            const batch = tasksToMove.slice(i, i + batchSize);
            
            await Promise.all(
                batch.map(task => {
                    log(`   Moving: ${task.name}`);
                    
                    return sectionsApiInstance.addTaskForSection(TARGET_SECTION_GID, {
                        body: {
                            data: {
                                task: task.gid
                            }
                        }
                    });
                })
            );
            
            moved += batch.length;
            log(`Moved ${moved} / ${tasksToMove.length} tasks`);
        }
        
        log(`\n✓ Successfully moved ${tasksToMove.length} tasks`);
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

