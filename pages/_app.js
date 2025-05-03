"use client"

import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { ThemeProvider } from "next-themes"
import "../styles/globals.css"
import Layout from "../components/Layout"
import { Web3Provider } from "../context/Web3Context"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => supabase)

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <Web3Provider>
        <Layout>
          <Component {...pageProps} supabaseClient={supabaseClient} />
        </Layout>
      </Web3Provider>
    </ThemeProvider>
  )
}

export default MyApp
