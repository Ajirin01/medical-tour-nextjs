"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";

import VideoSection from "@/components/admin/VideoSection";
import RatingForm from "@/components/admin/RatingForm";
import SessionTimer from "@/components/admin/SessionTimer";
import NotesDialog from "@/components/admin/NotesDialog";
import PrescriptionDialog from "@/components/admin/PrescriptionDialog";
import QuestionsDialog from "@/components/admin/QuestionsDialog";

import useAppointment from "@/hooks/useAppointment";
import useSessionSocket from "@/hooks/useSessionSocket";

import { postData, fetchData, updateData } from "@/utils/api";

const SessionPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const videoUrl = `https://videowidget.sozodigicare.com/?room=${id}`

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const userRole = session?.user?.role;
  const { user } = useUser();
  const { addToast } = useToast();

  const { appointment, loading } = useAppointment(id, token);

  const iframeRef = useRef(null);

  const [remainingTime, setRemainingTime] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [sessionEnded, setSessionEnded] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRatingField, setShowRatingField] = useState(false);

  const [sessionNotes, setSessionNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const [prescriptions, setPrescriptions] = useState([]);
  const [savingPrescription, setsavingPrescription] = useState(false);

  const [specialistToken, setSpecialistToken] = useState(null);
  const [patientToken, setPatientToken] = useState(null);

  const [showQuestions, setShowQuestions] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [healthQuestions, setHealthQuestions] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  

  const [newPrescription, setNewPrescription] = useState({ medication: '', dosage: '', frequency: '' });

  const videoRef = useRef();
  const appointmentRef = useRef(appointment);

  useEffect(() => {
    appointmentRef.current = appointment;
  }, [appointment]);

  const handleEndCall = () => {
    if (videoRef.current) {
      videoRef.current.endCall();
    }
  };

  useEffect(()=> {
    if(appointmentRef.current?.session && appointmentRef.current?.session?.appointment?.status === "completed" && !appointmentRef.current?.session?.feedback){
      setShowRatingField(true)
    }
  }, [appointmentRef.current])

  const handleEndSession = async () => {
    const currentAppointment = appointmentRef.current;
    if (!currentAppointment?.session._id || !token) return;
    try {
      setEndingSession(true);
      socketRef.current.emit("session-ended", {
        specialist: user,
        appointmentId: currentAppointment.session.appointment._id
      });
      await updateData(`consultation-appointments/update/custom/${currentAppointment.session.appointment._id}`, { status: "completed" }, token);
      const endTime = new Date().toISOString();
      const startTime = new Date(currentAppointment.session.startTime);
      const durationInMinutes = Math.round((new Date() - startTime) / 60000);
      await updateData(`video-sessions/${currentAppointment.session._id}`, { endTime, durationInMinutes }, token);
    } catch (err) {
      console.error("Failed to end session", err);
    } finally {
      localStorage.removeItem(`sessionStartTime-${currentAppointment.session.appointment._id}`);
      setSessionEnded(true);
      handleEndCall();
      setIsTimerRunning(false);
      setEndingSession(false);
    }
  };

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

  const socketRef = useSessionSocket({
    session,
    appointmentRef,
    setSessionEnded,
    setIsTimerRunning,
    setShowRatingField,
    handleEndSession,
    handleEndCall,
    addToast,
    router
  });

  useEffect(() => {
    const storedSession = localStorage.getItem('activeVideoSession');
    if (storedSession) {
      const sessionData = JSON.parse(storedSession);
      setSpecialistToken(sessionData?.session?.specialistToken || sessionData?.specialistToken);
      setPatientToken(sessionData?.session?.patientToken || sessionData?.patientToken);
    }
  }, []);

  const handleRateSession = async () => {
    const storedSession = localStorage.getItem('activeVideoSession');
    const session = storedSession ? JSON.parse(storedSession) : null;
    setIsSubmitting(true);
    try {
      const payload = {
        session: session._id,
        user: session.user._id,
        rating,
        feedbackText: comment
      };
      await postData('session-feedback', payload, token);
      addToast('Thank you for your feedback!', 'success');
      setShowRatingField(false);
    } catch (err) {
      console.error(err);
      addToast('Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
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

  if (loading) {
    return <div className="text-center mt-10 text-gray-600">Loading session...</div>;
  }

  if (!appointment) {
    return <div className="text-center mt-10 text-red-500">Appointment not found</div>;
  }

  const patient = appointment.session.user;
  const specialist = appointment.session.specialist;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-300 mb-2">Consultation Video Session</h1>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
        {userRole === 'specialist' || userRole === 'consultant'
          ? `Patient: ${patient?.firstName} ${patient?.lastName} | Date: ${new Date(appointment.session.appointment.date).toLocaleString()}`
          : `Consultant: ${specialist?.firstName} ${specialist?.lastName} | Date: ${new Date(appointment.session.appointment.date).toLocaleString()}`}
      </p>


      <SessionTimer
        appointment={appointment}
        setRemainingTime={setRemainingTime}
        setIsTimerRunning={setIsTimerRunning}
        setSessionEnded={setSessionEnded}
        handleEndSession={handleEndSession}
        handleEndCall={handleEndCall}
        addToast={addToast}
      />

      <VideoSection
        appointment={appointment}
        session={session}
        sessionEnded={sessionEnded}
        specialistToken={specialistToken}
        patientToken={patientToken}
        userRole={userRole}
        iframeRef={iframeRef}
        iframeUrl={videoUrl}
        id={id}
        videoRef={videoRef}
        showRatingField={showRatingField}
        showRatingForm={showRatingForm}
        setShowRatingForm={setShowRatingForm}
        rating={rating}
        setRating={setRating}
        comment={comment}
        setComment={setComment}
        handleRateSession={handleRateSession}
        isSubmitting={isSubmitting}

      /> 

      {((userRole === "specialist" || userRole === "consultant") && appointment.session.appointment.status === "pending") && !sessionEnded && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleEndSession}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            disabled={endingSession}
          >
            {endingSession ? "Ending..." : "End Session"}
          </button>
        </div>
      )}
  
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
  

      <NotesDialog
        showDocs={showDocs}
        setShowDocs={setShowDocs}
        sessionNotes={sessionNotes}
        setSessionNotes={setSessionNotes}
        handleSaveNotes={handleSaveNotes}
        savingNotes={savingNotes}
      />

      <PrescriptionDialog
        showPrescriptions={showPrescriptions}
        setShowPrescriptions={setShowPrescriptions}
        prescriptions={prescriptions}
        handleDeletePrescription={handleDeletePrescription}
        newPrescription={newPrescription}
        setNewPrescription={setNewPrescription}
        handleAddPrescription={handleAddPrescription}
        savingPrescription={savingPrescription}
      />

      <QuestionsDialog
        showQuestions={showQuestions}
        setShowQuestions={setShowQuestions}
        healthQuestions={healthQuestions}
        loadingQuestions={loadingQuestions}
      />
    </div>
  );
};

export default SessionPage;
