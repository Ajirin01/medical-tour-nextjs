'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/context/ToastContext'
import { postData } from '@/utils/api'
import { useUser } from '@/context/UserContext'

export default function ReviewAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { addToast } = useToast()

  const { user } = useUser()

  const token = session?.user?.jwt
  const [appointmentData, setAppointmentData] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const alertSuccess = (msg) => addToast(msg, 'success')
  const alertError = (msg) => addToast(msg, 'error')

  useEffect(() => {
    const data = searchParams.get('data')
    if (data) {
      try {
        setAppointmentData(JSON.parse(data))
      } catch (err) {
        alertError('Invalid appointment data')
      }
    }
  }, [searchParams])

  function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
  
    if (modifier === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
  
    return `${hours}:${minutes}`;
  }
  

  const handleConfirm = async () => {
    if (!appointmentData || !token || !session?.user?.id) return;
  
    setSubmitting(true);
    try {
      const time24 = convertTo24Hour(appointmentData.timeSlot); // "11:00 AM" → "11:00"
      const dateTimeISO = new Date(`${appointmentData.preferredDate}T${time24}:00`);
  
      if (isNaN(dateTimeISO.getTime())) {
        throw new Error('Invalid date format');
      }
  
      const payload = {
        patient: session.user.id,
        consultant: '671651f7c846303fb7704242',
        date: dateTimeISO,
        duration: appointmentData.duration,
        type: 'medicalTourism',
        paymentStatus: 'pending',
      };
  
      await postData('consultation-appointments/create/custom', payload, token);
      alertSuccess('Consultation booked successfully');
      router.push('/medical-tourism/book/thank-you');
    } catch (err) {
      console.error(err);
      alertError('Something went wrong while booking');
    } finally {
      setSubmitting(false);
    }
  };
  
  

  if (!appointmentData) {
    return <div className="p-6">Loading appointment details...</div>
  }

  return (
    <div className="min-h-screen py-16 px-6 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-8 shadow rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Review Your Appointment
        </h2>
        <div className="space-y-4 text-gray-700">
          <p><strong>Name:</strong> {appointmentData.name}</p>
          <p><strong>Email:</strong> {appointmentData.email}</p>
          <p><strong>Phone:</strong> {appointmentData.phone}</p>
          <p><strong>Date:</strong> {appointmentData.preferredDate}</p>
          <p><strong>Time Slot:</strong> {appointmentData.timeSlot}</p>
          <p><strong>Duration:</strong> {appointmentData.duration} minutes</p>
          <p><strong>Estimated Cost:</strong> ${appointmentData.cost}</p>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Go Back
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="px-6 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-semibold disabled:opacity-50"
          >
            {submitting ? 'Booking...' : 'Confirm & Book'}
          </button>
        </div>
      </div>
    </div>
  )
}
