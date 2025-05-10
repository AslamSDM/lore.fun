import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#b99be680] py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-violet-400 font-medieval">
              LORE.FUN
            </h3>
            <p className="text-gray-400 mt-2">
              Collaborative storytelling powered by $LORE tokens
            </p>
          </div>

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div>
              <h4 className="text-lg font-medieval text-violet-300 mb-2">
                LINKS
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/">
                    <div className="text-gray-400 hover:text-violet-300 transition duration-300">
                      Home
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/create-story">
                    <div className="text-gray-400 hover:text-violet-300 transition duration-300">
                      Create Story
                    </div>
                  </Link>
                </li>
                <li>
                  <Link href="/profile">
                    <div className="text-gray-400 hover:text-violet-300 transition duration-300">
                      Profile
                    </div>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-medieval text-violet-300 mb-2">
                COMMUNITY
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://twitter.com/lorefun"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-violet-300 transition duration-300"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.gg/lorefun"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-violet-300 transition duration-300"
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/lorefun"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-violet-300 transition duration-300"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Lore.fun. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
