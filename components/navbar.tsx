"use client";

import Link from "next/link";
import Image from "next/image";
import { useWallet } from "../hooks/use-wallet";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { connected, connect, user } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when navigating or resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  return (
    <nav className="border-b border-gray-800 bg-background backdrop-blur-[8px]">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between z-100">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image src="/logo.svg" alt="Lore.Fun Logo" layout="fill" />
            </div>
            <span className="text-xl font-bold">Lore.Fun</span>
          </Link>
          <div className="bg-[#ffffff1a] ml-4 px-2 py-[5px] bg-opacity-20 bg-primary rounded-full text-sm ">
            $LORE
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/create" className="text-gray-300 hover:text-white">
            Create Story
          </Link>
          <Link href="/stories" className="text-gray-300 hover:text-white">
            Read Stories
          </Link>
          <Link href="/docs" className="text-gray-300 hover:text-white">
            Docs
          </Link>

          {connected ? (
            <Link
              href="/profile"
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              {user?.username || "My Profile"}
            </Link>
          ) : (
            <button
              onClick={connect}
              className="btn-secondary !text-[var(--primary)] px-4 py-2 rounded-md"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white p-2 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className=" md:hidden absoltute inset-0 z-50 bg-background backdrop-blur-[8px] ">
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-6 backdrop-blur-[8px] ">
            <Link
              href="/create"
              className="text-xl text-gray-300 hover:text-white py-2 border-b border-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Story
            </Link>
            <Link
              href="/stories"
              className="text-xl text-gray-300 hover:text-white py-2 border-b border-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Read Stories
            </Link>
            <Link
              href="/docs"
              className="text-xl text-gray-300 hover:text-white py-2 border-b border-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </Link>

            <div className="pt-4">
              {connected ? (
                <Link
                  href="/profile"
                  className="block w-full text-center bg-primary text-white px-4 py-3 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {user?.username || "My Profile"}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    connect();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-center btn-secondary !text-[var(--primary)]  px-4 py-3 rounded-md"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
