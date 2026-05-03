/**
 * xsana - Local Testing Helper for Asana Run Script actions
 *
 * Provides the same environment that Asana's "Run Script" feature provides,
 * allowing you to develop and test scripts locally before deploying them.
 */

import Asana from 'asana';
import { existsSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

// Load configuration from the user's project directory (cwd)
let config = null;
const cwd = process.cwd();
const localConfigPath = join(cwd, 'config', 'local.config.js');
const exampleConfigPath = join(cwd, 'config', 'example.config.js');

try {
  if (existsSync(localConfigPath)) {
    config = (await import(pathToFileURL(localConfigPath).href)).default;
  } else if (existsSync(exampleConfigPath)) {
    config = (await import(pathToFileURL(exampleConfigPath).href)).default;
    console.warn('\nWARNING: Using example.config.js. Copy it to local.config.js and add your credentials.\n');
  } else {
    throw new Error('No configuration file found. Please create config/local.config.js');
  }
} catch (error) {
  if (error.message.includes('No configuration file found')) {
    console.error('Error:', error.message);
  } else {
    console.error('Error loading configuration:', error.message);
  }
  console.error('\nPlease create a config/local.config.js file based on the example config.');
  console.error('Run "xsana setup" to set up a new project.');
  process.exit(1);
}

// Determine active environment
const envName = process.env.ASANA_ENV || config.activeEnvironment || 'development';
const env = config.environments[envName];

if (!env) {
  console.error(`Environment "${envName}" not found in configuration.`);
  console.error(`Available environments: ${Object.keys(config.environments).join(', ')}`);
  process.exit(1);
}

console.log(`Using environment: ${envName}`);

// Initialize Asana client
const client = Asana.ApiClient.instance;
const token = client.authentications['token'];
token.accessToken = env.accessToken;

// Export log function (mimics Asana's log function)
const log = console.log;

// Export context variables (same as Asana Run Script environment)
const project_gid = env.project_gid || '';
const task_gid = env.task_gid || '';
const workspace_gid = env.workspace_gid || '';

// Initialize all API instances (same as Asana Run Script environment)
const accessRequestsApiInstance = new Asana.AccessRequestsApi();
const allocationsApiInstance = new Asana.AllocationsApi();
const attachmentsApiInstance = new Asana.AttachmentsApi();
const auditLogAPIApiInstance = new Asana.AuditLogAPIApi();
const batchAPIApiInstance = new Asana.BatchAPIApi();
const budgetsApiInstance = new Asana.BudgetsApi();
const customFieldSettingsApiInstance = new Asana.CustomFieldSettingsApi();
const customFieldsApiInstance = new Asana.CustomFieldsApi();
const customTypesApiInstance = new Asana.CustomTypesApi();
const eventsApiInstance = new Asana.EventsApi();
const exportsApiInstance = new Asana.ExportsApi();
const goalRelationshipsApiInstance = new Asana.GoalRelationshipsApi();
const goalsApiInstance = new Asana.GoalsApi();
const jobsApiInstance = new Asana.JobsApi();
const membershipsApiInstance = new Asana.MembershipsApi();
const organizationExportsApiInstance = new Asana.OrganizationExportsApi();
const portfolioMembershipsApiInstance = new Asana.PortfolioMembershipsApi();
const portfoliosApiInstance = new Asana.PortfoliosApi();
const projectBriefsApiInstance = new Asana.ProjectBriefsApi();
const projectMembershipsApiInstance = new Asana.ProjectMembershipsApi();
const projectStatusesApiInstance = new Asana.ProjectStatusesApi();
const projectTemplatesApiInstance = new Asana.ProjectTemplatesApi();
const projectsApiInstance = new Asana.ProjectsApi();
const ratesApiInstance = new Asana.RatesApi();
const reactionsApiInstance = new Asana.ReactionsApi();
const rulesApiInstance = new Asana.RulesApi();
const sectionsApiInstance = new Asana.SectionsApi();
const statusUpdatesApiInstance = new Asana.StatusUpdatesApi();
const storiesApiInstance = new Asana.StoriesApi();
const tagsApiInstance = new Asana.TagsApi();
const taskTemplatesApiInstance = new Asana.TaskTemplatesApi();
const tasksApiInstance = new Asana.TasksApi();
const teamMembershipsApiInstance = new Asana.TeamMembershipsApi();
const teamsApiInstance = new Asana.TeamsApi();
const timePeriodsApiInstance = new Asana.TimePeriodsApi();
const timeTrackingEntriesApiInstance = new Asana.TimeTrackingEntriesApi();
const typeaheadApiInstance = new Asana.TypeaheadApi();
const userTaskListsApiInstance = new Asana.UserTaskListsApi();
const usersApiInstance = new Asana.UsersApi();
const webhooksApiInstance = new Asana.WebhooksApi();
const workspaceMembershipsApiInstance = new Asana.WorkspaceMembershipsApi();
const workspacesApiInstance = new Asana.WorkspacesApi();

// Export everything (matching Asana Run Script environment)
export {
  // Context variables
  log,
  project_gid,
  task_gid,
  workspace_gid,

  // All API instances
  accessRequestsApiInstance,
  allocationsApiInstance,
  attachmentsApiInstance,
  auditLogAPIApiInstance,
  batchAPIApiInstance,
  budgetsApiInstance,
  customFieldSettingsApiInstance,
  customFieldsApiInstance,
  customTypesApiInstance,
  eventsApiInstance,
  exportsApiInstance,
  goalRelationshipsApiInstance,
  goalsApiInstance,
  jobsApiInstance,
  membershipsApiInstance,
  organizationExportsApiInstance,
  portfolioMembershipsApiInstance,
  portfoliosApiInstance,
  projectBriefsApiInstance,
  projectMembershipsApiInstance,
  projectStatusesApiInstance,
  projectTemplatesApiInstance,
  projectsApiInstance,
  ratesApiInstance,
  reactionsApiInstance,
  rulesApiInstance,
  sectionsApiInstance,
  statusUpdatesApiInstance,
  storiesApiInstance,
  tagsApiInstance,
  taskTemplatesApiInstance,
  tasksApiInstance,
  teamMembershipsApiInstance,
  teamsApiInstance,
  timePeriodsApiInstance,
  timeTrackingEntriesApiInstance,
  typeaheadApiInstance,
  userTaskListsApiInstance,
  usersApiInstance,
  webhooksApiInstance,
  workspaceMembershipsApiInstance,
  workspacesApiInstance
};
