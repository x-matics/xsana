// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, tasksApiInstance, usersApiInstance, project_gid, workspace_gid } from '@x-matics/xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Team Workload Analyzer
 * 
 * Analyzes workload distribution across team members including:
 * - Number of assigned tasks
 * - Completed vs incomplete tasks
 * - Overdue tasks
 * - Workload balance
 * 
 * Helps identify overloaded team members and balance work distribution.
 */

async function run() {
    try {
        log('Analyzing team workload...');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Get all tasks in the project
        let allTasks = [];
        let offset = null;
        let hasMore = true;
        
        while (hasMore) {
            const opts = {
                opt_fields: 'name,assignee,completed,due_on',
                limit: 100
            };
            
            if (offset) {
                opts.offset = offset;
            }
            
            const response = await tasksApiInstance.getTasksForProject(project_gid, opts);
            allTasks = allTasks.concat(response.data);
            
            if (response._response && response._response.next_page) {
                offset = response._response.next_page.offset;
            } else {
                hasMore = false;
            }
        }
        
        log(`\nAnalyzing ${allTasks.length} tasks...`);
        
        // Build workload statistics per assignee
        const workloadByUser = {};
        const today = new Date().toISOString().split('T')[0];
        
        allTasks.forEach(task => {
            const assigneeName = task.assignee ? task.assignee.name : 'Unassigned';
            const assigneeGid = task.assignee ? task.assignee.gid : 'unassigned';
            
            if (!workloadByUser[assigneeGid]) {
                workloadByUser[assigneeGid] = {
                    name: assigneeName,
                    total: 0,
                    completed: 0,
                    incomplete: 0,
                    overdue: 0
                };
            }
            
            workloadByUser[assigneeGid].total++;
            
            if (task.completed) {
                workloadByUser[assigneeGid].completed++;
            } else {
                workloadByUser[assigneeGid].incomplete++;
                
                if (task.due_on && task.due_on < today) {
                    workloadByUser[assigneeGid].overdue++;
                }
            }
        });
        
        // Sort by incomplete tasks (workload)
        const sortedUsers = Object.values(workloadByUser)
            .sort((a, b) => b.incomplete - a.incomplete);
        
        // Display results
        log('\n👥 TEAM WORKLOAD DISTRIBUTION\n');
        
        sortedUsers.forEach(user => {
            const completionRate = user.total > 0 
                ? Math.round((user.completed / user.total) * 100) 
                : 0;
            
            log(`${user.name}`);
            log(`   Total: ${user.total} tasks`);
            log(`   ○ Incomplete: ${user.incomplete}`);
            log(`   ✓ Completed: ${user.completed} (${completionRate}%)`);
            
            if (user.overdue > 0) {
                log(`   ⚠️  Overdue: ${user.overdue}`);
            }
            
            // Workload indicator
            if (user.incomplete > 20) {
                log(`   🔴 HIGH WORKLOAD`);
            } else if (user.incomplete > 10) {
                log(`   🟡 MEDIUM WORKLOAD`);
            } else if (user.incomplete > 0) {
                log(`   🟢 LOW WORKLOAD`);
            }
            
            log('');
        });
        
        // Summary statistics
        const totalIncomplete = sortedUsers.reduce((sum, u) => sum + u.incomplete, 0);
        const avgIncomplete = Math.round(totalIncomplete / sortedUsers.length);
        
        log('📊 SUMMARY');
        log(`   Team members: ${sortedUsers.length}`);
        log(`   Total incomplete tasks: ${totalIncomplete}`);
        log(`   Average per person: ${avgIncomplete} tasks`);
        
        log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log('✓ Workload analysis completed');
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

