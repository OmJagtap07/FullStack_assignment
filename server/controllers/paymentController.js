import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');

export const createCheckoutSession = async (req, res) => {
    try {
        // If no secret key is provided, we simulate a successful mock checkout for the viva
        if (!process.env.STRIPE_SECRET_KEY) {
            console.log("Stripe mock mode: Secret key missing, returning fake session.");
            return res.status(200).json({ success: true, url: 'https://checkout.stripe.com/mock-session' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Premium Creator Badge',
                            description: 'Unlock premium analytics and advanced AI features',
                        },
                        unit_amount: 999, // $9.99
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?success=true`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?canceled=true`,
            customer_email: req.user.email,
        });

        res.status(200).json({ success: true, url: session.url });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ success: false, message: 'Payment gateway error', error: error.message });
    }
};
