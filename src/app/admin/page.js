"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { EcommerceMetrics } from "@/components/admin/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/admin/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/admin/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/admin/ecommerce/StatisticsChart";
import RecentOrders from "@/components/admin/ecommerce/RecentOrders";
import DemographicCard from "@/components/admin/ecommerce/DemographicCard";

export default function Ecommerce() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      

        <>
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <EcommerceMetrics />
            { userRole === "admin" &&
              <MonthlySalesChart />
            }
          </div>

          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget />
          </div>

        
          {(userRole === "admin" || userRole === "user" || userRole === "specialist")  && 
            <div className="col-span-12">
              <StatisticsChart />
            </div>
          }

          {userRole === "admin" &&
            <div className="col-span-12 xl:col-span-5">
              <DemographicCard />
            </div>
          }
        </>
     

      {userRole !== "specialist" && (
        <div className="col-span-12 xl:col-span-7">
              <RecentOrders />
        </div>
      )}
      
    </div>
  );
}
