import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen,
  Code2,
  LayoutDashboard,
  Map,
  Menu,
  MessageSquare,
  Moon,
  Settings as SettingsIcon,
  Sun,
  X,
} from "lucide-react";
import { useProgress } from "../hooks/useProgress.js";
import Banner from "./Banner.jsx";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/dsa", label: "DSA", icon: Code2 },
  { to: "/interview", label: "Interview", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function NavList({ onNavigate }) {
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ThemeToggle() {
  const { state, actions } = useProgress();
  const dark = state.settings.theme === "dark";
  return (
    <button
      type="button"
      onClick={() => actions.setTheme(dark ? "light" : "dark")}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {dark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}

export default function Layout() {
  const { storageOk } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu and scroll up when the page changes.
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen lg:flex">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-slate-900"
      >
        Skip to content
      </a>

      {/* Sidebar on desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="sticky top-4 space-y-6">
          <div className="flex items-center gap-2 px-3 text-lg font-bold">
            <BookOpen
              className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
              aria-hidden="true"
            />
            Dev Tracker
          </div>
          <NavList />
          <ThemeToggle />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Top bar on mobile */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-2 font-bold">
              <BookOpen
                className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                aria-hidden="true"
              />
              Dev Tracker
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="rounded p-1"
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          {menuOpen && (
            <div
              id="mobile-menu"
              className="space-y-2 border-t border-slate-200 p-3 dark:border-slate-800"
            >
              <NavList onNavigate={() => setMenuOpen(false)} />
              <ThemeToggle />
            </div>
          )}
        </header>

        {!storageOk && (
          <Banner>
            Browser storage is not available, so progress is kept in memory only
            and will be lost when you close this tab. Use Settings &gt; Export
            to save a copy.
          </Banner>
        )}

        <main id="main" className="mx-auto max-w-5xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
