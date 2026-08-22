import type { Metadata } from "next";
import "./globals.css";
import Link from 'next/link';
import { ShieldQuestion } from 'lucide-react';

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
          <a href="/" className="flex items-center gap-2 w-fit">
            <img src="/favicon.ico" className="w-5 h-5" />
            <span className="font-semibold text-gray-900">Instructli</span>
          </a>

          {/*<Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          >
            <ShieldQuestion size={15} />
            Are you an admin?
          </Link>*/}
        </nav>

        {children}
      </body>
    </html>
  );
}