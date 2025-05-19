import type React from "react";
import Head from "next/head";
import Navbar from "./navbar";
import Footer from "./footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>Lore.Fun - Collaborative Storytelling on the Blockchain</title>
        <meta
          name="description"
          content="Join the first decentralized story production. Submit storylines, vote on the best content, and help create amazing stories."
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1a1b26" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen flex flex-col text-foreground dark">
        <Navbar />
        <main className="flex-grow relative z-10">{children}</main>
        <Footer />
      </div>
    </>
  );
}
