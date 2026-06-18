import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk, Work_Sans } from "next/font/google";
import { QueryProvider } from "./QueryProvider";
import { OSInitializationProvider } from "./OSInitializationProvider";
import { ShellGate } from "./ShellGate";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zig Governance OS",
  description: "AI-native governance operating system foundation.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${workSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <QueryProvider>
          <OSInitializationProvider>
            <ShellGate>{children}</ShellGate>
          </OSInitializationProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
