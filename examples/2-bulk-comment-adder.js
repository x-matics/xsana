// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, tasksApiInstance, sectionsApiInstance, storiesApiInstance, project_gid } from 'xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Bulk Comment Adder
 * 
 * Adds a comment to all incomplete tasks in a specific section.
 * Useful for announcements, reminders, or status updates.
 * 
 * Configuration: Update SECTION_GID and COMMENT_TEXT below
 */

// CONFIGURATION
const SECTION_GID = '1234567890'; // Replace with your section GID
const COMMENT_TEXT = 'Reminder: Please update the status of this task by end of week.';

async function run() {
    try {
        log('Starting bulk comment operation...');
        
        // Get all incomplete tasks in the section
        let allTasks = [];
        let offset = null;
        let hasMore = true;
        
        while (hasMore) {
            const opts = {
                opt_fields: 'name,completed',
                limit: 100
            };
            
            if (offset) {
                opts.offset = offset;
            }
            
            const response = await sectionsApiInstance.getTasksForSection(SECTION_GID, opts);
            
            // Filter for incomplete tasks
            const incompleteTasks = response.data.filter(t => !t.completed);
            allTasks = allTasks.concat(incompleteTasks);
            
            if (response._response && response._response.next_page) {
                offset = response._response.next_page.offset;
            } else {
                hasMore = false;
            }
        }
        
        log(`Found ${allTasks.length} incomplete tasks`);
        
        if (allTasks.length === 0) {
            log('No tasks to update');
            return;
        }
        
        // Add comments in parallel (batch of 10 at a time to avoid rate limits)
        const batchSize = 10;
        for (let i = 0; i < allTasks.length; i += batchSize) {
            const batch = allTasks.slice(i, i + batchSize);
            
            await Promise.all(
                batch.map(task =>
                    storiesApiInstance.createStoryForTask({
                        data: {
                            text: COMMENT_TEXT
                        }
                    }, task.gid)
                )
            );
            
            log(`Added comments to ${Math.min(i + batchSize, allTasks.length)} / ${allTasks.length} tasks`);
        }
        
        log(`✓ Successfully added comments to ${allTasks.length} tasks`);
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

