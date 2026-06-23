import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe as useStripeWeb, useElements, CardElement } from '@stripe/react-stripe-js';

let stripePromise = null;

export const StripeProvider = ({ publishableKey, children }) => {
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey);
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export const useStripe = () => {
  const stripe = useStripeWeb();
  const elements = useElements();

  return {
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => {
      // On Web, the actual payment logic will be handled via the CardElement component
      // This is a bridge to allow the same hook to be called
      return { error: null };
    },
    confirmPayment: async (clientSecret, data) => {
      console.log('💳 [Stripe Web] confirmPayment called with secret:', clientSecret?.substring(0, 10) + '...');
      if (!stripe || !elements) {
        console.error('❌ [Stripe Web] Stripe or Elements not loaded');
        return { error: new Error('Stripe not loaded') };
      }
      
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        console.error('❌ [Stripe Web] CardElement not found in Elements provider');
        return { error: new Error('Card element not found') };
      }

      const paymentData = { ...data };
      if (!paymentData.payment_method) {
        paymentData.payment_method = { card: cardElement };
      } else if (!paymentData.payment_method.card) {
        paymentData.payment_method.card = cardElement;
      }

      console.log('🚀 [Stripe Web] Confirming card payment...');
      const result = await stripe.confirmCardPayment(clientSecret, paymentData);
      console.log('✅ [Stripe Web] Confirmation result:', result.error ? 'FAILED' : 'SUCCESS');
      return result;
    },
    stripe,
    elements
  };
};
