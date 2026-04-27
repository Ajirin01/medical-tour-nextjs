"use client";

import React from "react";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import HospitalsTable from "@/components/admin/HospitalsTable";

export default function AdminHospitalsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <PageBreadcrumb pageTitle="Hospitals" />
      
      <div className="mt-8">
        <HospitalsTable />
      </div>
    </div>
  );
}
