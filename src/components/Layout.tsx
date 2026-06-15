import { Outlet, Link, useLocation } from 'react-router';
import { Moon, Sun, List, Plus, Settings, BarChart3 } from 'lucide-react';
import { PWAInstallBanner } from './PWAInstallBanner';

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const showFAB = !location.pathname.startsWith('/add') && !location.pathname.startsWith('/edit');

  return (
    <div className="flex flex-col h-dvh bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {showFAB && (
        null
      )}

      <PWAInstallBanner />

      <nav className="flex items-center justify-around px-2 py-2 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
            isActive('/') 
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <List className="w-5 h-5" />
          <span className="text-xs">Transacciones</span>
        </Link>

        <Link
          to="/reports"
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
            isActive('/reports') 
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs">Reportes</span>
        </Link>

        <Link
          to="/accounts"
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
            isActive('/accounts') 
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs">Config</span>
        </Link>
      </nav>
    </div>
  );
}