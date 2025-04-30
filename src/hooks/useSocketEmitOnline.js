import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";

let socket;

export default function useSocketEmitOnline() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user || !["specialist", "consultant", "admin"].includes(session.user.role)) return;

    // Initialize socket once
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL); // set in .env
    }

    // Emit once on mount
    socket.emit("specialist-online", session.user); // adjust event name if needed

    // Optionally: disconnect on unmount
    return () => {
      socket.disconnect();
      socket = null;
    };
  }, [session]);
}
