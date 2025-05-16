import React from "react";
import { Button } from "@/components/ui/button";
import {
  ScrollAnimation,
  ScrollTextAnimation,
  AnimatedHeading,
} from "@/components/animations/scroll-animation";
import { motion } from "framer-motion";
import Link from "next/link";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  showConnectWalletButton?: boolean;
  onConnectWallet?: () => void;
  connected?: boolean;
}

export const HeroSection = ({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  showConnectWalletButton = false,
  onConnectWallet,
  connected = false,
}: HeroSectionProps) => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <AnimatedHeading
              el="h1"
              className="text-4xl md:text-6xl font-bold mb-6 font-medieval2"
            >
              {title}
            </AnimatedHeading>

            <ScrollTextAnimation delay={0.2} className="space-y-4">
              <p className="text-xl text-gray-300 mb-8">{subtitle}</p>
              <div className="flex flex-wrap gap-4">
                <Link href={primaryButtonLink}>
                  <Button
                    variant="default"
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    {primaryButtonText}
                  </Button>
                </Link>

                {secondaryButtonText && secondaryButtonLink && (
                  <Link href={secondaryButtonLink}>
                    <Button variant="outline" size="lg">
                      {secondaryButtonText}
                    </Button>
                  </Link>
                )}

                {showConnectWalletButton && !connected && (
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={onConnectWallet}
                  >
                    Connect Wallet to Participate
                  </Button>
                )}
              </div>
            </ScrollTextAnimation>
          </div>

          <ScrollAnimation
            delay={0.4}
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.6,
                  ease: "easeOut",
                },
              },
            }}
          >
            <div className="bg-card-bg rounded-lg p-6 border border-gray-800 shadow-lg">
              {/* Card content goes here */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="space-y-6"
              >
                {/* Content can be dynamically passed in */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Featured Stories</h3>
                  <span className="bg-primary/20 text-primary px-2 py-1 text-sm rounded-full">
                    Popular
                  </span>
                </div>
                <div className="space-y-4">{/* Interactive content */}</div>
              </motion.div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
};
