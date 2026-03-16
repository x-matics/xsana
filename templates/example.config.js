/**
 * xsana Configuration Example
 * 
 * Copy this file to config/local.config.js and fill in your values.
 * The local.config.js file is gitignored to keep your tokens safe.
 */

export default {
  // Define multiple environments for easy switching
  environments: {
    production: {
      accessToken: "YOUR_PRODUCTION_ACCESS_TOKEN",
      workspace_gid: "YOUR_PRODUCTION_WORKSPACE_GID",
      project_gid: "YOUR_DEFAULT_PROJECT_GID",
      task_gid: "YOUR_DEFAULT_TASK_GID"
    },
    
    staging: {
      accessToken: "YOUR_STAGING_ACCESS_TOKEN",
      workspace_gid: "YOUR_STAGING_WORKSPACE_GID",
      project_gid: "YOUR_DEFAULT_PROJECT_GID",
      task_gid: "YOUR_DEFAULT_TASK_GID"
    },
    
    development: {
      accessToken: "YOUR_DEVELOPMENT_ACCESS_TOKEN",
      workspace_gid: "YOUR_DEVELOPMENT_WORKSPACE_GID",
      project_gid: "YOUR_DEFAULT_PROJECT_GID",
      task_gid: "YOUR_DEFAULT_TASK_GID"
    }
  },
  
  // Set the active environment (can be overridden with ASANA_ENV environment variable)
  activeEnvironment: "development"
};

