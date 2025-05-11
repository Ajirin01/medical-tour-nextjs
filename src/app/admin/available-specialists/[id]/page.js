"use client";

import { useEffect, useState, useRef } from "react";
import { fetchData, postData } from "@/utils/api";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { MapPin, GraduationCap } from "lucide-react";
import io from "socket.io-client";
import ConsultationRequestForm from "@/components/ConsultationRequestForm";
import { useUser } from "@/context/UserContext";
import { useSession } from "next-auth/react";

import dynamic from 'next/dynamic';

const LottieRinger = dynamic(() => import('@/components/LottieRinger'), {
  ssr: false,
});

export default function StartConsultationPage() {
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);  // To track the invitation process
  const [sessionStarted, setSessionStarted] = useState(false); // To track when the session starts
  const [invitationRejected, setInvitationRejected] = useState(false); // To track rejection status

  const [appointment, setAppointment] = useState(null)

  const [busyMessage, setBusyMessage] = useState("");

  const { user } = useUser()

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const socketRef = useRef(null);

  const { id: specialistId } = params;
  const appointmentId = searchParams.get("appointmentId");

  const { data: session } = useSession()
  const token = session?.user?.jwt

  // console.log("Appointment ID:", !JSON.parse(appointmentId))

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredDate: "",
    duration: 0,  // Default duration
  });

  const COST_PER_MINUTE = 2

  useEffect(() => {
    setCalculatedCost(formData.duration * COST_PER_MINUTE)
  }, [formData.duration])

  useEffect( () => {
    if(user) setFormData({
                ...formData,
                name: user.firstName+" "+user.lastName,
                email: user.email,
                phone: user.phone,
              })
  }, [user])
  
  const [submitting, setSubmitting] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState(30); // Base cost for 15 minutes

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

    fetchData(`consultation-appointments/${appointmentId}`)
    .then(( appointment ) => {
      setAppointment(appointment);
    })
    .catch((error) => {
      console.error("Failed to fetch appointment:", error);
      // Optionally show a toast or error message to user
    });

    const socket = socketRef.current;
  
    const handleSpecialistJoined = (data) => {
      if (data.appointmentId === appointmentId) {
        setSessionStarted(true);
    
        socketRef.current.on("session-created", ({ appointmentId, session, specialistToken, patientToken }) => {
          console.log("session-created");
    
          // Store the session and tokens in localStorage for future use
          const sessionData = { ...session, specialistToken, patientToken };
          localStorage.setItem("activeVideoSession", JSON.stringify(sessionData));

          console.log(appointmentId, session, specialistToken, patientToken)
    
          // Redirect to the session page after storing session and tokens
          window.location.href = `/admin/appointments/session/${session._id}`;
        });
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


  useEffect(() => {
    if (!socketRef.current || !appointmentId || !specialistId) return;
    setIsInviting(true);
  
    const socket = socketRef.current;
  
    // Listen for specialist busy
    socket.on("specialist-busy", ({ appointmentId: busyAppointmentId }) => {
      if (busyAppointmentId === appointmentId) {
        setIsInviting(false);
        setSessionStarted(false);
        setInvitationRejected(false);
        setBusyMessage("Specialist is currently on another call. Please wait a moment...");
      }
    });
  
    // Auto-trigger invite if not busy
    socket.emit("invite-specialist-to-call", {
      specialistId,
      appointmentId,
    });
  
    return () => {
      socket.off("specialist-busy");
    };
  }, [appointmentId, specialistId]);
  
  

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

  function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
  
    if (modifier === 'PM' && hours !== '12') {
      hours = parseInt(hours, 10) + 12;
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
  
    return `${hours}:${minutes}`; 
  }

  function convertMillisecondsTo24HourFormat(milliseconds) {
    const date = new Date(milliseconds);  // Create a Date object using the milliseconds
    
    // Extract hours and minutes
    const hours = date.getHours().toString().padStart(2, '0'); // Ensure two digits
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits
  
    // Return in 24-hour format (HH:mm)
    return `${hours}:${minutes}`;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    console.log(formData)
  };

  const handleConfirm = async () => {
    // Get the current date
    const selectedDate = new Date();

    // Get the current time (in milliseconds since epoch)
    const selectedTime = selectedDate.getTime();

    // Add 5 minutes to the current time (5 * 60 * 1000 milliseconds)
    const adjustedTime = selectedTime + 5 * 60 * 1000;

    event.preventDefault()
    if (!token || !session?.user?.id) return;
  
    setSubmitting(true);
    try {
      const appointmentData = {
        ...formData,
        date: selectedDate,
        timeSlot: convertMillisecondsTo24HourFormat(adjustedTime),
        cost: calculatedCost,
        consultMode: "now",
        type: "general"
      }
      
      const time24 = convertTo24Hour(appointmentData.timeSlot); // "11:00 AM" → "11:00"
      const dateTimeISO = new Date(`${appointmentData.date}`);
  
      if (isNaN(dateTimeISO.getTime())) {
        throw new Error('Invalid date format');
      }
  
      const payload = {
        patient: session.user.id,
        consultant: specialist._id,
        date: dateTimeISO,
        duration: appointmentData.duration,
        type: appointmentData.type || 'medicalTourism',
        paymentStatus: 'pending',
        consultMode: appointmentData.consultMode,
      };

      
  
      // Save appointment details to sessionStorage for later use
      sessionStorage.setItem('orderData', JSON.stringify(payload));

      // Initiate payment request to the backend
      const paymentPayload = {
        amount: calculatedCost, // Ensure the cost is in the correct unit (e.g., dollars)
        email: session.user.email,
        productName: `Consultation with ${specialist.firstName}`,
      };

      // console.log(paymentPayload)
      // return

      const paymentRes = await postData('/payments/initiate', paymentPayload, token);

      if (paymentRes?.url) {
        // Redirect to Stripe payment page
        window.location.href = paymentRes.url;
      } else {
        alertError('Failed to initiate payment');
      }
    } catch (err) {
      console.error(err);
      alertError('Something went wrong while booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!specialist) return <div>Specialist not found</div>;
  if(!appointmentId) return (<div>
    <ConsultationRequestForm
      handleSubmit={handleConfirm}
      handleChange={handleChange}
      formData={formData}
      submitting={submitting}
      calculatedCost={calculatedCost}
    />
  </div>);

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
              <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <GraduationCap className="w-3 h-3 mr-1" /> {specialist.specialty}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              {/* <p className="text-sm text-gray-500 dark:text-gray-400">
                {specialist.address.city}, {specialist.address.state}, {specialist.address.country}
              </p> */}
              <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3 mr-1" /> {specialist.address.country}
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

        {(appointment && appointment.status !== "completed") &&
          (invitationRejected || busyMessage) && (
            <button
              onClick={handleStartCall}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-indigo-300 bg-white px-4 py-3 text-sm font-medium text-indigo-700 shadow-theme-xs hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-700 dark:bg-indigo-800 dark:text-white dark:hover:bg-white/[0.03] dark:hover:text-white-200 lg:inline-flex lg:w-auto"
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
              Invite Specialist to session
            </button>
        )}

        {isInviting && !invitationRejected && !busyMessage && <LottieRinger />}


        {busyMessage && (
          <div className="mt-5 text-center text-lg text-orange-500">
            {busyMessage}
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
