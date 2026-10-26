import { TransactionSource } from '../types/transaction';
import { TFunction } from '../i18n/LocaleContext';

export function getSourceLabel(t: TFunction, source: TransactionSource): string {
  return t(`source.${source}`);
}

export const SOURCE_ICON: Record<TransactionSource, 'create-outline' | 'camera-outline' | 'flash-outline'> = {
  manual: 'create-outline',
  scan: 'camera-outline',
  notification: 'flash-outline',
};
