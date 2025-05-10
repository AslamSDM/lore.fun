import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-400">
              © 2025 Lore.Fun. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/terms">
              <p className="text-gray-400 hover:text-white">Terms</p>
            </Link>
            <Link href="/privacy">
              <p className="text-gray-400 hover:text-white">Privacy</p>
            </Link>
            <Link href="/docs">
              <p className="text-gray-400 hover:text-white">Docs</p>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
