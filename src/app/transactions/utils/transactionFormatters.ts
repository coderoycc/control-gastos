import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatFilterDateRange(startDate: string, endDate: string): string | null {
  if (startDate && endDate) {
    return `${format(parseISO(startDate), "d 'de' MMM", { locale: es })} - ${format(parseISO(endDate), "d 'de' MMM, yyyy", { locale: es })}`;
  }
  return null;
}

export function formatTransactionDate(date: string): string {
  return format(parseISO(date), "d 'de' MMMM, yyyy", { locale: es });
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM', { locale: es });
}

export function formatYear(date: Date): string {
  return format(date, 'yyyy', { locale: es });
}
