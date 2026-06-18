export type BillingPlanCode = "starter" | "professional" | "enterprise" | "partner" | "custom";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";
export type BillingEventType =
  | "subscription_created"
  | "subscription_updated"
  | "plan_changed"
  | "invoice_paid"
  | "payment_failed"
  | "subscription_cancelled";

export interface BillingPlan {
  code: BillingPlanCode;
  name: string;
  monthlyPriceCents: number | null;
  includedSeats: number;
  features: PlanFeature[];
}

export interface PlanFeature {
  name: string;
  limit: number | "unlimited";
  usageType: "seat" | "tenant" | "metered" | "entitlement";
  enabled: boolean;
  auditTrail: boolean;
}

export interface CheckoutSessionRequest {
  tenantId: string;
  customerEmail: string;
  stripePriceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface StripeCheckoutSessionPayload {
  mode: "subscription";
  customer_email: string;
  line_items: Array<{ price: string; quantity: number }>;
  success_url: string;
  cancel_url: string;
  metadata: { tenant_id: string };
}

export const billingPlans: BillingPlan[] = [
  { code: "starter", name: "Starter", monthlyPriceCents: 4900, includedSeats: 5, features: baseFeatures(10, 3) },
  { code: "professional", name: "Professional", monthlyPriceCents: 14900, includedSeats: 25, features: baseFeatures(50, 10) },
  { code: "enterprise", name: "Enterprise", monthlyPriceCents: 49900, includedSeats: 100, features: baseFeatures("unlimited", "unlimited") },
  { code: "partner", name: "Partner", monthlyPriceCents: null, includedSeats: 250, features: baseFeatures("unlimited", "unlimited") },
  { code: "custom", name: "Custom", monthlyPriceCents: null, includedSeats: 0, features: baseFeatures("unlimited", "unlimited") },
];

export class BillingPlatform {
  listPlans(): BillingPlan[] {
    return billingPlans;
  }

  createCheckoutSessionPayload(request: CheckoutSessionRequest): StripeCheckoutSessionPayload {
    assertRequired(request.tenantId, "tenantId");
    assertRequired(request.customerEmail, "customerEmail");
    assertRequired(request.stripePriceId, "stripePriceId");

    return {
      mode: "subscription",
      customer_email: request.customerEmail,
      line_items: [{ price: request.stripePriceId, quantity: 1 }],
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      metadata: { tenant_id: request.tenantId },
    };
  }

  mapStripeWebhook(type: string): BillingEventType | null {
    const events: Record<string, BillingEventType> = {
      "checkout.session.completed": "subscription_created",
      "customer.subscription.created": "subscription_created",
      "customer.subscription.updated": "subscription_updated",
      "customer.subscription.deleted": "subscription_cancelled",
      "invoice.paid": "invoice_paid",
      "invoice.payment_failed": "payment_failed",
    };

    return events[type] ?? null;
  }
}

function baseFeatures(projectLimit: number | "unlimited", automationLimit: number | "unlimited"): PlanFeature[] {
  return [
    { name: "Projects", limit: projectLimit, usageType: "tenant", enabled: true, auditTrail: true },
    { name: "Automation Workflows", limit: automationLimit, usageType: "metered", enabled: true, auditTrail: true },
    { name: "Evidence Exports", limit: "unlimited", usageType: "entitlement", enabled: true, auditTrail: true },
  ];
}

function assertRequired(value: string, label: string): void {
  if (!value.trim()) {
    throw new Error(`${label} is required.`);
  }
}
