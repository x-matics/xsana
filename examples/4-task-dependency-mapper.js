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
 * Task Dependency Mapper
 * 
 * Creates a visual map of all dependencies for a task, showing:
 * - Tasks this task depends on (blocking tasks)
 * - Tasks that depend on this task (blocked tasks)
 * - Multi-level dependency chains
 * 
 * Useful for understanding task relationships and planning.
 */

async function run() {
    try {
        log('Mapping task dependencies...');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Get the main task
        const task = await tasksApiInstance.getTask(task_gid, {
            opt_fields: 'name,completed'
        });
        
        log(`\n📋 TASK: ${task.data.name}`);
        log(`   Status: ${task.data.completed ? '✓ Completed' : '○ Incomplete'}\n`);
        
        // Get dependencies (tasks this task depends on)
        const dependenciesResponse = await tasksApiInstance.getDependenciesForTask(task_gid, {
            opt_fields: 'name,completed,due_on'
        });
        
        const dependencies = dependenciesResponse.data || [];
        
        if (dependencies.length > 0) {
            log('⬅️  BLOCKING THIS TASK (Dependencies):');
            for (const dep of dependencies) {
                const status = dep.completed ? '✓' : '○';
                const dueDate = dep.due_on ? ` (Due: ${dep.due_on})` : '';
                log(`   ${status} ${dep.name}${dueDate}`);
            }
        } else {
            log('⬅️  No blocking dependencies');
        }
        
        log('');
        
        // Get dependents (tasks that depend on this task)
        const dependentsResponse = await tasksApiInstance.getDependentsForTask(task_gid, {
            opt_fields: 'name,completed,due_on'
        });
        
        const dependents = dependentsResponse.data || [];
        
        if (dependents.length > 0) {
            log('➡️  BLOCKED BY THIS TASK (Dependents):');
            for (const dep of dependents) {
                const status = dep.completed ? '✓' : '○';
                const dueDate = dep.due_on ? ` (Due: ${dep.due_on})` : '';
                log(`   ${status} ${dep.name}${dueDate}`);
            }
        } else {
            log('➡️  No dependent tasks');
        }
        
        // Summary
        log('\n📊 DEPENDENCY SUMMARY:');
        log(`   Blocking tasks: ${dependencies.length}`);
        log(`   Blocked tasks: ${dependents.length}`);
        
        const uncompletedDependencies = dependencies.filter(d => !d.completed).length;
        if (uncompletedDependencies > 0) {
            log(`   ⚠️  ${uncompletedDependencies} blocking task(s) still incomplete`);
        }
        
        log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        log('✓ Dependency mapping completed');
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

