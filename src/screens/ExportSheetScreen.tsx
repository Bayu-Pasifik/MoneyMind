import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { transactionsToCsv } from '../utils/csv';
import { filterByRange, ExportRange } from '../utils/dateRange';
import { useAnnounce } from '../hooks/useAnnounce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ExportSheet'>;

const RANGE_OPTIONS: { key: ExportRange; label: string }[] = [
  { key: 'thisMonth', label: 'This month' },
  { key: 'all', label: 'All time' },
];

export function ExportSheetScreen({ navigation }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { transactions } = useTransactions();
  const announce = useAnnounce();
  const [range, setRange] = useState<ExportRange>('thisMonth');
  const [isExporting, setIsExporting] = useState(false);

  const filtered = filterByRange(transactions, range);

  const handleExport = async () => {
    if (filtered.length === 0) {
      announce('There is nothing to export for this range');
      return;
    }

    setIsExporting(true);
    try {
      const csv = transactionsToCsv(filtered);
      const fileUri = `${FileSystem.cacheDirectory}moneymind-export-${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export report' });
      }
      announce('Report exported');
      navigation.goBack();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <View style={{ padding: spacing.xl }}>
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.lg,
          }}
        >
          Export report
        </Text>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.sm }}>
          Range
        </Text>
        <View style={[styles.rangeRow, { marginBottom: spacing.xl }]}>
          {RANGE_OPTIONS.map((option) => {
            const selected = option.key === range;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setRange(option.key)}
                style={[
                  styles.rangeChip,
                  {
                    backgroundColor: selected ? colors.primary : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                    borderRadius: radii.pill,
                    paddingHorizontal: spacing.lg,
                    paddingVertical: spacing.sm,
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <Text style={{ color: selected ? colors.primaryText : colors.textPrimary, fontWeight: typography.weight.semibold }}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={[
            styles.summary,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.xl },
          ]}
        >
          <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginLeft: spacing.sm }}>
            {filtered.length} transaction{filtered.length === 1 ? '' : 's'} will be exported as CSV.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Export report"
          disabled={isExporting}
          onPress={handleExport}
          style={[
            styles.exportButton,
            { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md, opacity: isExporting ? 0.6 : 1 },
          ]}
        >
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  rangeRow: {
    flexDirection: 'row',
  },
  rangeChip: {
    borderWidth: 1,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  exportButton: {
    alignItems: 'center',
  },
});
