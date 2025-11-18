import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ReservaYa",
  description: "Mapa gastronómico - Cápsula 3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
