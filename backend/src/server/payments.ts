export type PaymentIntentInput = {
  enrollmentId: string;
  amount: number;
  currency?: string;
};

export async function createPaymentIntent(input: PaymentIntentInput) {
  if (input.amount <= 0) {
    return { provider: "free", status: "paid", clientSecret: null };
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return { provider: "stripe-placeholder", status: "pending", clientSecret: "stripe_not_configured" };
  }
  return { provider: "stripe", status: "pending", clientSecret: "connect_stripe_sdk_here" };
}
