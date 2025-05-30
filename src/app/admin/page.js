"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  FaUserAlt, FaCalendarAlt, FaHistory, FaRobot, FaUserMd, 
  FaFileMedical, FaHeartbeat, FaChartLine, FaSearch,
  FaBell, FaClipboardList, FaEllipsisH, FaPills, FaChevronRight
} from 'react-icons/fa';

import { useRouter } from "next/navigation";

import { DTable } from "@/components/gabriel";

import MonthlyTarget from "@/components/admin/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/admin/ecommerce/StatisticsChart";
import RecentOrders from "@/components/admin/ecommerce/RecentOrders";
import DemographicCard from "@/components/admin/ecommerce/DemographicCard";

import { useUser } from "@/context/UserContext";
import { fetchData } from "@/utils/api";


export default function Ecommerce() {
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? "user";
  const token = session?.user?.jwt

  const router = useRouter()

  const { user } = useUser()

  const [calls, setCalls] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentMedications, setRecentMedications] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState(null)


  // Fetch video session statistics
  const fetchSessionData = async () => {
    try {
      const response = await fetchData("video-sessions/by-user/all", token); // Adjust to your actual endpoint
      const sessions = response.sessions;
      console.log(response.sessions)
      // Prepare data for chart (e.g., sessions count by month)
      const sessionCountsByMonth = Array(12).fill(0);
      const prescriptionCountsByMonth = Array(12).fill(0);
      const sessionPrescriptions = []

      sessions.forEach((session) => {
        const month = new Date(session.createdAt).getMonth(); // Get month from the session date
        sessionCountsByMonth[month]++;

        if (session.prescriptions && session.prescriptions.length > 0) {
          prescriptionCountsByMonth[month]++;
          sessionPrescriptions.push(session.prescriptions)
        }
      });

      setCalls(response.sessions);
      setLoading(false)
      setPrescriptions(sessionPrescriptions);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  useEffect(() => {
    if(token) fetchSessionData();
  }, [token]);

  const fetchAppointmentData = async () => {
    if(!user) return
    try {
      const response = await fetchData(`consultation-appointments/all/paginated?patient=${user?._id}&status=pending`, token); // Adjust to your actual endpoint
      console.log(response.data)
      setUpcomingAppointments(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  // Simulated fetch
  useEffect(() => {

    if(token) fetchAppointmentData()

    setRecentMedications(prescriptions);
    setRecordsCount(prescriptions?.length);

    const latestDate = prescriptions?.reduce((latest, current) => {
      const currentStart = new Date(current.startDate);
      return currentStart > latest ? currentStart : latest;
    }, new Date(0));
    setLastUpdated(latestDate);
  }, [prescriptions, token]);

  const formatLastUpdated = (date) => {
    if (!date) return "No data";
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleChat = () => {};
  const handleConsult = () => {
    router.push("admin/available-specialists")
  };
  const handleMedicalRecords = () => {};
  const handleAppointments = () => {
    router.push("admin/appointments")
  };
  const handleCreateAppointments = () => {
    router.push("admin/consultation/book")
  };
  const handleHistory = () => {};

  const quickActions = [
    {
      title: "AI Health Assistant",
      description: "Get instant health advice",
      icon: <FaRobot className="text-cyan-500" size={20} />,
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      action: handleChat
    },
    {
      title: "Consult Doctor",
      description: "Book a consultation",
      icon: <FaUserMd className="text-[var(--color-primary67)]" size={20} />,
      bgColor: "bg-primary-50",
      borderColor: "border-primary-200",
      action: handleConsult
    },
    {
      title: "Medical Records",
      description: "View your records",
      icon: <FaFileMedical className="text-blue-600" size={20} />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      action: handleMedicalRecords
    },
    {
      title: "Appointments",
      description: "Manage appointments",
      icon: <FaCalendarAlt className="text-green-600" size={20} />,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      action: handleAppointments
    }
  ];

  // Dynamic stats based on real data
  const stats = [
    {
      title: "Next Appointment",
      value: upcomingAppointments.length > 0 ? 
        new Date(upcomingAppointments[0].date).toLocaleDateString() : 
        "None",
      change: upcomingAppointments.length > 0 ? 
        `with Dr. ${upcomingAppointments[0].consultant.firstName || 'Specialist'}` : 
        "No scheduled appointments",
      icon: <FaCalendarAlt className="text-green-600" size={20} />,
      bgColor: "bg-green-50",
      iconBg: "bg-green-100"
    },
    {
      title: "Medical Records",
      value: recordsCount?.toString(),
      change: lastUpdated ? `Last updated ${formatLastUpdated(lastUpdated)}` : "No records yet",
      icon: <FaFileMedical className="text-blue-600" size={20} />,
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100"
    },
    {
      title: "Prescriptions",
      value: prescriptions?.length?.toString(),
      change: prescriptions?.length > 0 ? 
        `${prescriptions?.filter(med => med.remainingDays < 10).length} need${prescriptions?.filter(med => med.remainingDays < 10).length === 1 ? 's' : ''} refill soon` : 
        "No active prescriptions",
      icon: <FaPills className="text-purple-600" size={20} />,
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100"
    },
    {
      title: "Consultations",
      value: calls.length.toString(),
      change: calls.length > 0 ? 
        `Last: ${new Date(calls[calls.length-1].endTime).toLocaleDateString()}` : 
        "No past consultations",
      icon: <FaUserMd className="text-red-600" size={20} />,
      bgColor: "bg-red-50",
      iconBg: "bg-red-100"
    }
  ];

  


  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        { userRole === "user" && 
          <div className="mb-8 bg-gradient-to-r from-[var(--color-primary-6)] to-[var(--color-primary-8)] rounded-2xl shadow-md">
            <div className="p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {user?.firstName || 'User'}</h2>
                  <p className="mt-1 opacity-90">Your health matters to us. How can we help you today?</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button 
                    onClick={handleChat}
                    className="bg-white text-[var(--color-primary-7)] px-4 py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center"
                  >
                    <FaRobot className="mr-2" />
                    Symptom Checker
                  </button>
                  <button 
                    onClick={handleConsult}
                    className="bg-white/20 text-white border border-white/40 px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-white/30 transition-all flex items-center"
                  >
                    <FaUserMd className="mr-2" />
                    Consult Doctor Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bgColor} rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.iconBg} w-10 h-10 rounded-full flex items-center justify-center`}>
                    {stat.icon}
                  </div>
                  <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <FaEllipsisH size={16} />
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-xs mt-2 text-gray-500">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>

        

        {/* Existing eCommerce Grid Layout */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-6 xl:col-span-5">
            <MonthlyTarget />
          </div>

          {(userRole === "admin" || userRole === "user" || userRole === "specialist") && (
            <div className="col-span-7">
              <StatisticsChart />
            </div>
          )}

          { userRole === "user" && 
            <div className="col-span-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {quickActions.map((action, index) => (
                      <div 
                        key={index} 
                        onClick={action.action}
                        className={`${action.bgColor} border ${action.borderColor} rounded-xl p-4 cursor-pointer transition-all hover:shadow-md flex items-center justify-between`}
                      >
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm mr-4">
                            {action.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">{action.title}</h3>
                            <p className="text-xs text-gray-500">{action.description}</p>
                          </div>
                        </div>
                        <FaChevronRight className="text-gray-400" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Medications */}
                  <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="border-b px-5 py-4 flex justify-between items-center">
                      <h2 className="font-semibold text-gray-800">Current Medications</h2>
                      <button
                        onClick={() => navigate(PATH.dashboard.medications)}
                        className="text-[var(--color-primary67)] hover:text-[var(--color-[var(--color-primary-7)])] text-xs font-medium"
                      >
                        View All
                      </button>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {prescriptions?.length > 0 ? prescriptions?.map((med, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-gray-800">{med.name}</h3>
                              <p className="text-sm text-gray-500">{med.dosage} - {med.schedule}</p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              med.remainingDays <= 7 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {med.remainingDays <= 7 ? 'Refill Soon' : `${med.remainingDays} days left`}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-500">No active medications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Upcoming Appointments */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b px-5 py-4 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Upcoming Appointments</h2>
                    <button
                      onClick={handleAppointments}
                      className="text-[var(--color-primary67)] hover:text-[var(--color-primary-7)] text-xs font-medium"
                    >
                      View All
                    </button>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {upcomingAppointments.length > 0 ? upcomingAppointments.map((appointment, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          {appointment.avatar ? (
                            <img 
                              src={appointment.avatar} 
                              alt={appointment.doctorName} 
                              className="w-10 h-10 rounded-full mr-4 object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full mr-4 bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                              {appointment.doctorName?.charAt(0) || 'D'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{appointment.consultant.firstName || 'Doctor'}</p>
                            <p className="text-xs text-gray-500">{appointment.consultant.specialty || 'Specialist'}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <span className="text-[var(--color-primary67)] mr-1">
                                <FaCalendarAlt size={10} />
                              </span>
                              <span>
                                {appointment.date ? (
                                  typeof appointment.date === 'string' && !appointment.date.includes('-') ? 
                                  appointment.date : 
                                  new Date(appointment.date).toLocaleDateString()
                                ) : 'Date not set'}, 
                                {appointment.time || (appointment.startTime ? new Date(appointment.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '00:00')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <button 
                              onClick={() => navigate(`${PATH.dashboard.appointments}/${appointment.id || appointment._id}`)}
                              className="px-3 py-1 bg-primary-50 text-[var(--color-primary67)] rounded-full text-xs font-medium hover:bg-primary-100 transition-colors">
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">No upcoming appointments</p>
                        <button 
                          onClick={handleAppointments}
                          className="mt-2 px-4 py-2 bg-primary-50 text-[var(--color-primary67)] rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-gray-50">
                    <button 
                      onClick={handleCreateAppointments}
                      className="w-full py-2 bg-white border border-gray-300 rounded-lg text-[var(--color-primary67)] hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                      + New Appointment
                    </button>
                  </div>
                </div>
                
                {/* Recent Activities */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="border-b px-5 py-4 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Recent Activities</h2>
                    <button 
                      onClick={handleHistory}
                      className="text-[var(--color-primary67)] hover:text-[var(--color-primary-7)] text-xs font-medium"
                    >
                      View All
                    </button>
                  </div>
                  
                  <div className="overflow-hidden">
                    {loading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary67)]"></div>
                      </div>
                    ) : error ? (
                      <div className="p-6 text-center text-red-500">{error}</div>
                    ) : calls && calls.length > 0 ? (
                      <div className="overflow-x-auto">
                        <DTable calls={calls} loading={loading} limit={5} />
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">No recent activities</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          }


          {userRole === "admin" && (
            <div className="col-span-12 xl:col-span-5">
              <DemographicCard />
            </div>
          )}

          {userRole !== "specialist" && (
            <div className="col-span-12">
              <RecentOrders />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
