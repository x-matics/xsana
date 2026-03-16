// ============================================================================
// LOCAL TESTING SETUP - DO NOT COPY THIS SECTION TO ASANA
// ============================================================================
// Optional: Override environment for testing
// process.env.ASANA_ENV = 'development'; // 'development', 'staging', 'production'

import { log, portfoliosApiInstance, projectsApiInstance, project_gid } from '@x-matics/xsana';

// ============================================================================
// ===== COPY EVERYTHING BELOW THIS LINE TO ASANA RUN SCRIPT =====
// ============================================================================

/**
 * Portfolio Finder
 * 
 * Finds all portfolios that contain a specific project.
 * Useful for:
 * - Understanding project organization
 * - Auditing portfolio membership
 * - Project discovery
 * 
 * Configuration: None required (uses project_gid from context)
 */

async function run() {
    try {
        // Get the project to find its workspace
        const project = await projectsApiInstance.getProject(project_gid, {
            opt_fields: 'name,workspace.gid'
        });
        
        const workspace_gid = project.data.workspace.gid;
        log(`Looking for portfolios containing project: ${project.data.name} (${project_gid})`);
        
        // Get all portfolios in the workspace
        const portfolios = await portfoliosApiInstance.getPortfolios(workspace_gid, {
            owner: 'me',
            opt_fields: 'name,gid'
        });
        
        log(`Found ${portfolios.data.length} portfolios in workspace`);
        
        // Check each portfolio to see if it contains our project (in parallel)
        const portfolioChecks = portfolios.data.map(async (portfolio) => {
            try {
                const items = await portfoliosApiInstance.getItemsForPortfolio(portfolio.gid, {
                    opt_fields: 'gid'
                });
                
                // Check if our project is in this portfolio
                const containsProject = items.data.some(item => item.gid === project_gid);
                
                if (containsProject) {
                    return {
                        name: portfolio.name,
                        gid: portfolio.gid
                    };
                }
                return null;
            } catch (error) {
                log(`Error checking portfolio ${portfolio.name}: ${error.message}`);
                return null;
            }
        });
        
        // Wait for all portfolio checks to complete
        const results = await Promise.all(portfolioChecks);
        
        // Filter out null results
        const portfoliosContainingProject = results.filter(result => result !== null);
        
        // Log results
        if (portfoliosContainingProject.length > 0) {
            log(`\n📊 Project "${project.data.name}" is in ${portfoliosContainingProject.length} portfolio(s):`);
            portfoliosContainingProject.forEach(portfolio => {
                log(`   • ${portfolio.name} (GID: ${portfolio.gid})`);
            });
        } else {
            log(`\n📊 Project "${project.data.name}" is not in any portfolios`);
        }
        
        log('\n✓ Portfolio search completed');
        
    } catch (error) {
        log('Error:', error.message || error);
    }
}

run();

