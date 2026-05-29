Refactoring plan:


Problems: 
1) Logic duplication: batch logic is written both inside IssueImportService and IssueBatchImportService (see buildImportBatch(), startBatchImport() and other batch methods that are inside IssueImportService but should not be);
2) Circular dependency: IssueImportService.importFromConfig() calls IssueBatchImportService.startBatchImport(). IssueBatchImportService.batchOperation() calls IssueImportService.importFromDrupalOrgBatch();
3) Hardcoded api calls: code is written to only work with the Drupal API, using URL and parameters specific to Drupal.

Refactoring steps:

1. Preliminary Analysis of Code Roles
*   IssueImportService (Current): Acting as both an orchestrator (deciding between batch/direct and building batches) and a processor (handling API requests and node creation).
*   IssueBatchImportService (Current): Acting as a execution driver for batches, but tightly coupled to the process service.
2. Implementation Plan
Phase 1: Service Renaming & Configuration
*   File Renaming:
    *   Rename web/modules/custom/ai_dashboard/src/Service/IssueImportService.php to IssueImportProcessService.php.
    *   Rename web/modules/custom/ai_dashboard/src/Service/IssueBatchImportService.php to IssueImportOrchestrationService.php.
*   Dependency Injection & services.yml:
    *   Update ai_dashboard.services.yml.
    *   Define ai_dashboard.issue_import_process (formerly issue_import).
    *   Define ai_dashboard.issue_import_orchestration (formerly batch_import), injecting ai_dashboard.issue_import_process as a dependency.
Phase 2: Refactoring IssueImportOrchestrationService
This service will now own the "Control Plane" logic.
*   Core Method import(ModuleImport $config):
    *   Move the logic from the old IssueImportService::import() here.
    *   This method will check the configuration and decide: "Do I call ProcessService::importFromApi() directly, or do I trigger startBatchImport()?".
*   Batch Construction Logic:
    *   Move buildImportBatch() from IssueImportService to this service.
    *   Move createMultiStatusBatch() from IssueBatchImportService to this service.
*   Batch Execution (Callbacks):
    *   Keep/Refactor batchOperation(), batchOperationSingleStatus(), and batchFinished().
    *   These methods will now call methods on the injected IssueImportProcessService.
Phase 3: Refactoring IssueImportProcessService
This service will now be the "Data Plane" logic, focused solely on the "How" of importing.
*   Cleanup: Remove all batch-building, BatchBuilder usage, and pagination-loop-orchestration logic.
*   Standardized Interface:
    *   Maintain importFromApi() and importFromApiBatch().
    *   Maintain processIssue(), mapIssueData(), and source-specific mappers (mapDrupalOrgIssue, mapGitLabIssue).
*   Encapsulation: Ensure that while the methods handle source-specific API structures, the public interface only requires the ModuleImport config and necessary parameters (like offset and limit for batches).
Phase 4: Verification
*   Verify that IssueImportOrchestrationService no longer depends on IssueBatchImportService (eliminating circularity).
*   Ensure all parts of the codebase calling the old service names are updated to the new service IDs and class names.
