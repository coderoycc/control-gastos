import type { SalesChannel } from '../../../context/types';
import { SALES_CHANNELS } from '../../utils/salesChannels';
import { CheckCircle2, Clock } from 'lucide-react';

interface SalesChannelSelectorProps {
  selectedChannel?: SalesChannel;
  onChangeChannel: (channel?: SalesChannel) => void;
  isPending: boolean;
  onTogglePending: (isPending: boolean) => void;
}

export function SalesChannelSelector({
  selectedChannel,
  onChangeChannel,
  isPending,
  onTogglePending,
}: SalesChannelSelectorProps) {
  return (
    <div className="space-y-2.5 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Canal de Venta (Red Social / Origen)
        </label>
        {selectedChannel && (
          <button
            type="button"
            onClick={() => onChangeChannel(undefined)}
            className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline"
          >
            Quitar
          </button>
        )}
      </div>

      {/* Grid de canales de 1 toque */}
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
        {SALES_CHANNELS.map((ch) => {
          const isSelected = selectedChannel === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => onChangeChannel(isSelected ? undefined : ch.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-all active:scale-95 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="text-base leading-none mb-1">{ch.icon}</span>
              <span className="truncate w-full text-center text-[11px] leading-tight">
                {ch.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Estado del cobro: Cobrado vs Por cobrar */}
      <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 flex items-center justify-between">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Estado del cobro:
        </span>
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => onTogglePending(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              !isPending
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Cobrado
          </button>
          <button
            type="button"
            onClick={() => onTogglePending(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              isPending
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Por cobrar
          </button>
        </div>
      </div>
    </div>
  );
}
