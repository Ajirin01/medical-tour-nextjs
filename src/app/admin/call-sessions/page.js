"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/admin/ui/table";
import Badge from "@/components/admin/ui/badge/Badge";
import { fetchData } from "@/utils/api";

const VideoSessionsPage = () => {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const token = session?.user?.jwt;
  const role = session?.user?.role;

  useEffect(() => {
    if (token) {
      loadSessions(page, token);
    }
  }, [token, page]);

  const loadSessions = async (currentPage, token) => {
    setLoading(true);
    try {
      const endpoint = `video-sessions/get/all/paginated?page=${currentPage}`

      const data = await fetchData(endpoint, token);
      setSessions(data.data);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:text-gray-300 p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Video Sessions</h1>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {loading ? (
            <p>Loading sessions...</p>
          ) : (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >User</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >Specialist</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >Start Time</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >End Time</TableCell>
                  <TableCell isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >Duration</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {sessions.map((videoSession) => (
                  <TableRow key={videoSession._id}>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{videoSession.user?.firstName || "N/A"}  {videoSession.user?.lastName || "N/A"}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">{videoSession.specialist?.firstName || "N/A"}  {videoSession.specialist?.lastName || "N/A"}</TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {videoSession.startTime ? new Date(videoSession.startTime).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {videoSession.endTime ? new Date(videoSession.endTime).toLocaleString() : "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400">
                      {videoSession.durationInMinutes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex gap-2 justify-center">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-3 py-1">{page} / {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VideoSessionsPage;
