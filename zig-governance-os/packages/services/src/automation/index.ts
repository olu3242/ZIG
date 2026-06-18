import { AutomationEngine, type WorkflowDefinition } from "@zig/automation";

export class AutomationService {
  private readonly engine = new AutomationEngine();

  execute(workflow: WorkflowDefinition, event: Record<string, unknown>) {
    return this.engine.execute(workflow, event);
  }
}
