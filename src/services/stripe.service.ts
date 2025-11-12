import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialization - only create Stripe instance when needed
let stripe: Stripe | null = null;

const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover'
    });
  }
  return stripe;
};

export const createCheckoutSession = async (
  priceId: string,
  userId: string,
  userEmail: string,
  planType: string = 'Pro',
  billingCycle: string = 'Monthly'
) => {
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    customer_email: userEmail,
    metadata: {
      userId: userId,
      planType: planType,
      billingCycle: billingCycle,
    },
  });

  return session;
}

export const getSubscription = async (subscriptionId: string) => {
  return await getStripe().subscriptions.retrieve(subscriptionId);
};

export const cancelSubscription = async (subscriptionId: string) => {
  return await getStripe().subscriptions.cancel(subscriptionId);
};

export default getStripe;
