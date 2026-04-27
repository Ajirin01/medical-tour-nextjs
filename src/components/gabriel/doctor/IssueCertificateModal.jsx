"use client";

import React, { useState, useEffect } from "react";
import { postData, fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

const IssueCertificateModal = ({ sessionId, onClose }) => {
  const { data: sessionData } = useSession();
  const [loading, setLoading] = useState(false);
  const [sessionDetails, setSessionDetails] = useState(null);
  
  const [formData, setFormData] = useState({
    diagnosis: "",
    comment: "",
    issueDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const getSessionDetails = async () => {
      try {
        const data = await fetchData(`video-sessions/${sessionId}`);
        setSessionDetails(data);
      } catch (err) {
        console.error("Failed to fetch session details:", err);
        toast.error("Failed to load session details");
      }
    };
    if (sessionId) getSessionDetails();
  }, [sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sessionDetails) return;

    setLoading(true);
    const certID = `SDC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      patient: sessionDetails.appointment.patient._id || sessionDetails.appointment.patient,
      doctor: sessionData?.user?.id,
      issueDate: formData.issueDate,
      diagnosis: formData.diagnosis,
      comment: formData.comment,
      certID: certID,
      session: sessionId,
      doctorSignature: sessionData?.user?.signature || "", // Assuming signature is in session
    };

    try {
      await postData("certificates/create", payload);
      toast.success("Certificate issued successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to issue certificate:", err);
      toast.error(err.message || "Failed to issue certificate");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionDetails) return null;

  const patientName = `${sessionDetails.appointment.patient.firstName} ${sessionDetails.appointment.patient.lastName}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">Issue Medical Certificate</h2>
            <p className="text-blue-100 text-sm mt-1">Patient: {patientName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Diagnosis / Medical Condition</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="e.g. Acute Respiratory Infection"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Medical Advice / Recommended Rest</label>
            <textarea
              required
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
              placeholder="Advice the patient on recovery steps and duration of rest..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2">Issue Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Issue Certificate"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueCertificateModal;
