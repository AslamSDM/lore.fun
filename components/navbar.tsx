"use client";

import Link from "next/link";
import Image from "next/image";
import { useWallet } from "../hooks/use-wallet";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <nav className="border-b border-primary/20 backdrop-blur-md bg-background/30 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-9 h-9 bg-primary/20 rounded-full p-1 flex items-center justify-center">
              <Image
                src="/logo.svg"
                alt="Lore.Fun Logo"
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-foreground font-medieval">
              Lore.Fun
            </span>
          </Link>
          <div className="bg-primary/20 ml-3 px-3 py-1 rounded-full text-sm font-semibold text-primary border border-primary/40">
            $LORE
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/create"
            className="text-foreground hover:text-primary transition-colors"
          >
            Create Story
          </Link>
          <Link
            href="/stories"
            className="text-foreground hover:text-primary transition-colors"
          >
            Read Stories
          </Link>
          <Link
            href="/docs"
            className="text-foreground hover:text-primary transition-colors"
          >
            Docs
          </Link>

          {connected ? (
            <Link href="/profile" className="no-underline">
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/80 shadow-md"
              >
                {user?.username || "My Profile"}
              </Button>
            </Link>
          ) : (
            <Button
              variant="secondary"
              onClick={connect}
              className="shadow-md border border-primary/20"
            >
              Connect Wallet
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full bg-secondary/20 hover:bg-secondary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-primary" />
          )}
        </button>
      </div>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 backdrop-blur-xl bg-background/95">
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full bg-secondary/20 hover:bg-secondary/40 transition-colors"
              >
                <X className="h-6 w-6 text-primary" />
              </button>
            </div>

            <div className="flex items-center justify-center mb-8">
              <div className="relative w-12 h-12 bg-primary/20 rounded-full p-2 flex items-center justify-center mr-3">
                <Image
                  src="/logo.svg"
                  alt="Lore.Fun Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-primary font-medieval">
                Lore.Fun
              </span>
            </div>

            <Link
              href="/create"
              className="text-lg text-foreground py-3 border-b border-primary/20 hover:bg-primary/10 px-4 rounded-lg transition-colors flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Story
            </Link>
            <Link
              href="/stories"
              className="text-lg text-foreground py-3 border-b border-primary/20 hover:bg-primary/10 px-4 rounded-lg transition-colors flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Read Stories
            </Link>
            <Link
              href="/docs"
              className="text-lg text-foreground py-3 border-b border-primary/20 hover:bg-primary/10 px-4 rounded-lg transition-colors flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </Link>

            <div className="pt-8">
              {connected ? (
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="no-underline block w-full"
                >
                  <Button
                    variant="default"
                    className="w-full bg-primary hover:bg-primary/80 shadow-md text-lg py-6"
                  >
                    {user?.username || "My Profile"}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full shadow-md border border-primary/20 text-lg py-6"
                  onClick={() => {
                    connect();
                    setIsMenuOpen(false);
                  }}
                >
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
