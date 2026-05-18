import type { Metadata } from "next";
import { NewNavbar } from "@/components/homepage/NewNavbar";

export const metadata: Metadata = {
  title: "Dashboard - Reserve237",
  description: "Partner dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NewNavbar />
      {children}
    </>
  );
}
