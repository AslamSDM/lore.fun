"use client";

import "../styles/globals.css";
import "../styles/spline.css";
import type { AppProps } from "next/app";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletProvider } from "@/components/wallet-provider";
import Layout from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

function MyApp({ Component, pageProps }: AppProps) {
  // Set up Solana network and wallets
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  );

  // // Set up automated round checking (client-side)
  // useEffect(() => {
  //   // Only run automated checks in production
  //   if (process.env.NODE_ENV === "production") {
  //     // Check rounds every 15 minutes
  //     const stopScheduler = scheduleAutomatedRoundChecks(15);

  //     // Also run a check immediately on app load
  //     import("../lib/round-automation").then((module) => {
  //       module.checkAndProcessRounds().catch(console.error);
  //     });

  //     // Clean up the interval when the app is unmounted
  //     return () => stopScheduler();
  //   }
  // }, []);

  return (
    <ThemeProvider>
      <ConnectionProvider endpoint={endpoint}>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <WalletProvider>
              <Layout>
                <Component {...pageProps} />
                <Toaster />
              </Layout>
            </WalletProvider>
          </WalletModalProvider>
        </SolanaWalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}

export default MyApp;
