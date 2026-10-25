import { TransactionSource } from '../types/transaction';

export const SOURCE_LABEL: Record<TransactionSource, string> = {
  manual: 'Manual',
  scan: 'Scanned',
  notification: 'Auto',
};

export const SOURCE_ICON: Record<TransactionSource, 'create-outline' | 'camera-outline' | 'flash-outline'> = {
  manual: 'create-outline',
  scan: 'camera-outline',
  notification: 'flash-outline',
};
