"use client";

import React from "react";
import TransactionsTable from "@/components/admin/TransactionsTable";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";

export default function AdminTransactionsPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageBreadcrumb pageTitle="Transactions" />
      
      <div className="flex flex-col gap-6">
        <TransactionsTable />
      </div>
    </div>
  );
}
