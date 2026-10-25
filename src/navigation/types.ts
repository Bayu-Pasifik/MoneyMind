export type MainTabsParamList = {
  Home: undefined;
  Transactions: undefined;
  Analytics: undefined;
  Chat: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  TransactionDetail: { transactionId: string };
  ScanReceipt: undefined;
  ExportSheet: undefined;
};
