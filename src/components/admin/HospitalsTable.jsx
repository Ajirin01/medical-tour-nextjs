"use client";

import React, { useState, useEffect } from "react";
import { fetchData } from "@/utils/api";
import { useSession } from "next-auth/react";
import { FaSearch, FaHospital, FaGlobe, FaStethoscope, FaExternalLinkAlt, FaFilter, FaSort } from "react-icons/fa";
import Badge from "./ui/badge/Badge";

const HospitalsTable = () => {
  const { data: session } = useSession();
  const token = session?.user?.jwt;

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchHospitals = async () => {
      setLoading(true);
      try {
        let url = `hospitals?search=${search}&page=${page}&limit=20&sort=${sort}`;
        if (countryFilter) {
          url += `&country=${countryFilter}`;
        }
        const response = await fetchData(url, token);
        setHospitals(response.data);
        setPagination({
          page: response.page,
          pages: response.pages,
          total: response.total
        });
      } catch (error) {
        console.error("Error fetching hospitals:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      const delayDebounceFn = setTimeout(() => {
        fetchHospitals();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [token, search, countryFilter, sort, page]);

  // Extract unique countries from the initial data or a separate endpoint if available
  // For now, we'll just populate from the current list or a hardcoded subset if needed, 
  // but a dedicated "unique countries" endpoint would be better.
  useEffect(() => {
    const fetchCountries = async () => {
      if (!token) return;
      try {
        // This is a bit of a hack since there's no unique countries endpoint
        // In a real scenario, we'd have one. For now, we'll just use the search results.
        const response = await fetchData(`hospitals?limit=500`, token);
        const uniqueCountries = [...new Set(response.data.map(h => h.location?.country).filter(Boolean))].sort();
        setCountries(uniqueCountries);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      }
    };
    fetchCountries();
  }, [token]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Hospital Management</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-grow sm:max-w-xs">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search hospitals, illness, or specialty..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none text-sm"
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Countries</option>
              {countries.map((c, i) => (
                <option key={`country-${c}-${i}`} value={c}>{c}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="-createdAt">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="country">Country (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
              <th className="px-6 py-4">Hospital Name & Location</th>
              <th className="px-6 py-4">Specialties</th>
              <th className="px-6 py-4">Illnesses Treated</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="4" className="px-6 py-4"><div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div></td>
                </tr>
              ))
            ) : hospitals.length > 0 ? (
              hospitals.map((hospital) => (
                <tr key={hospital._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <FaHospital size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-white">{hospital.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaGlobe className="text-gray-400" /> {hospital.location?.address}, {hospital.location?.country}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties?.slice(0, 3).map((spec, idx) => (
                        <span key={`${hospital._id}-spec-${idx}`} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {spec}
                        </span>
                      ))}
                      {hospital.specialties?.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{hospital.specialties.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {hospital.illnessesTreated?.slice(0, 3).map((ill, idx) => (
                        <span key={`${hospital._id}-illness-${idx}`} className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
                          {ill}
                        </span>
                      ))}
                      {hospital.illnessesTreated?.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{hospital.illnessesTreated.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                      title="View Details"
                      onClick={() => alert(`Details for ${hospital.name} coming soon`)}
                    >
                      <FaExternalLinkAlt size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-20 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <FaHospital size={40} className="text-gray-200" />
                    <p>No hospitals found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination?.pages > 1 && (
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-gray-500">
            Showing Page <span className="font-bold text-gray-800 dark:text-white">{pagination.page}</span> of <span className="font-bold text-gray-800 dark:text-white">{pagination.pages}</span> (<span className="font-bold">{pagination.total}</span> total)
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex-grow sm:flex-none px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            <button
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
              className="flex-grow sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalsTable;
