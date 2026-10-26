import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { useTelegram } from '../store/TelegramContext';
import { ChatBubble } from '../components/ChatBubble';
import { TelegramConnectBanner } from '../components/TelegramConnectBanner';
import { generateAssistantReply, parseAddCommand } from '../utils/chatBot';
import { useAnnounce } from '../hooks/useAnnounce';
import { useLocale } from '../i18n/LocaleContext';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'telegram';
  text: string;
};

const SLASH_COMMANDS = ['/summary', '/balance', '/add expense 20000 food Lunch', '/budget', '/report'];

export function ChatScreen() {
  const { colors, spacing, radii, typography } = useTheme();
  const { t } = useLocale();
  const { transactions, addTransaction } = useTransactions();
  const { connected } = useTelegram();
  const announce = useAnnounce();
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', text: t('chat.welcome') },
  ]);
  const [draft, setDraft] = useState('');

  const suggestions = [
    t('chat.suggestion.spend'),
    t('chat.suggestion.balance'),
    t('chat.suggestion.topCategory'),
  ];

  const sendMessage = (text: string, role: 'user' | 'telegram' = 'user') => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = { id: `u-${Date.now()}`, role, text: trimmed };

    const addCommand = parseAddCommand(trimmed, t);
    const reply = addCommand ? addCommand.reply : generateAssistantReply(trimmed, transactions, t);
    if (addCommand?.transaction) {
      addTransaction(addCommand.transaction);
    }

    const assistantMessage: Message = { id: `a-${Date.now()}`, role: 'assistant', text: reply };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setDraft('');
    announce(reply);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        accessibilityRole="header"
        style={{
          color: colors.textPrimary,
          fontSize: typography.size.xxl,
          fontWeight: typography.weight.bold,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
        }}
      >
        {t('chat.title')}
      </Text>

      <TelegramConnectBanner />

      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}
          renderItem={({ item }) => <ChatBubble text={item.text} role={item.role} />}
        />

        {connected ? (
          <View style={[styles.suggestionsRow, { paddingHorizontal: spacing.lg, marginBottom: spacing.xs }]}>
            {SLASH_COMMANDS.map((command) => (
              <Pressable
                key={command}
                accessibilityRole="button"
                onPress={() => sendMessage(command)}
                style={[
                  styles.suggestionChip,
                  { backgroundColor: '#E3F5FC', borderColor: '#B8E4F5', borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
                ]}
              >
                <Text style={{ color: colors.telegram, fontSize: typography.size.xs, fontWeight: typography.weight.semibold }}>
                  {command}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={[styles.suggestionsRow, { paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              accessibilityRole="button"
              onPress={() => sendMessage(suggestion)}
              style={[
                styles.suggestionChip,
                { borderColor: colors.border, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
              ]}
            >
              <Text style={{ color: colors.textSecondary, fontSize: typography.size.xs }}>{suggestion}</Text>
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.inputRow,
            { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderTopColor: colors.border },
          ]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('chat.inputPlaceholder')}
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={t('chat.inputPlaceholder')}
            onSubmitEditing={() => sendMessage(draft)}
            style={[
              styles.input,
              { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill, paddingHorizontal: spacing.lg },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('chat.send')}
            onPress={() => sendMessage(draft)}
            style={[styles.sendButton, { backgroundColor: colors.primary, borderRadius: radii.pill, marginLeft: spacing.sm }]}
          >
            <Ionicons name="arrow-up" size={20} color={colors.primaryText} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexFill: {
    flex: 1,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
  },
  sendButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
