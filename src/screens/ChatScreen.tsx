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
import { generateAssistantReply } from '../utils/chatBot';
import { useAnnounce } from '../hooks/useAnnounce';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'telegram';
  text: string;
};

const SUGGESTIONS = ['How much did I spend?', 'What is my balance?', 'Top category?'];
const SLASH_COMMANDS = ['/summary', '/balance', '/add expense', '/budget', '/report'];

export function ChatScreen() {
  const { colors, spacing, radii, typography } = useTheme();
  const { transactions } = useTransactions();
  const { connected } = useTelegram();
  const announce = useAnnounce();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your MoneyMind assistant. Ask me about your balance, spending, or budget.",
    },
  ]);
  const [draft, setDraft] = useState('');

  const sendMessage = (text: string, role: 'user' | 'telegram' = 'user') => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = { id: `u-${Date.now()}`, role, text: trimmed };
    const reply = generateAssistantReply(trimmed, transactions);
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
        AI Chat
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
          {SUGGESTIONS.map((suggestion) => (
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
            placeholder="Ask about your money…"
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel="Message"
            onSubmitEditing={() => sendMessage(draft)}
            style={[
              styles.input,
              { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.pill, paddingHorizontal: spacing.lg },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
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
