import { BillingPlatform, type CheckoutSessionRequest } from "@zig/billing";

export class BillingService {
  private readonly platform = new BillingPlatform();

  listPlans() {
    return this.platform.listPlans();
  }

  createCheckoutSessionPayload(request: CheckoutSessionRequest) {
    return this.platform.createCheckoutSessionPayload(request);
  }

  mapStripeWebhook(type: string) {
    return this.platform.mapStripeWebhook(type);
  }
}
