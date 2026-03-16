// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, projectsApiInstance, tasksApiInstance, sectionsApiInstance, project_gid } from 'xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Project Reporter
 * 
 * Generates a comprehensive project status report including:
 * - Total tasks
 * - Completed vs incomplete tasks
 * - Overdue tasks
 * - Tasks by section
 * - Tasks by assignee
 * 
 * The report is logged and can be used to create a summary.
 */

async function run() {
    try {
        log('Generating project report...');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Get project details
        const project = await projectsApiInstance.getProject(project_gid, {
            opt_fields: 'name,created_at,modified_at,owner'
        });
        
        log(`\n📊 PROJECT REPORT: ${project.data.name}`);
        log(`Owner: ${project.data.owner ? project.data.owner.name : 'None'}\n`);
        
        // Get all tasks with relevant fields
        let allTasks = [];
        let offset = null;
        let hasMore = true;
        
        while (hasMore) {
            const opts = {
                opt_fields: 'name,completed,due_on,assignee,memberships.section.name',
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
        
        // Calculate statistics
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.completed).length;
        const incompleteTasks = totalTasks - completedTasks;
        
        const today = new Date().toISOString().split('T')[0];
        const overdueTasks = allTasks.filter(t => 
            !t.completed && t.due_on && t.due_on < today
        ).length;
        
        // Tasks by section
        const tasksBySection = {};
        allTasks.forEach(task => {
            const sectionName = task.memberships && task.memberships[0] && task.memberships[0].section 
                ? task.memberships[0].section.name 
                : 'No Section';
            tasksBySection[sectionName] = (tasksBySection[sectionName] || 0) + 1;
        });
        
        // Tasks by assignee
        const tasksByAssignee = {};
        allTasks.forEach(task => {
            const assigneeName = task.assignee ? task.assignee.name : 'Unassigned';
            tasksByAssignee[assigneeName] = (tasksByAssignee[assigneeName] || 0) + 1;
        });
        
        // Print report
        log('📈 TASK STATISTICS');
        log(`   Total Tasks: ${totalTasks}`);
        log(`   ✓ Completed: ${completedTasks} (${Math.round(completedTasks/totalTasks*100)}%)`);
        log(`   ○ Incomplete: ${incompleteTasks} (${Math.round(incompleteTasks/totalTasks*100)}%)`);
        log(`   ⚠ Overdue: ${overdueTasks}`);
        
        log('\n📂 TASKS BY SECTION');
        Object.entries(tasksBySection)
            .sort((a, b) => b[1] - a[1])
            .forEach(([section, count]) => {
                log(`   ${section}: ${count} tasks`);
            });
        
        log('\n👥 TASKS BY ASSIGNEE');
        Object.entries(tasksByAssignee)
            .sort((a, b) => b[1] - a[1])
            .forEach(([assignee, count]) => {
                log(`   ${assignee}: ${count} tasks`);
            });
        
        log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log('✓ Report generated successfully');
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

