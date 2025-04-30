import { useRouter } from 'next/router';

const PaymentCancel = () => {
  const router = useRouter();

  return (
    <div>
      <h1>Payment Canceled</h1>
      <p>Your payment has been canceled. If you have any issues, please try again or contact support.</p>
    </div>
  );
};

export default PaymentCancel;
