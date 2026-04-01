import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RotateCcw, Star } from 'lucide-react';
import useSessionSocket from "@/hooks/useSessionSocket";
import { getSocket } from "@/lib/socket";
import { useState, useRef, useEffect } from 'react';
import ConfirmationDialog from "@/components/ConfirmationDialog";

const AgoraVideoChat = dynamic(() => import('@/components/AgoraVideoChat'), { ssr: false });

const VideoSection = ({
  appointment,
  session,
  sessionEnded,
  specialistToken,
  patientToken,
  userRole,
  id,
  videoRef,
  iframeRef,
  iframeUrl,
  handleSessionEnded,
  handleEndUserSession
}) => {
  const agoraAppId = process.env.NEXT_PUBLIC_VITE_AGORA_API_ID;

  const socketRef = useRef();

  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const handleEndSession = () => {
    // emit to backend
    if (socketRef.current) {
      socketRef.current.emit("end-session", { sessionId: session.id });
    }

    setShowConfirmEnd(false);
    handleSessionEnded(); // optionally call this directly
  };


  useEffect(() => {
    socketRef.current = getSocket();
  }, []);
  
  useEffect(() => {
    if (!socketRef.current) return;
  
    socketRef.current.on("session-ended", handleSessionEnded);
  
    return () => {
      socketRef.current.off("session-ended", handleSessionEnded);
    };
  }, [handleSessionEnded]);

  const handleRequestEndSession = () => {
    if (userRole === "specialist" || userRole === "consultant") {
      if (socketRef.current) {
        socketRef.current.emit("request-patient-end-session", {
          appointmentId: appointment.session.appointment._id
        });
      }
    } else {
      setShowConfirmEnd(true);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "requestEndCallConfirmation") {
        handleRequestEndSession();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [userRole, appointment]);
  

  if (appointment.session.appointment.status === "pending" && !sessionEnded) {
    return (
      <div className="relative z-99999 w-full h-[100vh] rounded-xl overflow-hidden shadow-lg">
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="Consultation Video Chat"
          className="w-full h-full"
          allow="camera; microphone; fullscreen; speaker; display-capture"
        />

        <ConfirmationDialog
          isOpen={showConfirmEnd}
          onClose={() => setShowConfirmEnd(false)}
          onConfirm={handleEndUserSession}
          title={userRole === "user" ? "Doctor Requested to End Session" : "End Session?"}
          message={userRole === "user" ? "The doctor has requested to end the session. Please confirm to proceed, as this action cannot be undone." : "Are you sure you want to end this consultation session? This action cannot be undone."}
          confirmText="Yes, End Session"
          cancelText="Cancel"
          requireIndemnity={userRole === "user"}
          indemnityMessage="I agree for this session to be ended and understand that this action cannot be undone."
        />

      </div>
    );
  }

  return null;
};

export default VideoSection;
