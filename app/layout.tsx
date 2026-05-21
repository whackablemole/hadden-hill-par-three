import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hadden Hill Scorekeeper",
  description: "Live scorekeeping for Hadden Hill par-three rounds",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
