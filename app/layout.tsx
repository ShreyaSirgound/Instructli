import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import { BarChart3, Users } from 'lucide-react';
import StudentViewButton from "@/components/admin/StudentView";
import AdminMenu from "@/components/admin/AdminMenu"

export const metadata: Metadata = {
  title: "Instructli",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Google Sans Flex', sans-serif" }} className="min-h-full flex flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between sticky top-0 bg-white z-100 border-b border-gray-100 px-6 py-4">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/favicon.ico" className="w-5 h-5" alt="Instructli logo" />
            <span className="font-semibold text-gray-900">Instructli</span>
          </a>

          <AdminMenu />
          {/*<div className="flex items-center gap-1 shrink-0 whitespace-nowrap">
            <Link
              href="/admin/stats"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <BarChart3 size={15} />
              View stats
            </Link>
            <Link
              href="/admin/admins"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              <Users size={15} />
              Manage admins
            </Link>
            <StudentViewButton />
          </div>*/}
        </nav>

        {children}
      </body>
    </html>
  );
}