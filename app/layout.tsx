import type { Metadata } from "next";
import "./globals.css";
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap"
          rel="stylesheet"
        />
        {/*<link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex&display=swap" rel="stylesheet" />*/}
      </head>
      <body style={{ fontFamily: "'Google Sans Flex', sans-serif" }} className="min-h-full flex flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between sticky top-0 bg-white z-100 border-b border-gray-100 px-6 py-4">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src="/favicon.ico" className="w-5 h-5" alt="Instructli logo" />
            <span className="font-medium text-gray-900">Instructli</span>
          </a>

          <AdminMenu />
        </nav>

        {children}
      </body>
    </html>
  );
}