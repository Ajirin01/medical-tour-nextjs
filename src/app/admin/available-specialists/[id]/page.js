"use client";

import { useEffect, useState, useRef } from "react";
import { fetchData } from "@/utils/api";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import io from "socket.io-client";

export default function StartConsultationPage() {
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);  // To track the invitation process
  const [sessionStarted, setSessionStarted] = useState(false); // To track when the session starts
  const [invitationRejected, setInvitationRejected] = useState(false); // To track rejection status
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const socketRef = useRef(null);

  const { id: specialistId } = params;
  const appointmentId = searchParams.get("appointmentId");

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ["websocket"],
    });
  
    // setup events...
  
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadSpecialist = async () => {
      try {
        const data = await fetchData(`users/${specialistId}`);
        setSpecialist(data);
      } catch (err) {
        console.error("❌ Failed to fetch specialist:", err);
      } finally {
        setLoading(false);
      }
    };

    if (specialistId) loadSpecialist();
  }, [specialistId]);

  useEffect(() => {
    if (!socketRef.current || !appointmentId) return;
  
    const socket = socketRef.current;
  
    const handleSpecialistJoined = (data) => {
      if (data.appointmentId === appointmentId) {
        setSessionStarted(true);
        router.push(`/admin/appointments/session/${appointmentId}`);
      }
    };
  
    socket.on("call-accepted", handleSpecialistJoined);
  
    socket.on("call-rejected", (data) => {
      if (data.appointmentId === appointmentId) {
        setIsInviting(false);
        setInvitationRejected(true);
        alert("The specialist has rejected the call. Please try again later.");
      }
    });
  
    socket.on("call-timeout", (data) => {
      if (data.appointmentId === appointmentId) {
        setIsInviting(false);
        alert("The call has timed out. Please try again later.");
      }
    });
  
    return () => {
      socket.off("call-accepted", handleSpecialistJoined);
      socket.off("call-rejected");
      socket.off("call-timeout");
    };
  }, [appointmentId, router]);
  

  const handleStartCall = () => {
    if (!appointmentId || !specialist?._id) return alert("Missing info");

    // Set the invitation state to true to show a waiting message
    setIsInviting(true);
    setInvitationRejected(false);  // Reset rejection status when retrying

    const socket = socketRef.current;

    socket.emit("invite-specialist-to-call", {
      specialistId: specialist._id,
      appointmentId,
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!specialist) return <div>Specialist not found</div>;

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-white">
            {specialist.profileImage ? (
              <img
                src={`${process.env.NEXT_PUBLIC_NODE_BASE_URL}${specialist.profileImage}`}
                alt={`${specialist.firstName}`}
                className="w-full h-full object-cover rounded-full"
                width={80}
                height={80}
              />
            ) : (
              `${specialist.firstName[0]}${specialist.lastName[0]}`
            )}
          </div>

          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {specialist.firstName + " " + specialist.lastName}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {specialist.specialty}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {specialist.address.city}, {specialist.address.state}, {specialist.address.country}
              </p>
            </div>
          </div>

          {/* Rating Stars */}
          <div className="flex items-center order-2 gap-1 grow xl:order-3 xl:justify-end">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-5 h-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927a.998.998 0 011.902 0l1.144 3.523a1 1 0 00.95.69h3.688c.969 0 1.371 1.24.588 1.81l-2.986 2.17a1 1 0 00-.364 1.118l1.144 3.523c.3.924-.755 1.688-1.538 1.118l-2.986-2.17a1 1 0 00-1.176 0l-2.986 2.17c-.783.57-1.838-.194-1.538-1.118l1.144-3.523a1 1 0 00-.364-1.118l-2.986-2.17c-.783-.57-.38-1.81.588-1.81h3.688a1 1 000.95-.69l1.144-3.523z" />
              </svg>
            ))}
          </div>
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-full border border-indigo-300 bg-white px-4 py-3 text-sm font-medium text-indigo-700 shadow-theme-xs hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-700 dark:bg-indigo-800 dark:text-white dark:hover:bg-white/[0.03] dark:hover:text-white-200 lg:inline-flex lg:w-auto"
          onClick={handleStartCall}
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1v3.5a1 1 0 01-1 1C11.61 21 3 12.39 3 2.5a1 1 0 011-1H7.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"
              fill="currentColor"
            />
          </svg>
          Call
        </button>

        {isInviting && !invitationRejected && (
          <div className="mt-5 text-center text-lg text-gray-500">
            Inviting the specialist to join the call... Please wait.
          </div>
        )}

        {invitationRejected && (
          <div className="mt-5 text-center text-lg text-red-500">
            The specialist has rejected the call. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
}
