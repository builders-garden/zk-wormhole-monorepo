import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { WagmiProviderWrapper } from "@/components/providers/wagmi-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZK Wormhole",
  description: "ZK Wormhole",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProviderWrapper>
          {children}
          <Toaster />
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}
