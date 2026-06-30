import { useState, useCallback, useRef, useEffect } from 'react';
import { Settings, CreditCard, Tags, DollarSign, Database, Shield, Moon, Sun } from 'lucide-react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { AccountSection } from './AccountSection';
import { LabelSection } from './LabelSection';
import { LimitSection } from './LimitSection';
import { DataSection } from './DataSection';
import { SecuritySection } from './SecuritySection';
import type { DeleteTarget } from '../types';
import { useData } from '../../context';
import { useTheme } from '../../context/ThemeContext';
import { useHorizontalSwipe } from '../../../hooks/useHorizontalSwipe';

type TabKey = 'accounts' | 'labels' | 'limits' | 'security' | 'data';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: typeof Settings;
}

const TABS: TabConfig[] = [
  { key: 'accounts', label: 'Cuentas', icon: CreditCard },
  { key: 'labels', label: 'Etiquetas', icon: Tags },
  { key: 'limits', label: 'Límites', icon: DollarSign },
  { key: 'security', label: 'Seguridad', icon: Shield },
  { key: 'data', label: 'Datos', icon: Database },
];

export function ConfigScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('accounts');
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { deleteAccount, deleteLabel, deleteSpendingLimit } = useData();

  const tabBarRef = useRef<HTMLDivElement>(null);
  const activeIndex = TABS.findIndex(t => t.key === activeTab);

  // Auto-scroll la barra de tabs para mantener el tab activo visible
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const activeBtn = bar.children[activeIndex] as HTMLElement | undefined;
    if (!activeBtn) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const scrollLeft = bar.scrollLeft + (btnRect.left - barRect.left) - barRect.width / 2 + btnRect.width / 2;
    bar.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [activeIndex]);

  const cycleTab = useCallback((direction: 'left' | 'right') => {
    setActiveTab(current => {
      const idx = TABS.findIndex(t => t.key === current);
      if (direction === 'left') {
        return TABS[Math.min(idx + 1, TABS.length - 1)].key;
      } else {
        return TABS[Math.max(idx - 1, 0)].key;
      }
    });
  }, []);

  const swipeRef = useHorizontalSwipe(
    {
      onSwipeLeft: () => cycleTab('left'),
      onSwipeRight: () => cycleTab('right'),
    },
    {
      threshold: 40,
      velocityThreshold: 0.2,
      preventScrollOnSwipe: true,
    },
  );

  const handleDelete = useCallback(
    (id: string) => {
      const type = activeTab === 'accounts' ? 'account' : activeTab === 'labels' ? 'label' : 'limit';
      setDeleteTarget({ type, id });
    },
    [activeTab],
  );

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    switch (deleteTarget.type) {
      case 'account':
        deleteAccount(deleteTarget.id);
        break;
      case 'label':
        deleteLabel(deleteTarget.id);
        break;
      case 'limit':
        deleteSpendingLimit(deleteTarget.id);
        break;
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteAccount, deleteLabel, deleteSpendingLimit]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Configuraciones
            </h2>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
          </button>
        </div>

        {/* Tabs - scrollable horizontal */}
        <div ref={tabBarRef} className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/10'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content — área swipeable */}
      <div
        ref={swipeRef}
        className="flex-1 flex flex-col overflow-hidden bg-gray-50/50 dark:bg-gray-950/20"
      >
        {activeTab === 'accounts' && <AccountSection onDelete={handleDelete} />}
        {activeTab === 'labels' && <LabelSection onDelete={handleDelete} />}
        {activeTab === 'limits' && <LimitSection onDelete={handleDelete} />}
        {activeTab === 'security' && <SecuritySection />}
        {activeTab === 'data' && <DataSection />}
      </div>

      {/* Global Delete Confirmation */}
      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

