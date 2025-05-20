import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-primary/20 py-10 backdrop-blur-md bg-background/20 relative z-[10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground font-medieval">
              Lore.Fun
            </h3>
            <p className="text-foreground/80">
              Decentralized collaborative storytelling platform on the
              blockchain
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/stories"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  Browse Stories
                </Link>
              </li>
              <li>
                <Link
                  href="/create"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  Create Story
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs#faq"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/docs#tokenomics"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  Tokenomics
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-foreground">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://x.com/LoreDotFun"
                  target="_blank"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  X (Twitter)
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/alonsofied"
                  target="_blank"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  GitHub
                </Link>
              </li>
              <li>
                <Link
                  href="https://discord.gg/loredotfun"
                  target="_blank"
                  className="text-foreground/80 hover:text-primary transition-colors"
                >
                  Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary/20 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-foreground/70 mb-4 md:mb-0">
            © {new Date().getFullYear()} Lore.Fun. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/terms"
              className="text-foreground/70 hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-foreground/70 hover:text-primary transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
