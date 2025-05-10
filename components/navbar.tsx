"use client";

import Link from "next/link";
import Image from "next/image";
import { useWallet } from "../hooks/use-wallet";

export default function Navbar() {
  const { connected, connect } = useWallet();

  return (
    <nav className="border-b border-gray-800 bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <Image src="/logo.svg" alt="Lore.Fun Logo" layout="fill" />
              </div>
              <span className="text-xl font-bold">Lore.Fun</span>
            </div>
          </Link>
          <div className="ml-4 px-2 py-1 bg-opacity-20 bg-primary rounded-full text-sm">
            $LORE
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/stories">
            <p className="text-gray-300 hover:text-white">Current Story</p>
          </Link>
          <Link href="/submit">
            <p className="text-gray-300 hover:text-white">Submit</p>
          </Link>
          <Link href="/vote">
            <p className="text-gray-300 hover:text-white">Vote</p>
          </Link>

          {connected ? (
            <Link href="/profile">
              <p className="bg-primary text-white px-4 py-2 rounded-md">
                My Profile
              </p>
            </Link>
          ) : (
            <button
              onClick={connect}
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
