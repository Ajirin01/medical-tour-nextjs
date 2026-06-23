// src/lib/socket.js
import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    const platform = process.env.NEXT_PUBLIC_PLATFORM || "global";
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    console.log("🔌 Attempting socket connection to:", socketUrl);
    socket = io(socketUrl, {
      transports: ["websocket"],
      query: { platform }
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected, joining platform:", platform);
      socket.emit("join-platform", { platform });
    });
  }
  return socket;
}
