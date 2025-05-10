import type React from "react"
import Head from "next/head"
import Navbar from "./navbar"
import Footer from "./footer"

interface LayoutProps {
  children: React.ReactNode
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
      </Head>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
    </>
  )
}
