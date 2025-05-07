"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { updateData } from "@/utils/api";
import { useSession } from "next-auth/react";
import Link from "next/link";
import dynamic from 'next/dynamic';

// import Lottie from "lottie-react";
import emptyAnimation from "@/assets/lottie/empty-state.json"; // Replace with your file

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });


export default function OnlineSpecialistsList({ appointmentId }) {
  const { data: session } = useSession();
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
  const token = session?.user?.jwt;

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, { transports: ["websocket"] });

    // Emit to get online specialists when socket connects
    socket.emit("get-online-specialists");

    // Listen for updates from the server
    socket.on("update-specialists", (data) => {
      console.log("🧑‍⚕️ Online specialists received:", data);
      setSpecialists(data);
    });

    // Cleanup: disconnect socket on component unmount
    return () => {
      socket.off("update-specialists"); // Remove event listener
      socket.disconnect(); // Disconnect the socket connection
    };
  }, []);

  const handleSelect = async (specialist) => {
    if (specialist._id === selectedSpecialistId) return;

    setSelectedSpecialistId(specialist._id);

    try {
      await updateData(
        `consultation-appointments/update/custom/${appointmentId}`,
        { consultant: specialist._id },
        token
      );

      console.log("✅ Appointment updated with:", specialist.firstName);
    } catch (err) {
      console.error("❌ Failed to update appointment:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Online Specialists</h3>
      {specialists.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center text-gray-500 space-y-4 py-12">
          <div className="w-48 h-48">
            <Lottie animationData={emptyAnimation} loop />
          </div>
          <p className="text-lg font-medium">No specialists are online right now</p>
          <p className="text-sm text-gray-400">Please check back later or refresh the page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {specialists.map((sp) => (
            <Link
              key={sp._id}
              href={`/admin/available-specialists/${sp._id}?appointmentId=${appointmentId}`}
              onClick={() => handleSelect(sp)}
              className={`block cursor-pointer p-4 rounded-xl border ${
                selectedSpecialistId === sp._id
                  ? "bg-blue-100 border-blue-500"
                  : "hover:bg-gray-100"
              }`}
            >
              {/* Specialist Card */}
              <div className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-white">
                    {sp.profileImage ? (
                        <img
                        src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}${sp.profileImage}`}
                        alt={`${sp.firstName} ${sp.lastName}`}
                        className="w-full h-full object-cover rounded-full"
                        />
                    ) : (
                        `${sp.firstName[0]}${sp.lastName[0]}`
                    )}
                </div>

                <div className="text-lg font-semibold">{sp.firstName} {sp.lastName}</div>
                <div className="text-sm text-gray-600">{sp.specialty}</div>
                <div className="text-xs text-gray-500">
                  {sp.experience} yrs • {sp.languages?.join(", ")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
  
}
