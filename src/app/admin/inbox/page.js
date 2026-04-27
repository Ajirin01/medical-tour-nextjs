"use client";

import React from "react";
import InboxTable from "@/components/admin/InboxTable";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";

export default function AdminInboxPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <PageBreadcrumb pageTitle="Medical Tourism Inbox" />
      
      <div className="flex flex-col gap-6">
        <InboxTable />
      </div>
    </div>
  );
}
