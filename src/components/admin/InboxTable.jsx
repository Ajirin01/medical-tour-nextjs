"use client";

import React, { useState, useEffect } from "react";
import { fetchData, putData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { FaSearch, FaEnvelope, FaEnvelopeOpen, FaReply, FaTrash, FaCheckCircle, FaClock, FaCalendarAlt } from "react-icons/fa";
import Badge from "./ui/badge/Badge";

const InboxTable = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // GeneralController handles getAll. We use the custom admin route for contacts.
      const url = `contact/admin/all?search=${search}&status=${filterStatus}`;
      const data = await fetchData(url, token);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching inbox messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      const delayDebounceFn = setTimeout(() => {
        fetchMessages();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [token, search, filterStatus]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await putData(`contact/admin/${id}`, { status: newStatus }, token);
      fetchMessages();
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "new": return "warning";
      case "read": return "info";
      case "responded": return "success";
      case "archived": return "secondary";
      default: return "light";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Medical Tourism Inbox</h2>
          <p className="text-sm text-gray-500">Manage inquiries from the contact form</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search inquiries..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="responded">Responded</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Sender</th>
              <th className="px-6 py-4">Subject & Message</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-6 py-4"><div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div></td>
                </tr>
              ))
            ) : messages.length > 0 ? (
              messages.map((msg) => (
                <tr key={msg._id} className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${msg.status === 'new' ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <Badge color={getStatusColor(msg.status)} size="sm">
                      {msg.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800 dark:text-white">{msg.name}</p>
                    <p className="text-xs text-indigo-600 font-medium">{msg.email}</p>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">{msg.subject}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{msg.message}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1"><FaCalendarAlt size={10}/> {new Date(msg.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 text-[10px]"><FaClock size={10}/> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {msg.status === 'new' ? (
                        <button 
                          onClick={() => handleUpdateStatus(msg._id, 'read')}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Mark as Read"
                        >
                          <FaEnvelopeOpen size={14} />
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="p-2 text-gray-300 rounded-lg"
                        >
                          <FaEnvelope size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleUpdateStatus(msg._id, 'responded')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Mark Responded"
                      >
                        <FaCheckCircle size={14} />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(msg._id, 'archived')}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all"
                        title="Archive"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                  Inbox is empty.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InboxTable;
