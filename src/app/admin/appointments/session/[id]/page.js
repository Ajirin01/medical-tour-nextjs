"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchData, updateData } from "@/utils/api";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";


const SessionPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const videoUrl = `https://nodejs-video-chat.onrender.com/?room=${id}`;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [remainingTime, setRemainingTime] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [showQuestions, setShowQuestions] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);

  const [healthQuestions, setHealthQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [sessionEnded, setSessionEnded] = useState(false);
  const [endingSession, setEndingSession] = useState(false);


  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userRole = session?.user?.role;

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

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("call-rejected", ({ appointmentId, specialistId }) => {
      alert("The specialist rejected your consultation. Please choose another available specialist.");
      router.push(`/admin/appointments/select-specialist/${appointmentId}`);
    });

    socket.on("session-ended", ({ appointmentId }) => {
      if (appointment?._id === appointmentId) {
        setSessionEnded(true);
        setIsTimerRunning(false);
        window.location.href = `/admin/appointments/select-specialist/${appointmentId}`
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (!appointment || !appointment.duration) return;
  
    const sessionKey = `sessionStartTime-${appointment._id}`;

    // If the appointment is completed, no need to run the timer
    if (appointment.status === "completed") {
      localStorage.removeItem(sessionKey);
      setSessionEnded(true);
      setIsTimerRunning(false);
      return;
    }

    let startTime = localStorage.getItem(sessionKey);

    startTime = parseInt(localStorage.getItem(sessionKey), 10);

    
    // If session start time is missing or invalid (0) and appointment is pending, reset it
    if (!startTime || startTime === 0) {
      if (appointment.status === "pending") {
        startTime = Date.now();
        localStorage.setItem(sessionKey, startTime);
      }
    }
  
    const sessionStartTime = parseInt(startTime, 10);
    const sessionDurationMs = appointment.duration * 60 * 1000;

    const sessionEndTime = sessionStartTime + sessionDurationMs;

  
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, sessionEndTime - now);
      setRemainingTime(Math.ceil(diff / 1000));
  
      if (diff <= 0) {
        setIsTimerRunning(false);
        setSessionEnded(true);
        clearInterval(timerId);
      }
    };
  
    setIsTimerRunning(true);

    const timerId = setInterval(updateTimer, 1000);
    updateTimer(); // immediately update the timer
  
    return () => clearInterval(timerId);
  }, [appointment]);
  

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

  const handleEndSession = async () => {
    if (!appointment?._id || !token) return;
  
    try {
      setEndingSession(true);
  
      // Emit event to notify patient the session ended
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        transports: ["websocket"],
      });
      socket.emit("session-ended", { appointmentId: appointment._id });
  
      // Update appointment status
      await updateData(`consultation-appointments/update/custom/${appointment._id}`, {status: "completed"}, token)
  
      setSessionEnded(true);
      setIsTimerRunning(false);
    } catch (err) {
      console.error("Failed to end session", err);
    } finally {
      const sessionKey = `sessionStartTime-${appointment._id}`;
      localStorage.removeItem(sessionKey);
      setSessionEnded(true);
      setIsTimerRunning(false);
      setEndingSession(false);
    }
  };
  

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading session...</div>;
  }

  if (!appointment) {
    return <div className="text-center mt-10 text-red-500">Appointment not found</div>;
  }

  const patient = appointment.patient;


  // Conditionally render based on appointment status
  const renderVideoSection = () => {
    if (appointment.status === "pending" && !sessionEnded) {
      return (
        <div className="relative w-full h-[80vh] rounded-xl overflow-hidden shadow-lg border border-gray-300">
          <iframe
            src={videoUrl}
            title="Consultation Video Chat"
            className="w-full h-full"
            allow="camera; microphone; fullscreen; speaker; display-capture"
          />
        </div>
      );
    }

    if ((appointment.status === "completed" || sessionEnded) && session?.user?.role === "user") {
      return (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Session Ended</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thank you for attending the consultation. Please take a moment to rate your experience or book a follow-up session.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
              Rate Session
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Retake Session
            </button>
          </div>
        </div>
      );
    }
    
    if((appointment.status === "completed" || sessionEnded) && (session?.user?.role === "specialist" || session?.user?.role === "consultant")){
      return (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Session Ended</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thank you for attending the consultation.
          </p>
        </div>
      );
    }

    return null; // Default case, if none of the above conditions match
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-300 mb-2">
        Consultation Video Session
      </h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
        Patient: {(patient?.firstName + " " + patient?.lastName) || "Unknown"} | Date: {new Date(appointment.date).toLocaleString()}
      </p>
  
      {isTimerRunning && remainingTime !== null && (
        <p className="text-center text-3xl font-bold text-red-600 mb-4">
          Time Remaining: {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
        </p>
      )}
  
      {renderVideoSection()}
  
      {((userRole === "specialist" || userRole === "consultant") && appointment.status === "pending") && !sessionEnded ? (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleEndSession}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            disabled={endingSession}
          >
            {endingSession ? "Ending..." : "End Session"}
          </button>
        </div>
      ) : null}
  
      {/* Other buttons for specialists/consultants */}
      { (((userRole === "specialist" || userRole === "consultant") && appointment.status === "pending") && !sessionEnded) && 
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleOpenQuestions}
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${userRole !== 'specialist' && userRole !== 'consultant' ? 'hidden' : ''}`}
            disabled={userRole !== 'specialist' && userRole !== 'consultant'}
          >
            Patient Questions
          </button>
          <button
            onClick={() => setShowDocs(true)}
            className={`bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 ${userRole !== 'specialist' && userRole !== 'consultant' ? 'hidden' : ''}`}
            disabled={userRole !== 'specialist' && userRole !== 'consultant'}
          >
            Documentation
          </button>
          <button
            onClick={() => setShowPrescriptions(true)}
            className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${userRole !== 'specialist' && userRole !== 'consultant' ? 'hidden' : ''}`}
            disabled={userRole !== 'specialist' && userRole !== 'consultant'}
          >
            Prescriptions
          </button>
        </div>
      }
  
      {/* Dialogs for questions, docs, and prescriptions */}
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
                            <span className={value ? "text-green-600 font-semibold" : "text-gray-500"}>
                              {value ? "Yes" : "No"}
                            </span>
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
