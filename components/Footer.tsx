import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5">
      <div className="mx-auto px-4 py-12 max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Project</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-gray-500 hover:text-gray-300">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/examples" className="text-sm text-gray-500 hover:text-gray-300">
                  Examples
                </Link>
              </li>
              <li>
                <Link href="/playground" className="text-sm text-gray-500 hover:text-gray-300">
                  Playground
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Ecosystem</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-500">@msn/parser</span>
              </li>
              <li>
                <span className="text-sm text-gray-500">@msn/cli</span>
              </li>
              <li>
                <span className="text-sm text-gray-500">VS Code Extension</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Community</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/sammadijaz/msn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-500 hover:text-gray-300"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/contribute" className="text-sm text-gray-500 hover:text-gray-300">
                  Contributing
                </Link>
              </li>
              <li>
                <Link href="/comparison" className="text-sm text-gray-500 hover:text-gray-300">
                  Comparisons
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm text-gray-500">MIT License</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 text-center border-t border-white/5">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Mad Sam Notation. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  );
}
