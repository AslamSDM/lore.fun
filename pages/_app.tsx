import "../styles/globals.css"
import type { AppProps } from "next/app"
import { WalletProvider } from "../components/wallet-provider"
import Layout from "../components/layout"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WalletProvider>
  )
}

export default MyApp
