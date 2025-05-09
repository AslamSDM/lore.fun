"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useWeb3 } from "../context/Web3Context";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const {
    address,
    connectWallet,
    disconnectWallet,
    isConnecting,
    loreBalance,
  } = useWeb3();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleConnectWallet = async () => {
    const success = await connectWallet();
    if (success) {
      setMobileMenuOpen(false);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#b99be680] ">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center">
                {/* <Image
                  src="/logo.png"
                  alt="Lore.fun Logo"
                  width={40}
                  height={40}
                /> */}
                <span className="ml-2 text-xl font-bold text-violet-400 font-medieval">
                  LORE.FUN
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <div
                className={`text-lg font-medieval ${
                  router.pathname === "/"
                    ? "text-violet-400"
                    : "text-gray-300 hover:text-violet-300"
                }`}
              >
                HOME
              </div>
            </Link>
            {address && (
              <Link href="/create-story">
                <div
                  className={`text-lg font-medieval ${
                    router.pathname === "/create-story"
                      ? "text-violet-400"
                      : "text-gray-300 hover:text-violet-300"
                  }`}
                >
                  CREATE
                </div>
              </Link>
            )}
            {address && (
              <Link href="/profile">
                <div
                  className={`text-lg font-medieval ${
                    router.pathname === "/profile"
                      ? "text-violet-400"
                      : "text-gray-300 hover:text-violet-300"
                  }`}
                >
                  PROFILE
                </div>
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center">
            {address ? (
              <div className="flex items-center">
                <span className="text-gray-300 mr-4 font-mono text-sm truncate max-w-[120px]">
                  {address.substring(0, 6)}...
                  {address.substring(address.length - 4)}
                  {loreBalance === null && (
                    <span className="ml-2 inline-block w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                  )}
                </span>
                <button
                  onClick={handleDisconnectWallet}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medieval rounded-md transition duration-300 text-xs "
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300 disabled:opacity-50 text-xs "
              >
                {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link href="/">
              <div
                className={`block text-lg font-medieval ${
                  router.pathname === "/" ? "text-violet-400" : "text-gray-300"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                HOME
              </div>
            </Link>
            {address && (
              <Link href="/create-story">
                <div
                  className={`block text-lg font-medieval ${
                    router.pathname === "/create-story"
                      ? "text-violet-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  CREATE
                </div>
              </Link>
            )}
            {address && (
              <Link href="/profile">
                <div
                  className={`block text-lg font-medieval ${
                    router.pathname === "/profile"
                      ? "text-violet-400"
                      : "text-gray-300"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  PROFILE
                </div>
              </Link>
            )}
            <div className="pt-4 border-t border-gray-700">
              {address ? (
                <div className="flex flex-col space-y-2">
                  <span className="text-gray-300 font-mono text-sm truncate">
                    {address.substring(0, 6)}...
                    {address.substring(address.length - 4)}
                  </span>
                  <button
                    onClick={handleDisconnectWallet}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medieval rounded-md transition duration-300"
                  >
                    DISCONNECT
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="w-full px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white font-medieval rounded-md transition duration-300 disabled:opacity-50"
                >
                  {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
