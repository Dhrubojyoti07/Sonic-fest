import React from "react";
import { Metadata } from "next";
import { MyPassesView } from "@/components/passes/MyPassesView";

export const metadata: Metadata = {
  title: "My Booked Festival Passes — SONIC FEST",
  description: "View, download, and manage your booked passes and gate admission QR codes for SONIC FEST.",
};

export default function MyPassesPage() {
  return (
    <div className="min-h-screen pt-20 pb-24 bg-[#08070e]">
      <MyPassesView />
    </div>
  );
}
