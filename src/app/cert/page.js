'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import Calendar from "react-calendar";
import { CheckCircle, X } from "lucide-react";
import 'react-calendar/dist/Calendar.css';
import { useSelector, useDispatch } from "react-redux";

import { useRouter } from "next/navigation";

import { setPrice} from '@/store/specialistSlice'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

import ConsultationBookingPageContent from "@/components/BookingPage"

export default function CertificatesConsultationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentStep, setCurrentStep] = useState(1);

  const router = useRouter()

  const dispatch = useDispatch()
  

  const certificates = [
    {
      title: "Fitness Certificate",
      description: "Work and Student Sickness Certificate",
      price: "45.99",
      image: "/images/fitness.jpg",
    },
    {
      title: "Visa Medical Certificate",
      description: "Certificate of Good Health / Health Declaration",
      price: "45.99",
      image: "/images/travel.jpg",
    },
    {
      title: "Travel Cancellation Certificate",
      description: "Travel and Holiday Cancellation Certificate",
      price: "45.99",
      image: "/images/travel.jpg",
    },
    {
      title: "Fit to Work Certificate",
      description: "Fit-to-work Certificate",
      price: "45.99",
      image: "/images/work.jpg",
    },
    {
      title: "Travel With Medication Letter",
      description: "Travel With Medication Letter",
      price: "45.99",
      image: "/images/fitness.jpg",
    },
    {
      title: "GP Referral Letter",
      description: "Doctor Referral Letter",
      price: "45.99",
      image: "/images/youth.jpg",
    },
    {
      title: "Youth Camp Certificate",
      description: "Youth Camp or Trip Medical Certificate",
      price: "50.99",
      image: "/images/youth.jpg",
    },
    {
      title: "Fit to Cruise Certificate",
      description: "Fit-to-Cruise Medical Certificate",
      price: "50.99",
      image: "/images/travel.jpg",
    },
  ];

  const openDialog = (cert) => {
    setSelectedCert(cert);
    setIsOpen(true);
    setCurrentStep(1);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedCert(null);
  };

  const steps = [
    "Select a date and time",
    "Enter your details",
    "Confirm and pay",
    "Receive your confirmation"
  ];

  if(!session){
    router.push("/login")
  }

  return (
    <div className="min-h-screen px-6 bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-primary-7)] to-[var(--color-primary-5)] text-white py-20 rounded-b-3xl shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4"
        >
          <h1 className="text-4xl font-bold mb-4">Doctor Letters & Sick Notes</h1>
          <p className="text-lg opacity-90">Same-day letters, sick notes, medical certificates and referral letters</p>
        </motion.div>
      </div>

      {/* Terms */}
      <section className="max-w-4xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow p-6 space-y-5"
        >
          <h2 className="text-2xl font-semibold text-gray-800">Terms & Conditions – Certificates Consultation</h2>
          <ul className="list-disc list-inside space-y-3 text-gray-700 text-sm sm:text-base">
            <li><strong>Doctor’s Discretion:</strong> Certificates are issued after consultation, based on the doctor’s medical judgment. If declined, you’ll be informed.</li>
            <li><strong>No Refund Policy:</strong> If no certificate is issued, no refund applies, as the consultation service was provided.</li>
            <li><strong>Pre-Consultation Confirmation:</strong> Please contact support before booking if unsure your certificate can be issued.</li>
            <li><strong>Independent Medical Judgment:</strong> Doctors make decisions based on professional standards and platform policy.</li>
            <li><strong>Face-to-Face May Be Required:</strong> If necessary for safety, doctors may require in-person consultation.</li>
            <li>By booking, you agree to all the above terms.</li>
          </ul>
        </motion.div>
      </section>

      {/* Certificates */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          transition={{ duration: 0.4 }} 
          className="text-2xl font-bold text-gray-800 mb-8 text-center"
        >
          Available Certificates
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition-shadow flex flex-col"
            >
              <img src={cert.image} alt={cert.title} className="w-full h-40 object-cover rounded-xl mb-4" />
              <h3 className="text-lg font-semibold text-center text-gray-800">{cert.title}</h3>
              <p className="text-sm text-gray-600 text-center">{cert.description}</p>
              <p className="text-lg font-bold text-center text-[var(--color-primary-7)] mt-4">€{cert.price}</p>
              <button
                onClick={() => {openDialog(cert); dispatch(setPrice(cert.price));}}
                className="mt-4 w-full py-2 px-4 bg-[var(--color-primary-6)] text-white rounded-xl hover:bg-[var(--color-primary-7)] transition"
              >
                Book Appointment
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog
        open={isOpen}
        onClose={closeDialog}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
        <div className="relative bg-white max-w-4xl w-full rounded-2xl p-6 flex gap-6 overflow-auto max-h-[90vh] max-w-[90vw]">
            {/* Close button */}
            <button
            onClick={closeDialog}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
            <X size={20} />
            </button>
            {/* Calendar Step */}
            <div className="w-full">
              <ConsultationBookingPageContent isCertPage={true} />
            </div>
        </div>
      </Dialog>

    </div>
  );
}
