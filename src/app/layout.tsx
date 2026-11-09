import type { Metadata } from "next";
import "@fontsource-variable/nunito";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "SDIT Al-Ikhlas Serpong", template: "%s | SDIT Al-Ikhlas Serpong" },
  description: "Website resmi SDIT Al-Ikhlas Serpong. Informasi sekolah dan penerimaan peserta didik baru.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "SDIT Al-Ikhlas Serpong",
    title: "SDIT Al-Ikhlas Serpong",
    description: "Informasi sekolah dan penerimaan peserta didik baru.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body className="flex min-h-screen flex-col">{children}</body></html>;
}
