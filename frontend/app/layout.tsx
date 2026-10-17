import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { shadcnUi } from "@/components/shared/shadcn-imports";

void shadcnUi;
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { FIRM_NAME } from "@/lib/constants";
import { getFirmBranding } from "@/lib/firm-branding";
import "./globals.css";

const archivoSemiCondensed = localFont({
  src: [
    {
      path: "./fonts/Archivo_SemiCondensed-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Archivo_SemiCondensed-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Archivo_SemiCondensed-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Archivo_SemiCondensed-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-archivo",
  display: "swap",
});

const brand = getFirmBranding();

export const metadata: Metadata = {
  title: FIRM_NAME,
  description: "Immigration document checklist — staff and client portals",
  metadataBase: brand.clientPortalDomain
    ? new URL(`https://${brand.clientPortalDomain}`)
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#621d92",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivoSemiCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-hidden font-sans">
        <QueryProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
