const Stripe = require('stripe');
 
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const { plan } = req.body;
 
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' });
  }
 
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
 
  const prices = {
    trial:   process.env.STRIPE_PRICE_TRIAL || process.env.STRIPE_PRICE_MONTHLY,
    monthly: process.env.STRIPE_PRICE_MONTHLY,
    yearly:  process.env.STRIPE_PRICE_YEARLY,
  };
 
  const priceId = prices[plan];
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan: ' + plan });
  }
 
  const url = process.env.NEXT_PUBLIC_URL || 'https://pakid-pro-v3.vercel.app';
 
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: plan === 'trial' ? { trial_period_days: 7 } : {},
      metadata: { plan: plan },
      success_url: url + '/?session_id={CHECKOUT_SESSION_ID}&plan=' + plan,
      cancel_url: url + '/',
    });
    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
