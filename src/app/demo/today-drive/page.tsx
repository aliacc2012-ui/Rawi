import type { Metadata } from "next";
import { TodayDriveDemo } from "@/components/demo/TodayDriveDemo";

export const metadata: Metadata = {
  title: "Today Drive — RAWI Demo Gallery",
  description: "Experience a cinematic RAWI client gallery for photographers and filmmakers.",
};

export default function TodayDriveDemoPage() {
  return <TodayDriveDemo />;
}
