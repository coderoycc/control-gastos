export type ConfigTab = 'accounts' | 'labels' | 'limits' | 'data';

export interface DeleteTarget {
  type: 'account' | 'label' | 'limit';
  id: string;
}
