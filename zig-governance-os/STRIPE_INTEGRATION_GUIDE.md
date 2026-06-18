# Stripe Integration Guide

Use Stripe Billing APIs for subscriptions and usage-based billing. Use Checkout Sessions with `mode=subscription` for purchase and the Stripe Customer Portal for upgrade, downgrade, cancellation, and payment method changes.

Do not build manual renewal loops with PaymentIntents. Do not use deprecated Stripe Plan objects; use Stripe Prices.

Required events:
- `checkout.session.completed`
- `customer.created`
- `invoice.created`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Required environment variables: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
