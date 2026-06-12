export type ConfigTab = 'accounts' | 'labels' | 'limits' | 'data' | 'security';

export interface DeleteTarget {
  type: 'account' | 'label' | 'limit';
  id: string;
}
