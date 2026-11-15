export interface SpendingLimit {
  id: string;
  title: string;
  amount: number;
  enabled: boolean;
  /**
   * ID de la cuenta a la que aplica este límite,
   * o null/undefined para indicar que aplica globalmente a 'Todas las cuentas'.
   */
  accountId?: string | null;
}

export type LimitAlertType = 'warning_90' | 'danger_100';

export interface LimitStatus {
  activeLimit: SpendingLimit;
  monthlyExpensesTotalWithoutCurrent: number;
  totalWithCurrent: number;
  percentage: number;
  alertType: LimitAlertType | null;
}
