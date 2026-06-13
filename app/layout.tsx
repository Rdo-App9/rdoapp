import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RdoApp - Gestão de Canteiro de Obras",
  description: "Sistema inteligente de RDO e gestão de canteiro de obras",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["obra", "rdo", "construção", "gestão", "canteiro"],
  authors: [{ name: "RdoApp" }],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Deixa a barra superior do iOS integrada ao app dark
    title: "RdoApp",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Essencial para o pt-safe funcionar em iPhones com notch
  themeColor: "#0a0a0a", // Mantendo o tom dark original do seu app
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
