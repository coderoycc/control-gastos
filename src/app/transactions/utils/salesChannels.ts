import type { SalesChannel } from '../../context/types';

export interface SalesChannelConfig {
  id: SalesChannel;
  name: string;
  icon: string; // Emoji o identificador
  badgeColor: string;
  bgLight: string;
  textColor: string;
}

export const SALES_CHANNELS: SalesChannelConfig[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    badgeColor: 'bg-emerald-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    badgeColor: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
    bgLight: 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    textColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'marketplace',
    name: 'Marketplace / FB',
    icon: '🛍️',
    badgeColor: 'bg-blue-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    badgeColor: 'bg-slate-900',
    bgLight: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    textColor: 'text-slate-800 dark:text-slate-200',
  },
  {
    id: 'feria',
    name: 'Feria / Local',
    icon: '🏪',
    badgeColor: 'bg-amber-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'otro',
    name: 'Otro',
    icon: '📦',
    badgeColor: 'bg-gray-500',
    bgLight: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    textColor: 'text-gray-600 dark:text-gray-400',
  },
];

export function getChannelConfig(channel?: SalesChannel): SalesChannelConfig | undefined {
  if (!channel) return undefined;
  return SALES_CHANNELS.find((c) => c.id === channel);
}
