import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RotateCcw, Star } from 'lucide-react';
import { useRef, useEffect } from 'react';
import useSessionSocket from "@/hooks/useSessionSocket";
import { getSocket } from "@/lib/socket";

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
  showRatingField,
  showRatingForm,
  setShowRatingForm,
  rating,
  setRating,
  comment,
  setComment,
  handleRateSession,
  isSubmitting,
  handleSessionEnded
}) => {
  const agoraAppId = process.env.NEXT_PUBLIC_VITE_AGORA_API_ID;

  const socketRef = useRef();

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
  

  const renderStars = (rating, setRating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= rating;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          className="text-yellow-500 hover:scale-110 transition transform"
          aria-label={`Rate ${i} star${i > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-6 h-6 ${isFilled ? 'fill-yellow-500' : 'fill-none stroke-current'}`}
          />
        </button>
      );
    }
    return stars;
  };
  

  if (appointment.session.appointment.status === "pending" && !sessionEnded) {
    return (
    //   <div className="relative w-full h-[80vh] rounded-xl overflow-hidden shadow-lg border border-gray-300">
    //     <AgoraVideoChat
    //       ref={videoRef}
    //       agoraAppId={agoraAppId}
    //       agoraToken={userRole === "specialist" ? specialistToken : patientToken}
    //       agoraChannelName={id}
    //     />
    //   </div>

    <div className="relative z-99999 w-full h-[100vh] rounded-xl overflow-hidden shadow-lg">
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          title="Consultation Video Chat"
          className="w-full h-full"
          allow="camera; microphone; fullscreen; speaker; display-capture"
        />
      </div>
    );
  }

  if ((appointment.session.appointment.status === "completed" || sessionEnded) && session?.user?.role === "user") {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl text-center transition-all">
          <div className="flex items-center justify-center w-12 h-12 mb-4 bg-yellow-100 rounded-full">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
      
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
            Session Ended
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md">
            Thank you for attending the consultation. Please rate your experience or book a follow-up session.
          </p>
      
          <div className="w-full max-w-lg space-y-6">
            {showRatingField && (
              !showRatingForm ? (
                <button
                  onClick={() => setShowRatingForm(true)}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-lg shadow transition"
                >
                  Rate This Session
                </button>
              ) : (
                <div className="space-y-4 text-left">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Rating:
                  </label>
                  <div className="flex gap-1">
                    {renderStars(rating, setRating)}
                  </div>
      
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Comment:
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="Tell us how it went..."
                      className="mt-1 w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </label>
      
                  <button
                    onClick={handleRateSession}
                    disabled={isSubmitting}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              )
            )}
      
            <Link
              href={`/admin/appointments/retake/${appointment.session.appointment._id}`}
              className="inline-flex justify-center items-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow transition"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Session
            </Link>
          </div>
        </div>
      );
  }

  if ((appointment.session.appointment.status === "completed" || sessionEnded) && (session?.user?.role === "specialist" || session?.user?.role === "consultant")) {
    return (
      <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Session Ended</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Thank you for attending the consultation.
        </p>
      </div>
    );
  }

  return null;
};

export default VideoSection;
