import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { getSocket } from "@/lib/socket";
import { postData, fetchData, updateData } from "@/utils/api";

export default function useSocketEmitOnline() {
  const { data: session } = useSession();
  const { user } = useUser();
  const socketRef = useRef(null);
  const ringtoneRef = useRef(null);
  const listenerAttached = useRef(false);

  const [showSoundPrompt, setShowSoundPrompt] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  

  const enableSoundNotifications = () => {
    const silentAudio = new Audio("/sounds/silence.mp3");
    silentAudio
      .play()
      .then(() => {
        setSoundEnabled(true);
        localStorage.setItem("soundEnabled", "true");
        localStorage.setItem("soundPromptShown", "true");  // Mark sound prompt as shown
        console.log("🔊 Sound notifications enabled.");
      })
      .catch((err) => {
        console.warn("🔇 Silent audio play failed:", err);
      });
  };

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !session?.user ||
      !["specialist", "consultant"].includes(session.user.role) ||
      !user ||
      !soundEnabled // Prevent socket connection if sound is not enabled yet
    )
      return;

    socketRef.current = getSocket();

    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio("/sounds/ringtone.mp3");
      ringtoneRef.current.loop = true;
      ringtoneRef.current.preload = "auto";
    }

    const emitSpecialistOnline = () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("specialist-online", user);
      }
    };

    socketRef.current.on("connect", () => {
      console.log("✅ Specialist socket connected:", socketRef.current.id);
      setTimeout(emitSpecialistOnline, 500);
    });

    socketRef.current.io.on("reconnect", () => {
      console.log("🔄 Reconnected. Re-emitting specialist-online...");
      emitSpecialistOnline();
    });

    // Clean up any existing listener before adding the new one
    socketRef.current.off("incoming-call");

    socketRef.current.on("incoming-call", ({ appointmentId }) => {
      fetchData(`consultation-appointments/${appointmentId}`)
      .then((appointment) => {
        if (soundEnabled && ringtoneRef.current) {
          ringtoneRef.current.play().catch((err) => {
            console.warn("🔇 Ringtone play error:", err);
          });
        }
  
        if (showSoundPrompt) {
          // If sound prompt is still showing, don't show the confirmation dialog yet
          return;
        }
  
        // Show confirmation dialog for incoming call
        const accept = window.confirm(`Incoming call for Appointment ID: ${appointmentId}. Accept?`);
  
        if (ringtoneRef.current) {
          ringtoneRef.current.pause();
          ringtoneRef.current.currentTime = 0;
        }
  
        if (accept) {
          socketRef.current.emit("accept-call", {
            specialistId: user._id,
            appointmentId,
          });
        
          const payload = {
            appointment: appointmentId,
            specialist: user._id,
            user: appointment.patient, // You should receive this with the incoming call payload
          };
        
          // Create the session via HTTP and handle the result locally
          const token = session?.user?.jwt;
          postData("video-sessions", payload, token).then((res) => {
            if (res.success) {
              const session = res.session;
              const specialistToken = res.session.specialistToken;  // Assuming the server sends back this token
              const patientToken = res.session.patientToken;  // Assuming the server sends back this token
        
              // Store the session and tokens locally for the specialist
              localStorage.setItem("activeVideoSession", JSON.stringify({ session, specialistToken, patientToken }));
        
              // Emit session-created to the patient with tokens
              // console.log("🔑 Tokens before emit:", specialistToken, patientToken); // Should show actual values

              if (specialistToken && patientToken) {
                socketRef.current.emit("session-created", {
                  appointmentId,
                  session,
                  specialistToken,
                  patientToken,
                });
              } else {
                console.warn("⚠️ Tokens not available yet!");
              }
        
              // Navigate to the specialist's session page
              window.location.href = `/admin/appointments/session/${session._id}`;
            } else {
              console.error("❌ Failed to create session:", res.message);
            }
          }).catch((err) => {
            console.error("💥 Error creating session:", err);
          });
        }else {
          socketRef.current.emit("reject-call", {
            specialistId: user._id,
            appointmentId,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch appointment:", error);
        // Optionally show a toast or error message to user
      });
    });

    // Reset the dialog state when the session/user changes or component unmounts
    return () => {
      setShowSoundPrompt(false); // Hide the sound prompt on cleanup
      socketRef.current?.off("incoming-call");
    };
  }, [session, user, soundEnabled, showSoundPrompt]); // watch showSoundPrompt as well

  return {
    showSoundPrompt,
    setShowSoundPrompt,
    enableSoundNotifications,
  };
}
