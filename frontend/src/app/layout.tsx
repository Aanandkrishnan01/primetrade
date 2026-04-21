import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "PrimeTrade Task Manager",
  description:
    "Scalable REST API with Authentication & Role-Based Access Control — Built with FastAPI & Next.js",
  keywords: ["task manager", "fastapi", "nextjs", "jwt", "authentication"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
