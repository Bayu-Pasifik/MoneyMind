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
  Accounts: undefined;
  AccountForm: { accountId?: string } | undefined;
  AdjustBalance: { accountId: string };
  Goals: undefined;
  GoalForm: { goalId?: string } | undefined;
  GoalMove: { goalId: string; mode: 'deposit' | 'withdraw' };
  PrivacyPolicy: undefined;
  EditProfile: undefined;
  AppLockSetup: { mode: 'setup' | 'change' | 'disable' };
};
