import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}