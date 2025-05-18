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
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-9 h-9">
              <Image
                src="/logo.svg"
                alt="Lore.Fun Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-foreground">Lore.Fun</span>
          </Link>
          <div className="bg-primary/10 ml-3 px-3 py-1 rounded-full text-sm font-semibold text-primary">
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
              <Button variant="default">
                {user?.username || "My Profile"}
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" onClick={connect}>
              Connect Wallet
            </Button>
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
        <div className="md:hidden fixed inset-0 z-50 bg-background">
          <div className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            <Link
              href="/create"
              className="text-lg text-foreground py-3 border-b border-border hover:bg-accent hover:bg-opacity-50 px-2 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Story
            </Link>
            <Link
              href="/stories"
              className="text-lg text-foreground py-3 border-b border-border hover:bg-accent hover:bg-opacity-50 px-2 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Read Stories
            </Link>
            <Link
              href="/docs"
              className="text-lg text-foreground py-3 border-b border-border hover:bg-accent hover:bg-opacity-50 px-2 rounded-md transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Docs
            </Link>

            <div className="pt-4">
              {connected ? (
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="no-underline block w-full"
                >
                  <Button variant="default" className="w-full">
                    {user?.username || "My Profile"}
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
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
