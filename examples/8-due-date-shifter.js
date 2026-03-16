// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, tasksApiInstance, sectionsApiInstance } from 'xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Due Date Shifter
 * 
 * Shifts due dates for all incomplete tasks in a section by a specified number of days.
 * Useful when project timelines change or need adjustment.
 * 
 * Configuration: Update the values below
 */

// CONFIGURATION
const SECTION_GID = '1234567890'; // Replace with your section GID
const DAYS_TO_SHIFT = 7; // Positive to push forward, negative to pull back
const ONLY_FUTURE_DATES = true; // Only shift dates in the future

async function run() {
    try {
        log(`Shifting due dates by ${DAYS_TO_SHIFT} days...`);
        
        // Get all incomplete tasks in the section
        let allTasks = [];
        let offset = null;
        let hasMore = true;
        
        while (hasMore) {
            const opts = {
                opt_fields: 'name,completed,due_on',
                limit: 100
            };
            
            if (offset) {
                opts.offset = offset;
            }
            
            const response = await sectionsApiInstance.getTasksForSection(SECTION_GID, opts);
            
            // Filter for incomplete tasks with due dates
            const incompleteTasks = response.data.filter(t => !t.completed && t.due_on);
            allTasks = allTasks.concat(incompleteTasks);
            
            if (response._response && response._response.next_page) {
                offset = response._response.next_page.offset;
            } else {
                hasMore = false;
            }
        }
        
        log(`Found ${allTasks.length} incomplete tasks with due dates`);
        
        if (allTasks.length === 0) {
            log('No tasks to update');
            return;
        }
        
        // Filter by date if ONLY_FUTURE_DATES is true
        const today = new Date().toISOString().split('T')[0];
        let tasksToUpdate = allTasks;
        
        if (ONLY_FUTURE_DATES) {
            tasksToUpdate = allTasks.filter(t => t.due_on >= today);
            log(`Filtering to ${tasksToUpdate.length} tasks with future dates`);
        }
        
        // Helper function to shift date
        function shiftDate(dateString, days) {
            const date = new Date(dateString + 'T00:00:00Z');
            date.setUTCDate(date.getUTCDate() + days);
            return date.toISOString().split('T')[0];
        }
        
        // Update tasks in batches
        const batchSize = 10;
        let updated = 0;
        
        for (let i = 0; i < tasksToUpdate.length; i += batchSize) {
            const batch = tasksToUpdate.slice(i, i + batchSize);
            
            await Promise.all(
                batch.map(task => {
                    const newDueDate = shiftDate(task.due_on, DAYS_TO_SHIFT);
                    
                    log(`   ${task.name}: ${task.due_on} → ${newDueDate}`);
                    
                    return tasksApiInstance.updateTask({
                        data: {
                            due_on: newDueDate
                        }
                    }, task.gid);
                })
            );
            
            updated += batch.length;
            log(`\nUpdated ${updated} / ${tasksToUpdate.length} tasks`);
        }
        
        log(`\n✓ Successfully shifted due dates for ${tasksToUpdate.length} tasks`);
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

