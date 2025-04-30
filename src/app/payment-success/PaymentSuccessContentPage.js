"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { fetchData, postData } from '@/utils/api';
import { useToast } from '@/context/ToastContext';
import { useSession } from "next-auth/react";

const PaymentSuccessContentPage = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const [isClient, setIsClient] = useState(false); // For client-side check
  const router = useRouter()

  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    // Ensure this only runs on client-side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && session_id && token) {
      // Call backend to verify the payment session
      const verifyPayment = async () => {
        try {
          const response = await fetchData(`payments/verify/custom?session_id=${session_id}`, token);
          const data = await response;
          console.log(data)
          if (!data.paid) {
            setPaymentStatus('Payment successful!');
            // Proceed to create the appointment booking
            await createAppointment(data.payment);
          } else {
            setPaymentStatus('Payment failed or not completed');
          }
        } catch (err) {
          setError('Failed to verify payment');
        }
      };

      verifyPayment();
    }
  }, [session_id, isClient, token]);

  const createAppointment = async (paymentData) => {
    let orderData = null;
    try {
      setSubmitting(true);
      orderData = JSON.parse(sessionStorage.getItem('orderData'));
  
      if (!orderData) {
        throw new Error('No order data found');
      }
  
      const payload = {
        patient: orderData.patient,
        consultant: orderData.consultant,
        date: orderData.date,
        duration: orderData.duration,
        type: orderData.type,
        paymentStatus: 'paid',
        transactionId: paymentData?.transactionId,
        amountPaid: paymentData?.amount,
      };
  
      const res = await postData('consultation-appointments/create/custom', payload, token);

  
      if (res.appointment) {
        const appointmentId = res.appointment._id;

      console.log(res)

        setPaymentStatus('Appointment booked successfully!');
        addToast('Appointment booked successfully!', 'success');
  
        if (orderData?.type === "general") {
          // redirect with the new appointment ID
          router.push(`/admin/available-specialists?appointmentId=${appointmentId}`);
        } else {
          router.push(`/admin/appointments`);
        }
      } else {
        throw new Error('Failed to book the appointment');
      }
    } catch (err) {
      setError('Failed to book the appointment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  

  // if (error) {
  //   return <div className="text-center text-red-600 font-semibold p-4 bg-red-100 border border-red-600 rounded-md">{error}</div>;
  // }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg transform transition-all hover:scale-105">
        <h1 className="text-3xl font-bold text-green-500 text-center mb-4">{paymentStatus}</h1>
        {paymentStatus === 'Payment successful!' && !submitting && (
          <p className="text-lg text-gray-700 text-center mt-2">Your order has been confirmed. Thank you for your payment!</p>
        )}
        {paymentStatus === 'Payment successful!' && submitting && (
          <p className="text-lg text-gray-700 text-center mt-2">Booking your appointment...</p>
        )}
        {paymentStatus === 'Payment failed or not completed' && (
          <p className="text-lg text-gray-700 text-center mt-2">Please try again later or contact support.</p>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessContentPage;
