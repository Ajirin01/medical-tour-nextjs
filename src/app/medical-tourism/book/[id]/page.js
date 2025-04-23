'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import 'react-calendar/dist/Calendar.css'
import { fetchData } from '@/utils/api'
import { useUser } from '@/context/UserContext'
import { useSession } from "next-auth/react";

const Calendar = dynamic(() => import('react-calendar'), { ssr: false })

export default function ConsultationBookingPage() {
  const router = useRouter()
  const { id: packageId } = useParams()
  const { user, loading } = useUser()

  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [calculatedCost, setCalculatedCost] = useState(0)


  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const COST_PER_MINUTE = 2

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    duration: 30,
  })

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        const res = await fetchData(`availabilities/slots/by?userRole=specialist`, token)
        console.log(res)
        if (Array.isArray(res.data)) {
          setAvailableSlots(res.data)
        }
      } catch (err) {
        console.error('Failed to fetch slots by role:', err)
      }
    }

    if (packageId && token) fetchAvailableSlots()
  }, [packageId, token])

  useEffect(() => {
    setCalculatedCost(formData.duration * COST_PER_MINUTE)
  }, [formData.duration])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}` || '',
        email: user.email || '',
        phone: user.phone || '',
      }))
    }
  }, [user])

  useEffect(() => {
    if (selectedDate) {
      console.log(selectedDate)
      const formattedDate = selectedDate.toISOString().split('T')[0]
      setFormData((prev) => ({ ...prev, preferredDate: formattedDate }))
      setSelectedSlot(null)
    }
  }, [selectedDate])
  

  const slotsForDate = selectedDate
  ? (() => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const localDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );

      // Ensure that the correct day is being selected
      const selectedDayIndex = localDate.getDay();
      const selectedDayName = days[selectedDayIndex];

      const daySlots = availableSlots.filter(slot => slot.dayOfWeek === selectedDayName);

      const generatedSlots = [];
      for (const slot of daySlots) {
        const [startH, startM] = slot.startTime.split(':').map(Number);
        const [endH, endM] = slot.endTime.split(':').map(Number);

        let current = new Date(localDate);
        current.setHours(startH, startM, 0, 0);

        const endDate = new Date(localDate);
        endDate.setHours(endH, endM, 0, 0);

        while (current < endDate) {
          generatedSlots.push(current.toTimeString().slice(0, 5));
          current = new Date(current.getTime() + 30 * 60000);
        }
      }

      return generatedSlots;
    })()
  : [];

  const handleChange = (e) => {
    const { name, value } = e.target
    console.log(value)
    setFormData({ ...formData, [name]: name === 'duration' ? parseInt(value) : value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      ...formData,
      timeSlot: selectedSlot,
      package: packageId,
      cost: calculatedCost,
    }

    router.push(`/medical-tourism/book/review?data=${encodeURIComponent(JSON.stringify(payload))}`)
  }

  if (!packageId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-medium">
        Invalid package. Please go back and try again.
      </div>
    )
  }

  return (
    <div
      className="relative py-24 sm:py-32 min-h-screen"
      style={{
        backgroundImage: "url('/images/Medical-tourism.jpg')",
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-white/90 z-0" />
      <div className="relative z-5 mx-auto max-w-2xl px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-sm font-semibold text-indigo-600">Book a Consultation</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Let's help you get started
          </p>
          <p className="mt-4 text-lg text-gray-600">
            Select a date and time for your consultation.
          </p>
        </div>

        <div className="mb-8">
          {/* <input type='dat'/> */}
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            minDate={new Date()}
            className="rounded-lg shadow"
            
          />

          {selectedDate && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Available Time Slots for {selectedDate.toDateString()}:
              </h3>
              {slotsForDate.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {slotsForDate.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className={`px-4 py-2 rounded-md border ${
                        selectedSlot === slot
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No slots available for this date.</p>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Checking login status...</div>
        ) : !user ? (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            <p className="text-lg text-gray-700 font-medium mb-4">
              Please log in to book a consultation.
            </p>
            <a
              href="/login"
              className="inline-block bg-indigo-600 text-white px-5 py-3 rounded-md font-semibold hover:bg-indigo-700 transition"
            >
              Log In
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                required
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                required
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                required
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (minutes)
              </label>
              <select
                required
                name="duration"
                id="duration"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 block p-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div className="text-sm text-gray-700">
              Estimated Cost:{' '}
              <span className="font-semibold text-gray-900">${calculatedCost}</span>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
