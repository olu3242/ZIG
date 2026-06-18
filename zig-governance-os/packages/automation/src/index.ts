export type TriggerKey =
  | "user.created"
  | "project.created"
  | "framework.assigned"
  | "risk.updated"
  | "control.tested"
  | "audit.closed"
  | "evidence.uploaded"
  | "task.completed";

export type ConditionOperator = "equals" | "contains" | "greater_than" | "less_than" | "status_change" | "framework_match";
export type ActionKey = "create_task" | "assign_user" | "send_email" | "generate_audit_event" | "update_status" | "trigger_ai_analysis" | "generate_report";

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean;
}

export interface WorkflowAction {
  key: ActionKey;
  config: Record<string, string | number | boolean>;
}

export interface WorkflowDefinition {
  id: string;
  tenantId: string;
  name: string;
  trigger: TriggerKey;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  executionMode: "immediate" | "scheduled" | "recurring" | "event_driven" | "manual";
  enabled: boolean;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  tenantId: string;
  outcome: "success" | "skipped" | "failed";
  actionsExecuted: number;
  logs: string[];
}

export const triggerRegistry: TriggerKey[] = [
  "user.created",
  "project.created",
  "framework.assigned",
  "risk.updated",
  "control.tested",
  "audit.closed",
  "evidence.uploaded",
  "task.completed",
];

export class AutomationEngine {
  execute(workflow: WorkflowDefinition, event: Record<string, unknown>): WorkflowExecutionResult {
    if (!workflow.enabled) {
      return result(workflow, "skipped", 0, ["Workflow is disabled."]);
    }

    const conditionsMet = workflow.conditions.every((condition) => evaluateCondition(condition, event));
    if (!conditionsMet) {
      return result(workflow, "skipped", 0, ["Workflow conditions did not match."]);
    }

    return result(workflow, "success", workflow.actions.length, workflow.actions.map((action) => `Queued ${action.key}.`));
  }
}

function evaluateCondition(condition: WorkflowCondition, event: Record<string, unknown>): boolean {
  const actual = event[condition.field];
  if (condition.operator === "equals") return actual === condition.value;
  if (condition.operator === "contains") return String(actual ?? "").includes(String(condition.value));
  if (condition.operator === "greater_than") return Number(actual) > Number(condition.value);
  if (condition.operator === "less_than") return Number(actual) < Number(condition.value);
  if (condition.operator === "status_change") return event.previousStatus !== event.status && event.status === condition.value;
  if (condition.operator === "framework_match") return event.frameworkId === condition.value || event.frameworkCode === condition.value;
  return false;
}

function result(workflow: WorkflowDefinition, outcome: WorkflowExecutionResult["outcome"], actionsExecuted: number, logs: string[]): WorkflowExecutionResult {
  return { workflowId: workflow.id, tenantId: workflow.tenantId, outcome, actionsExecuted, logs };
}
