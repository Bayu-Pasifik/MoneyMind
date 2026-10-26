import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useLocale } from '../i18n/LocaleContext';
import { TabIcon } from '../components/TabIcon';
import { MainTabsParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabsParamList>();

const TAB_ICON: Record<keyof MainTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Transactions: 'list-outline',
  Analytics: 'stats-chart-outline',
  Chat: 'chatbubble-ellipses-outline',
  Settings: 'settings-outline',
};

export function MainTabs() {
  const { colors } = useTheme();
  const { t } = useLocale();

  const TAB_LABEL: Record<keyof MainTabsParamList, string> = {
    Home: t('tabs.home'),
    Transactions: t('tabs.transactions'),
    Analytics: t('tabs.analytics'),
    Chat: t('tabs.chat'),
    Settings: t('tabs.settings'),
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabel: TAB_LABEL[route.name as keyof MainTabsParamList],
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size, focused }) => (
          <TabIcon name={TAB_ICON[route.name as keyof MainTabsParamList]} size={size} color={color} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
