import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} Lore.Fun. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link
              href="https://x.com/LoreDotFun"
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Connect on X
            </Link>
            <Link
              href="https://github.com/alonsofied"
              target="_blank"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Github
            </Link>
            <Link
              href="/docs"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Docs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
