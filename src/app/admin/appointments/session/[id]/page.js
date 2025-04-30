"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";

const SessionPage = () => {
  const { id } = useParams();
  const videoUrl = `https://nodejs-video-chat.onrender.com/?room=${id}`;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showQuestions, setShowQuestions] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);

  const [healthQuestions, setHealthQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const { data: session } = useSession();
  const token = session?.user?.jwt;

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        const res = await fetchData(`consultation-appointments/get/custom/${id}`, token);
        setAppointment(res);
      } catch (err) {
        console.error("Failed to fetch appointment", err);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) loadAppointment();
  }, [id, token]);

  const loadHealthQuestions = async (userId) => {
    try {
      setLoadingQuestions(true);
      const res = await fetchData(`health-questionnaires/user/${userId}`, token);
      setHealthQuestions(res);
    } catch (err) {
      console.error("Failed to fetch health questions", err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleOpenQuestions = async () => {
    if (appointment?.patient?._id) {
      await loadHealthQuestions(appointment.patient._id);
      setShowQuestions(true);
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading session...</div>;
  }

  if (!appointment) {
    return <div className="text-center mt-10 text-red-500">Appointment not found</div>;
  }

  const patient = appointment.patient;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-300 mb-2">
        Consultation Video Session
      </h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        Patient: {(patient?.firstName + " " + patient?.lastName) || "Unknown"} | Date: {new Date(appointment.date).toLocaleString()}
      </p>

      <div className="relative w-full h-[80vh] rounded-xl overflow-hidden shadow-lg border border-gray-300">
        <iframe
          src={videoUrl}
          title="Consultation Video Chat"
          className="w-full h-full"
          allow="camera; microphone; fullscreen; speaker; display-capture"
        />
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={handleOpenQuestions}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Patient Questions
        </button>
        <button
          onClick={() => setShowDocs(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Documentation
        </button>
        <button
          onClick={() => setShowPrescriptions(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Prescriptions
        </button>
      </div>

      {/* Dialogs */}
      {showQuestions && (
        <Dialog title="Patient Health Questions" onClose={() => setShowQuestions(false)}>
          {loadingQuestions ? (
            <p>Loading health questions...</p>
          ) : healthQuestions ? (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto">
              {Object.entries(healthQuestions).map(([sectionKey, sectionValue]) => {
                if (typeof sectionValue === "object" && sectionValue !== null) {
                  return (
                    <div key={sectionKey}>
                      <h3 className="text-lg font-bold capitalize text-blue-800 dark:text-blue-300">
                        {sectionKey.replace(/([A-Z])/g, ' $1')}
                      </h3>
                      <ul className="list-disc ml-5 text-sm text-gray-700 dark:text-gray-300">
                        {Object.entries(sectionValue).map(([key, value]) => (
                          <li key={key}>
                            {key.replace(/([A-Z])/g, ' $1')}:{" "}
                            <span className={value ? "text-green-600 font-semibold" : "text-gray-500"}>{value ? "Yes" : "No"}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <p>No health questions found for this patient.</p>
          )}
        </Dialog>
      )}

      {showDocs && (
        <Dialog title="Consultation Documentation" onClose={() => setShowDocs(false)}>
          <textarea className="w-full h-32 p-2 border rounded" placeholder="Enter notes here..." />
          <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Save Notes
          </button>
        </Dialog>
      )}

      {showPrescriptions && (
        <Dialog title="Prescriptions" onClose={() => setShowPrescriptions(false)}>
          <input className="w-full mb-2 p-2 border rounded" placeholder="Medication" />
          <input className="w-full mb-2 p-2 border rounded" placeholder="Dosage" />
          <input className="w-full mb-2 p-2 border rounded" placeholder="Frequency" />
          <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Add Prescription
          </button>
        </Dialog>
      )}
    </div>
  );
};

const Dialog = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-white">
          ×
        </button>
      </div>
      <div>{children}</div>
    </div>
  </div>
);

export default SessionPage;
