import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  PieChart as PieChartIcon,
  AlignLeft as LinesIcon,
  BarChart2 as SummaryIcon,
} from 'lucide-react';
import { ViewMode } from '../../utils/chartUtils';

interface ViewModeDropdownProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const VIEW_MODE_OPTIONS: { mode: ViewMode; label: string; Icon: React.ElementType }[] = [
  { mode: 'pie', label: 'Gráfico', Icon: PieChartIcon },
  { mode: 'lines', label: 'Líneas', Icon: LinesIcon },
  { mode: 'summary', label: 'Resumen', Icon: SummaryIcon },
];

export function ViewModeDropdown({ viewMode, onViewModeChange }: ViewModeDropdownProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleSelectMode = (mode: ViewMode) => {
    onViewModeChange(mode);
    setMenuOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(prev => !prev)}
        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Opciones de visualización"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {VIEW_MODE_OPTIONS.map(({ mode, label, Icon }) => (
            <button
              key={mode}
              onClick={() => handleSelectMode(mode)}
              className={`w-full px-4 py-2.5 flex items-center gap-3 text-xs font-semibold transition-colors ${
                viewMode === mode
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {viewMode === mode && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
