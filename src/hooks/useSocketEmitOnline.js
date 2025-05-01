import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useUser } from "@/context/UserContext";

export default function useSocketEmitOnline() {
  const { data: session } = useSession();
  const socketRef = useRef(null);  // useRef to keep socket instance

  const { user } = useUser();

  useEffect(() => {
    if (!session?.user || !["specialist", "consultant"].includes(session.user.role) || !user) return;

    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        transports: ["websocket"],
      });

      const emitSpecialistOnline = () => {
        if (socketRef.current?.connected) {
          socketRef.current.emit("specialist-online", user);
        //   console.log("✅ Emitted specialist-online:", user);
        } else {
          console.error("❌ Socket not connected, failed to emit specialist-online.");
        }
      };

      socketRef.current.on("connect", () => {
        console.log("✅ Specialist socket connected:", socketRef.current.id);
        setTimeout(emitSpecialistOnline, 500); // slight delay
      });

      socketRef.current.io.on("reconnect", () => {
        console.log("🔄 Reconnected. Re-emitting specialist-online...");
        emitSpecialistOnline();
      });

      // Listen for incoming calls from users
    socketRef.current.on("incoming-call", ({ appointmentId }) => {
        // Alert the specialist with the appointmentId
        const accept = confirm(`Incoming consultation request for Appointment ID: ${appointmentId}. Accept?`);
  
        if (accept) {
          socketRef.current.emit("accept-call", { specialistId: user._id, appointmentId });
          // Navigate to the session page
          window.location.href = (`/admin/appointments/session/${appointmentId}`);
        } else {
          socketRef.current.emit("reject-call", { specialistId: user._id, appointmentId });
        }
      });

      socketRef.current.on("disconnect", () => {
        console.log("🛑 Socket disconnected.");
      });

      socketRef.current.on("error", (err) => {
        console.error("❌ Socket error:", err);
      });
    }

    // Cleanup: disconnect socket when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("🛑 Specialist socket disconnected");
        socketRef.current = null;
      }
    };
  }, [session, user]);
}
