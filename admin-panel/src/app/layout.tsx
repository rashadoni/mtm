import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MTM Admin Panel",
  description: "Mobile Team Management Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 dark:bg-slate-900">
        {children}
      </body>
    </html>
  );
}
