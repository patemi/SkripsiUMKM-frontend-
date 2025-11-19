import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoraUMKM - Platform UMKM Solo Raya",
  description: "Platform terpercaya untuk menemukan dan mendukung UMKM di wilayah Solo Raya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
