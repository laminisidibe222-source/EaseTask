/**
 * Payment integration — Lemon Squeezy (merchant of record).
 *
 * Why Lemon Squeezy for Senegal / no-company founders:
 *   - Acts as the Merchant of Record: handles VAT/tax, fraud, chargebacks,
 *     global card acceptance, and payouts to you.
 *   - Accepts individuals / sole traders — no registered company required.
 *   - Payouts via Wise / bank transfer to Senegal (and mobile-money-friendly
 *     intermediaries). No Paydunya / Flouci integration needed.
 *
 * Setup (5 min):
 *   1. Create account at lemonsqueezy.com (choose "Individual / Sole trader").
 *   2. Create two subscription products: "Starter" and "Pro".
 *   3. Copy each product's Checkout URL into VITE_PAYMENT_STARTER_URL and
 *      VITE_PAYMENT_PRO_URL in your .env file.
 *   4. (Optional) Set up a Lemon Squeezy webhook → Supabase Edge Function to
 *      flip the `plan` column on successful payment.
 *
 * If checkout URLs aren't configured yet, the button shows a friendly
 * "coming soon" state instead of breaking.
 */

export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: ['3 analyses / month', 'Basic fertility score', 'Top-1 crop recommendation'],
    checkoutUrl: null,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 4.99,
    period: 'month',
    features: ['30 analyses / month', 'Full metrics & pH estimate', 'Top-3 crop recommendations', 'Cultivation calendar'],
    checkoutUrl: import.meta.env.VITE_PAYMENT_STARTER_URL || null,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 12.99,
    period: 'month',
    features: ['Unlimited analyses', 'Everything in Starter', 'Season-long rotation plan', 'Exportable PDF report', 'Priority support'],
    checkoutUrl: import.meta.env.VITE_PAYMENT_PRO_URL || null,
  },
}

export function openCheckout(planId) {
  const plan = PLANS[planId]
  if (!plan?.checkoutUrl) {
    return false
  }
  // Lemon Squeezy checkout opens in a new tab; user returns via redirect URL.
  window.open(plan.checkoutUrl, '_blank', 'noopener,noreferrer')
  return true
}

/** Limits per plan — enforced client-side as a UX guard (also enforce in Supabase RLS / Edge Function). */
export const PLAN_LIMITS = {
  free: { analysesPerMonth: 3 },
  starter: { analysesPerMonth: 30 },
  pro: { analysesPerMonth: Infinity },
}
