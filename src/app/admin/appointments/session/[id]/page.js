"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { fetchData, updateData, postData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

import { useToast } from "@/context/ToastContext";

import { RotateCcw } from "lucide-react";
import Link from "next/link";


const SessionPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const videoUrl = `https://videowidget.sozodigicare.com/?room=${id}`;

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

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingField, setShowRatingField] = useState(false)

  const [activeVideoSession, setActiveVideoSession] = useState(null)

  const [sessionNotes, setSessionNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [prescriptions, setPrescriptions] = useState([]);
  const [savingPrescription, setsavingPrescription] = useState(false);

  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
  });

  const { addToast } = useToast()

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userRole = session?.user?.role;

  const { user } = useUser()

  const socketRef = useRef();

  const iframeRef = useRef(null);

  const sendCommandToIframe = (type) => {
    console.log("starting video")
    iframeRef.current?.contentWindow?.postMessage({ type }, "*");
  };

  const handleRateSession = async () => {
    const storedSession = localStorage.getItem('activeVideoSession');
    const session = storedSession ? JSON.parse(storedSession) : null;


    setIsSubmitting(true);
    try {
      const payload = {
        session: session._id,
        user: session.user._id,
        rating,
        feedbackText: comment,
      };
      const res = await postData('session-feedback', payload, token);
      addToast('Thank you for your feedback!', 'success');
      setShowRatingField(false);
    } catch (err) {
      console.error(err);
      addToast('Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect( () => {
    const activeVideoSession = localStorage.getItem('activeVideoSession');
    if(activeVideoSession) setActiveVideoSession(activeVideoSession)
  } )

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (appointment?.status === "pending" && !sessionEnded) {
        socketRef.current.emit("session-ended", { appointmentId: appointment.session.appointment._id, specialist: session.user });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [appointment, sessionEnded]);

  // load documentation when dialog is opened
  useEffect(() => {
    const fetchDocumentation = async () => {
      if (!appointmentRef.current?.session?._id || !token) return;
  
      try {
        setSessionNotes("loading...");
        const response = await fetchData(
          `video-sessions/${appointmentRef.current.session._id}`,
          token
        );
        // console.log(response.success && response.session)
        if (response.success && response.session) {
          setSessionNotes(response.session.sessionNotes || '');
        } else {
          setSessionNotes('');
        }
      } catch (error) {
        console.error('Failed to fetch documentation:', error);
        setSessionNotes('');
      }
    };
  
    if (showDocs) {
      fetchDocumentation();
    }
  }, [showDocs]);
  

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });
  
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadAppointment = async () => {
      try {
        const res = await fetchData(`video-sessions/${id}`, token);
        console.log(res);
  
        // Check if the appointment status is 'pending' before updating
        if (res && res.session && res.session.appointment.status === "pending") {
          await updateData(`video-sessions/${id}`, { startTime: new Date().toISOString() }, token);
        }
  
        // Set the appointment data in state
        setAppointment(res);
      } catch (err) {
        console.error("Failed to fetch appointment", err);
      } finally {
        setLoading(false);
      }
    };
  
    if (id && token) {
      loadAppointment();
    }
  }, [id, token]);

  useEffect(() => {
    // const specialistId = appointment.session.appointment.consultant
    socketRef.current.on("call-rejected", ({ appointmentId, specialistId }) => {
      console.log("call-rejected event received", appointmentId, specialistId);
      alert("The specialist rejected your consultation. Please choose another available specialist.");
      router.push(`/admin/available-specialists?appointmentId=${appointmentId}`);
    });

    socketRef.current.on("call-timeout", ({ appointmentId, specialistId }) => {
      alert("Call timed out. The specialist did not respond.");
      router.push(`/admin/available-specialists?appointmentId=${appointmentId}`);
    });
    
    socketRef.current.on("specialist-disconnected", ({ appointmentId, specialistId }) => {
      alert("The specialist disconnected unexpectedly. Please try another.");
      router.push(`/admin/available-specialists?appointmentId=${appointmentId}`);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const appointmentRef = useRef(appointment);

  useEffect(() => {
    appointmentRef.current = appointment;
  }, [appointment]);

  useEffect(()=> {
    if(appointmentRef.current?.session && appointmentRef.current?.session?.appointment?.status === "completed" && !appointmentRef.current?.session?.feedback){
      setShowRatingField(true)
    }
  }, [])

  useEffect(() => {
    const socket = socketRef.current;
  
    const handleSessionEnded = ({ specialist, appointmentId }) => {
      const currentAppointment = appointmentRef.current;
      if ((currentAppointment?.session?.appointment?._id === appointmentId) && (currentAppointment?.session?.appointment?.patient?._id === session?.user?.id)) {
        setSessionEnded(true);
        setIsTimerRunning(false);
        setShowRatingField(true)
        handleEndSession();
        addToast("Specialist ended the session", "info", 5000)
      }
    };
  
    socket.on("session-ended", handleSessionEnded);
  
    // Cleanup listener on unmount
    return () => {
      socket.off("session-ended", handleSessionEnded);
    };
  }, []);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!appointmentRef.current?.session?._id || !token) return;
  
      try {
        const response = await fetchData(
          `video-sessions/${appointmentRef.current.session._id}`,
          token
        );
        if (response.success && response.session) {
          setPrescriptions(response.session.prescriptions || []);
        } else {
          setPrescriptions([]);
        }
      } catch (error) {
        console.error('Failed to fetch prescriptions:', error);
        setPrescriptions([]);
      }
    };
  
    if (showPrescriptions) {
      fetchPrescriptions();
    }
  }, [showPrescriptions]);
  
  

  // timer logic
  useEffect(() => {
    if (!appointment || !appointment.session.appointment.duration) return;
  
    const sessionKey = `sessionStartTime-${appointment.session.appointment._id}`;
  
    // Handle if appointment is already completed
    if (appointment.session.appointment.status === "completed") {
      localStorage.removeItem(sessionKey);
      setSessionEnded(true);
      setIsTimerRunning(false);
      return;
    }
  
    let startTime = parseInt(localStorage.getItem(sessionKey), 10);
  
    if ((!startTime || isNaN(startTime)) && appointment.session.appointment.status === "pending") {
      startTime = Date.now();
      localStorage.setItem(sessionKey, startTime);
    }
  
    const sessionStartTime = parseInt(startTime, 10) + 2 * 60 * 1000; //2 mininus extra added for prep and all
    const sessionDurationMs = appointment.session.appointment.duration * 60 * 1000;
    const sessionEndTime = sessionStartTime + sessionDurationMs;
  
    let notified = {
      70: false,
      80: false,
      90: false,
      95: false,
    };
  
    const updateTimer = () => {
      const now = Date.now();
      const elapsedTimeMs = now - sessionStartTime; // Time that has already passed in milliseconds
      const elapsedPercentage = (elapsedTimeMs / sessionDurationMs) * 100; // Calculate the percentage of elapsed time
  
      // Calculate the remaining time
      const remainingTimeMs = Math.max(0, sessionEndTime - now);
      const remainingSeconds = Math.ceil(remainingTimeMs / 1000);
      setRemainingTime(remainingSeconds);

      const remainingMinutes = Math.ceil(remainingSeconds / 60);
  
      // Check the elapsed time percentage and show toast if needed
      if (elapsedPercentage >= 70 && !notified[70]) {
        notified[70] = true;
        addToast(`Only ${remainingMinutes} minute(s) left in your session`, 'error', 10000);
      } else if (elapsedPercentage >= 80 && !notified[80]) {
        notified[80] = true;
        addToast(`Only ${remainingMinutes} minute(s) left in your session`, 'error', 10000);
      } else if (elapsedPercentage >= 90 && !notified[90]) {
        notified[90] = true;
        addToast(`Only ${remainingMinutes} minute(s) left in your session`, 'error', 10000);
      } else if (elapsedPercentage >= 95 && !notified[95]) {
        notified[95] = true;
        addToast(`Only ${remainingMinutes} minute(s) left in your session`, 'error', 10000);
      }
  
      // If the session time is up, stop the timer and handle end session
      if (remainingTimeMs <= 0) {
        setIsTimerRunning(false);
        setSessionEnded(true);
        clearInterval(timerId);
        handleEndSession();
      }
    };
  
    setIsTimerRunning(true);
  
    const timerId = setInterval(updateTimer, 1000);
    updateTimer(); // Run immediately
  
    return () => clearInterval(timerId); // Clean up on component unmount
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
    // console.log("Question clicked", appointment.session)
    if (appointment.session.appointment.patient) {
      await loadHealthQuestions(appointment.session.appointment.patient);
      setShowQuestions(true);
    }
  };

  const handleEndSession = async () => {
    const currentAppointment = appointmentRef.current;
    if (!currentAppointment?.session._id || !token) return;
    try {
      setEndingSession(true);
      socketRef.current.emit("session-ended", { 
        specialist: user,
        appointmentId: currentAppointment.session.appointment._id,
      });
  
      // Update appointment status
      await updateData(`consultation-appointments/update/custom/${currentAppointment.session.appointment._id}`, {status: "completed"}, token)
      
      const endTime = new Date().toISOString();
      const startTime = new Date(currentAppointment.session.startTime);
      const durationInMinutes = Math.round((new Date() - startTime) / 60000);

      await updateData(
        `video-sessions/${currentAppointment.session._id}`,
        {
          endTime,
          durationInMinutes
        },
        token
      );

      setSessionEnded(true);
      setIsTimerRunning(false);
    } catch (err) {
      console.error("Failed to end session", err);
    } finally {
      const sessionKey = `sessionStartTime-${currentAppointment.session.appointment._id}`;
      localStorage.removeItem(sessionKey);
      setSessionEnded(true);
      setIsTimerRunning(false);
      setEndingSession(false);
    }
  };

  const handleSaveNotes = async () => {
    const currentAppointment = appointmentRef.current;
    if (!currentAppointment?.session?._id || !token) return;
  
    try {
      setSavingNotes(true);
      await updateData(
        `video-sessions/${currentAppointment.session._id}`,
        { sessionNotes },
        token
      );
      addToast("Notes saved successfully!", "success");
      setShowDocs(false);
    } catch (err) {
      console.error("Failed to save notes", err);
      addToast("Failed to save notes.", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddPrescription = async () => {
    setsavingPrescription(true)
    if (
      !newPrescription.medication ||
      !newPrescription.dosage ||
      !newPrescription.frequency
    ) {
      alert('Please fill all fields');
      return;
    }
  
    const updatedPrescriptions = [...prescriptions, newPrescription];

    // console.log(updatedPrescriptions)
  
    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { prescriptions: updatedPrescriptions },
        token
      );
      setPrescriptions(updatedPrescriptions);
      setNewPrescription({ medication: '', dosage: '', frequency: '' });
    } catch (error) {
      console.error('Failed to add prescription:', error);
    }finally{
      setsavingPrescription(false)
    }
  };
  
  const handleDeletePrescription = async (index) => {
    const updatedPrescriptions = prescriptions.filter((_, i) => i !== index);
  
    try {
      await updateData(
        `video-sessions/${appointmentRef.current.session._id}`,
        { prescriptions: updatedPrescriptions },
        token
      );
      setPrescriptions(updatedPrescriptions);
    } catch (error) {
      console.error('Failed to delete prescription:', error);
    }
  };
  

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading session...</div>;
  }

  if (!appointment) {
    return <div className="text-center mt-10 text-red-500">Appointment not found</div>;
  }

  const patient = appointment.session.user;
  const specialist = appointment.session.specialist;


  // Conditionally render based on appointment status
  const renderVideoSection = () => {
    if (appointment.session.appointment.status === "pending" && !sessionEnded) {
      return (
        <div className="relative w-full h-[80vh] rounded-xl overflow-hidden shadow-lg border border-gray-300">
          <iframe
            ref={iframeRef}
            src={videoUrl}
            title="Consultation Video Chat"
            className="w-full h-full"
            allow="camera; microphone; fullscreen; speaker; display-capture"
            onLoad={() => {
              sendCommandToIframe("START_CALL");
            }}
          />
        </div>
      );
    }

    if ((appointment.session.appointment.status === "completed" || sessionEnded) && session?.user?.role === "user") {
      return (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Session Ended</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thank you for attending the consultation. Please take a moment to rate your experience or book a follow-up session.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            {showRatingField && (
              !showRatingForm ? (
                <button
                  onClick={() => setShowRatingForm(true)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Rate Session
                </button>
              ) : (
                <div className="w-full max-w-md space-y-4 text-left">
                  <label className="block text-sm text-gray-700 dark:text-gray-300">
                    Rating (1 to 5):
                    <input
                      type="number"
                      value={rating}
                      min={1}
                      max={5}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 rounded border border-gray-300 dark:bg-gray-700 dark:text-white"
                    />
                  </label>
                  <label className="block text-sm text-gray-700 dark:text-gray-300">
                    Comment:
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded border border-gray-300 dark:bg-gray-700 dark:text-white"
                    />
                  </label>
                  <button
                    onClick={handleRateSession}
                    disabled={isSubmitting}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              )
            )}

            <Link
              href={`/admin/appointments/retake/${appointment.session.appointment._id}`}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4 text-white" />
              Retake Session
            </Link>
          </div>

        </div>
      );
    }
    
    if((appointment.session.appointment.status === "completed" || sessionEnded) && (session?.user?.role === "specialist" || session?.user?.role === "consultant")){
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
      { session?.user?.role === "specialist" || session?.user?.role === "consultant" ? (  
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          Patient: {(patient?.firstName + " " + patient?.lastName) || "Unknown"} | Date: {new Date(appointment.session.appointment.date).toLocaleString()}
        </p>
      ) : (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          Consultant: {(specialist?.firstName + " " + specialist?.lastName) || "Unknown"} | Date: {new Date(appointment.session.appointment.date).toLocaleString()}
        </p>
      )}
  
      {isTimerRunning && remainingTime !== null && (
        <p className="text-center text-3xl font-bold text-red-600 mb-4">
          Time Remaining: {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
        </p>
      )}
  
      {renderVideoSection()}
  
      {((userRole === "specialist" || userRole === "consultant") && appointment.session.appointment.status === "pending") && !sessionEnded ? (
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
      { (((userRole === "specialist" || userRole === "consultant") && appointment.session.appointment.status === "pending") && !sessionEnded) && 
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
  
      {/* notes */}
      {showDocs && (
        <Dialog title="Consultation Documentation" onClose={() => setShowDocs(false)}>
          <textarea
            className="w-full h-32 p-2 border rounded"
            placeholder="Enter notes here..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
          />
          <button
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            onClick={handleSaveNotes}
            disabled={savingNotes}
          >
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </Dialog>
      )}
  
      {/* prescription */}
      {showPrescriptions && (
        <Dialog title="Prescriptions" onClose={() => setShowPrescriptions(false)}>
          {/* Existing prescriptions */}
          {prescriptions.length > 0 ? (
            <div className="mb-4">
              {prescriptions.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border-b mb-2"
                >
                  <div>
                    <p className="font-semibold">{item.medication}</p>
                    <p className="text-sm text-gray-600">
                      {item.dosage} – {item.frequency}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePrescription(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-4">No prescriptions yet.</p>
          )}

          {/* New prescription form */}
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Medication"
            value={newPrescription.medication}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, medication: e.target.value })
            }
          />
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Dosage"
            value={newPrescription.dosage}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, dosage: e.target.value })
            }
          />
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Frequency"
            value={newPrescription.frequency}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, frequency: e.target.value })
            }
          />
          <button
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={handleAddPrescription}
          >
            {savingPrescription ? 'Adding Prescription...' : 'Add Prescription'}
          </button>
        </Dialog>
      )}

    </div>
  );
};

const Dialog = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-999999 bg-black bg-opacity-50 flex justify-center items-center">
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
