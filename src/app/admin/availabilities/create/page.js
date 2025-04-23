"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";
import { postData, fetchData } from "@/utils/api";
import Link from "next/link";

const CreateConsultantAvailabilityPage = () => {
  const [form, setForm] = useState({
    consultant: "",
    type: "recurring", // default type
    dayOfWeek: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const [startHour, startMinute] = form.startTime.split(":").map(Number);
    const [endHour, endMinute] = form.endTime.split(":").map(Number);
  
    const start = new Date();
    start.setHours(startHour, startMinute, 0, 0);
  
    const end = new Date();
    end.setHours(endHour, endMinute, 0, 0);
  
    const diffMs = end - start;
    const diffMins = diffMs / (1000 * 60);
  
    if (diffMins < 10) {
      addToast(
        diffMins < 0
          ? "End time must be after start time."
          : "Availability duration must be at least 10 minutes.",
        "error"
      );
      return;
    }
  
    // Prepare payload
    const payload = {
      user: session?.user?.id,
      type: form.type,
      startTime: form.startTime,
      endTime: form.endTime,
      ...(form.type === "recurring"
        ? { dayOfWeek: form.dayOfWeek }
        : { date: form.date }),
    };
  
    try {
      await postData("availabilities/create/custom", payload, token);
      addToast("Availability created successfully!", "success");
      router.push("/admin/availabilities");
    } catch (error) {
      console.error(error);
      addToast(error.message, "error");
    }
  };
  

  return (
    <div className="max-w-xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 shadow">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Set Consultant Availability</h1>
        <Link
          href="/admin/medical-tourism/consultations/availability"
          className="text-indigo-600 hover:underline"
        >
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Selector */}
        <div>
          <label className="block font-medium mb-1">Availability Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="recurring">Recurring (weekly)</option>
            <option value="one-time">One-Time</option>
          </select>
        </div>

        {/* Day of Week or Date */}
        {form.type === "recurring" ? (
          <div>
            <label className="block font-medium mb-1">Day of the Week</label>
            <select
              name="dayOfWeek"
              value={form.dayOfWeek}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">Select Day</option>
              {[
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
            />
          </div>
        )}

        {/* Time Range */}
        <div>
          <label className="block font-medium mb-1">Start Time</label>
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">End Time</label>
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded text-gray-600 dark:bg-gray-900 dark:text-gray-300"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded hover:bg-indigo-700 transition"
        >
          Create Availability
        </button>
      </form>
    </div>
  );
};

export default CreateConsultantAvailabilityPage;
