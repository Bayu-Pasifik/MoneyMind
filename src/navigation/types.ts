import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabsParamList = {
  Home: undefined;
  Transactions: undefined;
  Analytics: undefined;
  Chat: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  TransactionDetail: { transactionId: string };
  ScanReceipt: undefined;
  ExportSheet: undefined;
  AddTransaction: { transactionId?: string } | undefined;
  CategoryPicker: { transactionId: string };
  BudgetSettings: undefined;
  UpcomingForm: { itemId?: string } | undefined;
  PrivacyPolicy: undefined;
};
