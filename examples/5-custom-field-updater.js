// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, tasksApiInstance, sectionsApiInstance, project_gid } from '@x-matics/xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Custom Field Bulk Updater
 * 
 * Updates a specific custom field for all tasks in a section.
 * Useful for bulk status updates, priority changes, or categorization.
 * 
 * Configuration: Update the values below
 */

// CONFIGURATION
const SECTION_GID = '1234567890'; // Replace with your section GID
const CUSTOM_FIELD_NAME = 'Status'; // Name of the custom field to update
const NEW_VALUE = 'In Progress'; // For enum fields: the option name
// const NEW_VALUE = 'Some text'; // For text fields
// const NEW_VALUE = 42; // For number fields

async function run() {
    try {
        log('Starting custom field bulk update...');
        
        // Get all tasks in the section
        let allTasks = [];
        let offset = null;
        let hasMore = true;
        
        while (hasMore) {
            const opts = {
                opt_fields: 'name,custom_fields',
                limit: 100
            };
            
            if (offset) {
                opts.offset = offset;
            }
            
            const response = await tasksApiInstance.getTasksForSection(SECTION_GID, opts);
            allTasks = allTasks.concat(response.data);
            
            if (response._response && response._response.next_page) {
                offset = response._response.next_page.offset;
            } else {
                hasMore = false;
            }
        }
        
        log(`Found ${allTasks.length} tasks to update`);
        
        if (allTasks.length === 0) {
            log('No tasks to update');
            return;
        }
        
        // Find the custom field and prepare update value
        let customFieldGid = null;
        let updateValue = NEW_VALUE;
        
        // Check the first task to find the field
        if (allTasks[0].custom_fields) {
            const field = allTasks[0].custom_fields.find(f => f.name === CUSTOM_FIELD_NAME);
            
            if (!field) {
                log(`❌ Custom field "${CUSTOM_FIELD_NAME}" not found on tasks`);
                return;
            }
            
            customFieldGid = field.gid;
            
            // For enum fields, find the option GID
            if (field.type === 'enum' && field.enum_options) {
                const option = field.enum_options.find(o => o.name === NEW_VALUE);
                if (option) {
                    updateValue = option.gid;
                } else {
                    log(`❌ Enum option "${NEW_VALUE}" not found for field "${CUSTOM_FIELD_NAME}"`);
                    log(`Available options: ${field.enum_options.map(o => o.name).join(', ')}`);
                    return;
                }
            }
        }
        
        log(`Updating field "${CUSTOM_FIELD_NAME}" to "${NEW_VALUE}"`);
        
        // Update tasks in batches
        const batchSize = 10;
        let updated = 0;
        
        for (let i = 0; i < allTasks.length; i += batchSize) {
            const batch = allTasks.slice(i, i + batchSize);
            
            await Promise.all(
                batch.map(task =>
                    tasksApiInstance.updateTask({
                        data: {
                            custom_fields: {
                                [customFieldGid]: updateValue
                            }
                        }
                    }, task.gid)
                )
            );
            
            updated += batch.length;
            log(`Updated ${updated} / ${allTasks.length} tasks`);
        }
        
        log(`✓ Successfully updated ${allTasks.length} tasks`);
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

