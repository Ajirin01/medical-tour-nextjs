"use client";

import React, { useState } from "react";
import { IoCloseOutline, IoCheckmarkOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import ModalContainer from "@/components/gabriel/ModalContainer";
import {
  CheckoutModal
} from "@/components/gabriel";
// import CheckoutModal and ModalContainer here
// import CheckoutModal from "./CheckoutModal";
// import ModalContainer from "./ModalContainer";
import StripeWrapper from "@/components/StripeWrapper";

const PricingModal = ({ closeModal, setPrice, setDuration, specialist }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);

  const currency = "USD"

  const onSelected = (price, duration) => {
    const numericPrice = parseFloat(price);
    if (!isNaN(numericPrice) && numericPrice > 0) {
      setPrice(numericPrice);
      setDuration(duration);
      setSelectedPrice(numericPrice);
      setSelectedDuration(duration);
      setShowModal(true);
    } else {
      console.error("Invalid price or duration selected");
    }
  };

  const PricingCard = ({ title, price, duration, features, isRecommended }) => (
    <div
      className={`relative bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg ${
        isRecommended ? "ring-2 ring-indigo-400 transform scale-102" : ""
      }`}
    >
      {isRecommended && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            Recommended
          </span>
        </div>
      )}
      <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
      <div className="text-3xl font-extrabold text-indigo-600 mb-4">
        ${price}
        <span className="text-sm font-normal text-gray-500">/mo</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-600">
            <IoCheckmarkOutline
              className="text-green-500 mr-2 flex-shrink-0"
              size={16}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transform hover:scale-105 active:scale-95"
        onClick={() => onSelected(price, duration)}
      >
        Get Started
      </button>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Choose Your Plan
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition duration-300"
              >
                <IoCloseOutline size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <PricingCard
                title="Basic"
                price="20.00"
                duration={900}
                features={[
                  "15-minute consultation",
                  "Basic guidance",
                  "Email summary",
                ]}
              />
              <PricingCard
                title="Pro"
                price="40.00"
                duration={2700}
                features={[
                  "45-minute consultation",
                  "In-depth discussion",
                  "Personalized report",
                  "1 week email support",
                ]}
                isRecommended={true}
              />
              <PricingCard
                title="Enterprise"
                price="70.00"
                duration={3600}
                features={[
                  "60-minute consultation",
                  "Comprehensive analysis",
                  "Detailed action plan",
                  "2 weeks email support",
                  "Follow-up call",
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Show checkout modal if selected */}
      {showModal && selectedPrice && selectedDuration && (
        <ModalContainer
          modal={
            <StripeWrapper>
              <CheckoutModal
                closeModal={closeModal}
                amount={selectedPrice}
                currency={currency}
                specialist={specialist}
                duration={selectedDuration}
              />
            </StripeWrapper>

          }
        />
      )}
    </>
  );
};

export default PricingModal;
