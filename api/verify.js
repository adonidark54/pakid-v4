const Stripe = require('stripe');
 
module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
 
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }
 
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
 
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === 'paid' || session.status === 'complete') {
      return res.status(200).json({
        success: true,
        plan: session.metadata?.plan || 'monthly',
        email: session.customer_details?.email || ''
      });
    } else {
      return res.status(200).json({ success: false });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
