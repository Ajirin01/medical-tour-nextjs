export const useStripeHelper = () => ({
  createPaymentIntent: async () => ({ clientSecret: null }),
  confirmPayment: async () => ({ success: false }),
});
