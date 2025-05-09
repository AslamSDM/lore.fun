"use client";

import { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useRouter } from "next/router";
import LoadingSpinner from "./LoadingSpinner";

export default function Layout({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-100">
      <Header />
      <div className="flex-grow">{loading ? <LoadingSpinner /> : children}</div>
      <Footer />
    </div>
  );
}
