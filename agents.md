<!-- AUTO-UPDATED: Run `xsana update-agents` to refresh API methods -->
<!-- Source: github.com/Asana/node-asana -->

# Asana Run Script API Reference

## Environment Constraints
- Scripts timeout in ~20 seconds
- `setTimeout` is not available
- Use async/await and parallelism as much as possible

## Key Gotchas
- User emails can be used as User GIDs in most places, including people custom fields
- `"me"` references the current API user — convenient when integrating with external APIs where you may only know a user's email
- Comments are "stories" in the API (`storiesApiInstance.createStoryForTask(...)`)
- Task description is `task.data.notes`, not `task.data.description`
- Some API calls need a `body` in opts (e.g., `sectionsApiInstance.addTaskForSection(section_gid, { body: { data: { task: task_gid } } })`)
- Certain attribute names differ between the API and common usage — always check the SDK method signatures

## Coding Guidelines
- Use `opt_fields` to specify which fields to return — avoid fetching unnecessary data
- Do not add unnecessary API calls or data outside of the given strategy
- Use the latest Asana Node client library with the methods listed below
- Handle errors with try/catch blocks

## In-Scope Variables
These variables are automatically available in Asana's Run Script environment (and provided by xsana locally):
- `project_gid` — GID of the project where the rule is triggered
- `task_gid` — GID of the triggering task (only if triggered by a task)
- `workspace_gid` — GID of the workspace
- `log(...)` — Logging function (behaves like `console.log`)
- `*ApiInstance` — All Asana API instances (e.g., `tasksApiInstance`, `goalsApiInstance`)

## Example Script

```js
/**
 * What's in scope?
 * 1. (number) project_gid, workspace_gid, task_gid (only if triggered on a task)
 * 2. (function) log - this behaves like console.log and takes any number of parameters
 * 3. (object) *ApiInstance - for each group of APIs, an object containing functions to call the APIs; for example:
 *    tasksApiInstance.getTask(...)
 *    goalsApiInstance.addFollowers(...)
 * For more info, see https://github.com/Asana/node-asana
 */

// below is a script that updates the triggering task's name

async function run() {
    try {
        const task = await tasksApiInstance.getTask(task_gid);

        log(`task's current name: ${task.data.name}`);

        await tasksApiInstance.updateTask({
            data: {
                name: task.data.name + " longer name"
            }
        }, task.data.gid);
    } catch (e) {
        log(e.message);
    }
}

run();
```

## Available API Methods

<!-- BEGIN AUTO-GENERATED -->
<!-- Last updated: 2026-03-16 -->

### accessRequestsApiInstance
- approveAccessRequest(access_request_gid)
- createAccessRequest(body)
- getAccessRequests(target, opts)
- rejectAccessRequest(access_request_gid)

### allocationsApiInstance
- createAllocation(body, opts)
- deleteAllocation(allocation_gid)
- getAllocation(allocation_gid, opts)
- getAllocations(opts)
- updateAllocation(body, allocation_gid, opts)

### attachmentsApiInstance
- createAttachmentForObject(opts)
- deleteAttachment(attachment_gid)
- getAttachment(attachment_gid, opts)
- getAttachmentsForObject(parent, opts)

### auditLogAPIApiInstance
- getAuditLogEvents(workspace_gid, opts)

### batchAPIApiInstance
- createBatchRequest(body, opts)

### budgetsApiInstance
- createBudget(body)
- deleteBudget(budget_gid)
- getBudget(budget_gid, opts)
- getBudgets(parent)
- updateBudget(body, budget_gid, opts)

### customFieldSettingsApiInstance
- getCustomFieldSettingsForGoal(goal_gid, opts)
- getCustomFieldSettingsForPortfolio(portfolio_gid, opts)
- getCustomFieldSettingsForProject(project_gid, opts)
- getCustomFieldSettingsForTeam(team_gid, opts)

### customFieldsApiInstance
- createCustomField(body, opts)
- createEnumOptionForCustomField(custom_field_gid, opts)
- deleteCustomField(custom_field_gid)
- getCustomField(custom_field_gid, opts)
- getCustomFieldsForWorkspace(workspace_gid, opts)
- insertEnumOptionForCustomField(custom_field_gid, opts)
- updateCustomField(custom_field_gid, opts)
- updateEnumOption(enum_option_gid, opts)

### customTypesApiInstance
- getCustomType(custom_type_gid, opts)
- getCustomTypes(project, opts)

### eventsApiInstance
- getEvents(resource, opts)

### exportsApiInstance
- createGraphExport(body)
- createResourceExport(body)

### goalRelationshipsApiInstance
- addSupportingRelationship(body, goal_gid, opts)
- getGoalRelationship(goal_relationship_gid, opts)
- getGoalRelationships(supported_goal, opts)
- removeSupportingRelationship(body, goal_gid)
- updateGoalRelationship(body, goal_relationship_gid, opts)

### goalsApiInstance
- addCustomFieldSettingForGoal(body, goal_gid)
- addFollowers(body, goal_gid, opts)
- createGoal(body, opts)
- createGoalMetric(body, goal_gid, opts)
- deleteGoal(goal_gid)
- getGoal(goal_gid, opts)
- getGoals(opts)
- getParentGoalsForGoal(goal_gid, opts)
- removeCustomFieldSettingForGoal(body, goal_gid)
- removeFollowers(body, goal_gid, opts)
- updateGoal(body, goal_gid, opts)
- updateGoalMetric(body, goal_gid, opts)

### jobsApiInstance
- getJob(job_gid, opts)

### membershipsApiInstance
- createMembership(opts)
- deleteMembership(membership_gid)
- getMembership(membership_gid)
- getMemberships(opts)
- updateMembership(body, membership_gid)

### organizationExportsApiInstance
- createOrganizationExport(body, opts)
- getOrganizationExport(organization_export_gid, opts)

### portfolioMembershipsApiInstance
- getPortfolioMembership(portfolio_membership_gid, opts)
- getPortfolioMemberships(opts)
- getPortfolioMembershipsForPortfolio(portfolio_gid, opts)

### portfoliosApiInstance
- addCustomFieldSettingForPortfolio(body, portfolio_gid)
- addItemForPortfolio(body, portfolio_gid)
- addMembersForPortfolio(body, portfolio_gid, opts)
- createPortfolio(body, opts)
- deletePortfolio(portfolio_gid)
- getItemsForPortfolio(portfolio_gid, opts)
- getPortfolio(portfolio_gid, opts)
- getPortfolios(workspace, opts)
- removeCustomFieldSettingForPortfolio(body, portfolio_gid)
- removeItemForPortfolio(body, portfolio_gid)
- removeMembersForPortfolio(body, portfolio_gid, opts)
- updatePortfolio(body, portfolio_gid, opts)

### projectBriefsApiInstance
- createProjectBrief(body, project_gid, opts)
- deleteProjectBrief(project_brief_gid)
- getProjectBrief(project_brief_gid, opts)
- updateProjectBrief(body, project_brief_gid, opts)

### projectMembershipsApiInstance
- getProjectMembership(project_membership_gid, opts)
- getProjectMembershipsForProject(project_gid, opts)

### projectStatusesApiInstance
- createProjectStatusForProject(body, project_gid, opts)
- deleteProjectStatus(project_status_gid)
- getProjectStatus(project_status_gid, opts)
- getProjectStatusesForProject(project_gid, opts)

### projectTemplatesApiInstance
- deleteProjectTemplate(project_template_gid)
- getProjectTemplate(project_template_gid, opts)
- getProjectTemplates(opts)
- getProjectTemplatesForTeam(team_gid, opts)
- instantiateProject(project_template_gid, opts)

### projectsApiInstance
- addCustomFieldSettingForProject(body, project_gid, opts)
- addFollowersForProject(body, project_gid, opts)
- addMembersForProject(body, project_gid, opts)
- createProject(body, opts)
- createProjectForTeam(body, team_gid, opts)
- createProjectForWorkspace(body, workspace_gid, opts)
- deleteProject(project_gid)
- duplicateProject(project_gid, opts)
- getProject(project_gid, opts)
- getProjects(opts)
- getProjectsForTask(task_gid, opts)
- getProjectsForTeam(team_gid, opts)
- getProjectsForWorkspace(workspace_gid, opts)
- getTaskCountsForProject(project_gid, opts)
- projectSaveAsTemplate(body, project_gid, opts)
- removeCustomFieldSettingForProject(body, project_gid)
- removeFollowersForProject(body, project_gid, opts)
- removeMembersForProject(body, project_gid, opts)
- updateProject(body, project_gid, opts)

### ratesApiInstance
- createRate(body, opts)
- deleteRate(rate_gid)
- getRate(rate_gid, opts)
- getRates(opts)
- updateRate(body, rate_gid, opts)

### reactionsApiInstance
- getReactionsOnObject(target, emoji_base, opts)

### rulesApiInstance
- triggerRule(body, rule_trigger_gid)

### sectionsApiInstance
- addTaskForSection(section_gid, opts)
- createSectionForProject(project_gid, opts)
- deleteSection(section_gid)
- getSection(section_gid, opts)
- getSectionsForProject(project_gid, opts)
- insertSectionForProject(project_gid, opts)
- updateSection(section_gid, opts)

### statusUpdatesApiInstance
- createStatusForObject(body, opts)
- deleteStatus(status_update_gid)
- getStatus(status_update_gid, opts)
- getStatusesForObject(parent, opts)

### storiesApiInstance
- createStoryForTask(body, task_gid, opts)
- deleteStory(story_gid)
- getStoriesForTask(task_gid, opts)
- getStory(story_gid, opts)
- updateStory(body, story_gid, opts)

### tagsApiInstance
- createTag(body, opts)
- createTagForWorkspace(body, workspace_gid, opts)
- deleteTag(tag_gid)
- getTag(tag_gid, opts)
- getTags(opts)
- getTagsForTask(task_gid, opts)
- getTagsForWorkspace(workspace_gid, opts)
- updateTag(body, tag_gid, opts)

### taskTemplatesApiInstance
- deleteTaskTemplate(task_template_gid)
- getTaskTemplate(task_template_gid, opts)
- getTaskTemplates(opts)
- instantiateTask(task_template_gid, opts)

### tasksApiInstance
- addDependenciesForTask(body, task_gid)
- addDependentsForTask(body, task_gid)
- addFollowersForTask(body, task_gid, opts)
- addProjectForTask(body, task_gid)
- addTagForTask(body, task_gid)
- createSubtaskForTask(body, task_gid, opts)
- createTask(body, opts)
- deleteTask(task_gid)
- duplicateTask(body, task_gid, opts)
- getDependenciesForTask(task_gid, opts)
- getDependentsForTask(task_gid, opts)
- getSubtasksForTask(task_gid, opts)
- getTask(task_gid, opts)
- getTaskForCustomID(workspace_gid, custom_id)
- getTasks(opts)
- getTasksForProject(project_gid, opts)
- getTasksForSection(section_gid, opts)
- getTasksForTag(tag_gid, opts)
- getTasksForUserTaskList(user_task_list_gid, opts)
- removeDependenciesForTask(body, task_gid)
- removeDependentsForTask(body, task_gid)
- removeFollowerForTask(body, task_gid, opts)
- removeProjectForTask(body, task_gid)
- removeTagForTask(body, task_gid)
- searchTasksForWorkspace(workspace_gid, opts)
- setParentForTask(body, task_gid, opts)
- updateTask(body, task_gid, opts)

### teamMembershipsApiInstance
- getTeamMembership(team_membership_gid, opts)
- getTeamMemberships(opts)
- getTeamMembershipsForTeam(team_gid, opts)
- getTeamMembershipsForUser(user_gid, workspace, opts)

### teamsApiInstance
- addUserForTeam(body, team_gid, opts)
- createTeam(body, opts)
- getTeam(team_gid, opts)
- getTeamsForUser(user_gid, organization, opts)
- getTeamsForWorkspace(workspace_gid, opts)
- removeUserForTeam(body, team_gid)
- updateTeam(body, team_gid, opts)

### timePeriodsApiInstance
- getTimePeriod(time_period_gid, opts)
- getTimePeriods(workspace, opts)

### timeTrackingEntriesApiInstance
- createTimeTrackingEntry(body, task_gid, opts)
- deleteTimeTrackingEntry(time_tracking_entry_gid)
- getTimeTrackingEntries(opts)
- getTimeTrackingEntriesForTask(task_gid, opts)
- getTimeTrackingEntry(time_tracking_entry_gid, opts)
- updateTimeTrackingEntry(body, time_tracking_entry_gid, opts)

### typeaheadApiInstance
- typeaheadForWorkspace(workspace_gid, resource_type, opts)

### userTaskListsApiInstance
- getUserTaskList(user_task_list_gid, opts)
- getUserTaskListForUser(user_gid, workspace, opts)

### usersApiInstance
- getFavoritesForUser(user_gid, resource_type, workspace, opts)
- getUser(user_gid, opts)
- getUserForWorkspace(workspace_gid, user_gid, opts)
- getUsers(opts)
- getUsersForTeam(team_gid, opts)
- getUsersForWorkspace(workspace_gid, opts)
- updateUser(body, user_gid, opts)
- updateUserForWorkspace(body, workspace_gid, user_gid, opts)

### webhooksApiInstance
- createWebhook(body, opts)
- deleteWebhook(webhook_gid)
- getWebhook(webhook_gid, opts)
- getWebhooks(workspace, opts)
- updateWebhook(body, webhook_gid, opts)

### workspaceMembershipsApiInstance
- getWorkspaceMembership(workspace_membership_gid, opts)
- getWorkspaceMembershipsForUser(user_gid, opts)
- getWorkspaceMembershipsForWorkspace(workspace_gid, opts)

### workspacesApiInstance
- addUserForWorkspace(body, workspace_gid, opts)
- getWorkspace(workspace_gid, opts)
- getWorkspaceEvents(workspace_gid, opts)
- getWorkspaces(opts)
- removeUserForWorkspace(body, workspace_gid)
- updateWorkspace(body, workspace_gid, opts)
<!-- END AUTO-GENERATED -->
