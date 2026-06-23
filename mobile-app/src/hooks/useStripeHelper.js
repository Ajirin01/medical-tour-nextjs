export const useStripeHelper = () => ({
  createPaymentIntent: async () => ({ clientSecret: null }),
  confirmPayment: async () => ({ success: false, error: 'Web payments not supported' }),
});
