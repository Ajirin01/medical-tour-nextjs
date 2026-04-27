"use client";

import React, { useState, useEffect } from "react";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { FaSearch, FaExclamationTriangle, FaUserCircle, FaExternalLinkAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Badge from "./ui/badge/Badge";
import { CURRENCY_SYMBOL } from "@/utils/currency";

const TransactionsTable = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const url = `payments/admin/transactions?search=${search}&page=${page}&limit=20`;
        const data = await fetchData(url, token);
        setTransactions(data.payments);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      const delayDebounceFn = setTimeout(() => {
        fetchTransactions();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [token, search, page]);

  const handleOpenProfile = (user) => {
    if (!user?._id) return;
    const rolePath = user.role === "specialist" ? "specialists" : "patients";
    router.push(`/admin/${rolePath}/${user._id}`);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Search Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Transaction Management</h2>
        <div className="relative max-w-md w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Patient, ID, or Business..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
              <th className="px-6 py-4">Status & Flag</th>
              <th className="px-6 py-4">Patient / User</th>
              <th className="px-6 py-4">Transaction Details</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="6" className="px-6 py-4"><div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg"></div></td>
                </tr>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((txn) => (
                <tr key={txn._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <Badge 
                        color={txn.status === "paid" || txn.status === "Success" ? "success" : "warning"}
                        size="sm"
                      >
                        {txn.status}
                      </Badge>
                      {txn.isPotentialDuplicate && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          <FaExclamationTriangle /> POTENTIAL DUPLICATE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {txn.user?.profileImage ? (
                        <img src={txn.user.profileImage} className="w-10 h-10 rounded-full object-cover" alt="" />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-300" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white">
                          {txn.user ? `${txn.user.firstName} ${txn.user.lastName}` : "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500">{txn.user?.email || "No email"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <p className="font-mono text-xs text-gray-500">ID: {txn.transactionId || "N/A"}</p>
                    <p className="font-mono text-xs text-gray-500">Ref: {txn.reference?.substring(0, 15)}...</p>
                    {txn.metadata?.businessName && (
                      <p className="text-[10px] text-blue-600 font-bold mt-1">Biz: {txn.metadata.businessName}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{CURRENCY_SYMBOL} {txn.amount.toFixed(2)}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{txn.currency}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(txn.createdAt).toLocaleDateString()}
                    <br />
                    {new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleOpenProfile(txn.user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all title='View Profile'"
                    >
                      <FaExternalLinkAlt size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                  No transactions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing Page {pagination.page} of {pagination.pages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsTable;
