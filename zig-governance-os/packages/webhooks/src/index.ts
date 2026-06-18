export type OutboundWebhookEvent =
  | "user.created"
  | "user.updated"
  | "tenant.created"
  | "project.created"
  | "risk.created"
  | "risk.updated"
  | "control.created"
  | "evidence.uploaded"
  | "audit.started"
  | "audit.closed"
  | "invoice.paid"
  | "workflow.executed";

export type InboundWebhookProvider = "stripe" | "github" | "slack" | "jira" | "servicenow" | "resend" | "twilio" | "microsoft_graph" | "google_workspace";
export type WebhookDeliveryStatus = "queued" | "delivered" | "retrying" | "failed" | "dead_lettered";

export interface WebhookDelivery {
  id: string;
  tenantId: string;
  event: OutboundWebhookEvent;
  status: WebhookDeliveryStatus;
  attempts: number;
  nextAttemptAt?: Date;
}

export class WebhookRouter {
  shouldRetry(delivery: WebhookDelivery): boolean {
    return delivery.status === "failed" && delivery.attempts < 5;
  }

  nextStatus(delivery: WebhookDelivery): WebhookDeliveryStatus {
    if (delivery.status !== "failed") return delivery.status;
    return this.shouldRetry(delivery) ? "retrying" : "dead_lettered";
  }
}
