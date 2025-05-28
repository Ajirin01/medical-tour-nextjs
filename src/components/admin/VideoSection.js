import dynamic from 'next/dynamic';
import Link from 'next/link';
import { RotateCcw } from 'lucide-react';
import { useRef } from 'react';

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
  isSubmitting
}) => {
  const agoraAppId = process.env.NEXT_PUBLIC_VITE_AGORA_API_ID;

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
