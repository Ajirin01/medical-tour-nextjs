"use client";

import { useEffect, useState } from "react";
import { fetchData } from "@/utils/api";
import { useSearchParams, useRouter, useParams } from "next/navigation";

export default function StartConsultationPage() {
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const { id: specialistId } = params;
  const appointmentId = searchParams.get("appointmentId"); // passed via ?appointmentId=...

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

  if (loading) return <div>Loading...</div>;
  if (!specialist) return <div>Specialist not found</div>;

  const handleStartCall = () => {
    if (appointmentId) {
      router.push(`/admin/appointments/session/${appointmentId}`);
    } else {
      alert("No appointment ID provided.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Consultation With</h2>

      <div className="border p-4 rounded-lg bg-gray-50">
        <div className="text-xl font-semibold">{specialist.firstName} {specialist.lastName}</div>
        <div className="text-sm text-gray-600">{specialist.specialty}</div>
        <div className="text-sm text-gray-500">Experience: {specialist.experience} years</div>
        <div className="text-sm text-gray-500">Languages: {specialist.languages?.join(", ")}</div>
      </div>

      <button
        onClick={handleStartCall}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Start Call Session
      </button>
    </div>
  );
}
