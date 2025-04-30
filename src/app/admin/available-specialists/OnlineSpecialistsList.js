"use client";

import { useEffect, useState } from "react";
import { updateData, fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function OnlineSpecialistsList({ appointmentId }) {
  const { data: session } = useSession();
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);

  const token = session?.user?.jwt;

  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        const data = await fetchData("users/get-all/no-pagination?role=specialist", token);
        const approvedSpecialists = data.filter(
          (sp) => sp.approvalStatus === "approved"
        );
        setSpecialists(approvedSpecialists);
      } catch (err) {
        console.error("❌ Failed to fetch specialists:", err);
      }
    };

    if (token) fetchSpecialists();
  }, [token]);

  const handleSelect = async (specialist) => {
    if (specialist._id === selectedSpecialistId) return;

    setSelectedSpecialistId(specialist._id);

    try {
      await updateData(`consultation-appointments/update/custom/${appointmentId}`, {
        consultant: specialist._id,
      }, token);

      console.log("✅ Appointment updated with:", specialist.firstName);
    } catch (err) {
      console.error("❌ Failed to update appointment:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Available Specialists</h3>
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
            <div className="font-bold">{sp.firstName} {sp.lastName}</div>
            <div className="text-sm text-gray-600">{sp.specialty}</div>
            <div className="text-xs text-gray-500">
              {sp.experience} yrs • {sp.languages?.join(", ")}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
