"use client";
import React, { useState, useEffect } from "react";
import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";
import { fetchData } from "@/utils/api"
import { useSession } from "next-auth/react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatisticsChart() {
  const [sessionData, setSessionData] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState(null);

  const { data: session } = useSession()
  const token = session?.user?.jwt

  // Fetch video session statistics
  const fetchSessionData = async () => {
    try {
      const response = await fetchData("video-sessions/by-user/all", token); // Adjust to your actual endpoint
      const sessions = response.sessions;
      console.log(response.sessions)
      // Prepare data for chart (e.g., sessions count by month)
      const sessionCountsByMonth = Array(12).fill(0);
      const prescriptionCountsByMonth = Array(12).fill(0);

      sessions.forEach((session) => {
        const month = new Date(session.createdAt).getMonth(); // Get month from the session date
        sessionCountsByMonth[month]++;

        if (session.prescriptions && session.prescriptions.length > 0) {
          prescriptionCountsByMonth[month]++;
        }
      });

      setSessionData(sessionCountsByMonth);
      setPrescriptionData(prescriptionCountsByMonth);
    } catch (error) {
      console.error("Error fetching session data:", error);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, []);

  const options = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF", "#9CB9FF"], 
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "straight",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        format: "dd MMM yyyy",
      },
    },
    xaxis: {
      type: "category",
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Sessions",
      data: sessionData || Array(12).fill(0), // Default to empty array if data is not yet fetched
    },
    {
      name: "Prescriptions",
      data: prescriptionData || Array(12).fill(0), // Default to empty array if data is not yet fetched
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Video sessions and prescriptions stats for each month
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}
