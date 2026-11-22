import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/' },
  { label: 'Trash', to: '/trash' },
  { label: 'Profile', to: '/profile' },
];

const Navbar = (): React.JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    [
      'text-sm font-medium transition-colors',
      isActive
        ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
    ].join(' ');

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90 transition-colors">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-indigo-600 dark:text-indigo-400"
        >
          📝 Notes
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 sm:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.to === '/'} className={navLinkClass}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Desktop actions: Theme Toggle + Auth */}
        <div className="hidden items-center gap-3 sm:flex">
          <ThemeToggle />
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex flex-col items-center justify-center gap-1.5 p-2"
          >
            <span
              className={`block h-0.5 w-5 bg-gray-700 dark:bg-gray-200 transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}
            />
            <span
              className={`block h-0.5 w-5 bg-gray-700 dark:bg-gray-200 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`}
            />
            <span
              className={`block h-0.5 w-5 bg-gray-700 dark:bg-gray-200 transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 sm:hidden dark:border-gray-800 dark:bg-gray-950">
          <ul className="flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={navLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
