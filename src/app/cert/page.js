'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog } from "@headlessui/react";
import Calendar from "react-calendar";
import { CheckCircle, X } from "lucide-react";
import 'react-calendar/dist/Calendar.css';
import { useSelector, useDispatch } from "react-redux";

import { setPrice} from '@/store/specialistSlice'

import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

import ConsultationBookingPageContent from "@/components/BookingPage"
import CertificateList from "@/components/CertificateList";

export default function CertificatesConsultationPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentStep, setCurrentStep] = useState(1);

  const dispatch = useDispatch()

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
        
        <CertificateList />
      </section>

    </div>
  );
}
