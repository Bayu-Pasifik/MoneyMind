import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { transactionsToCsv } from '../utils/csv';
import { transactionsToReportHtml } from '../utils/pdf';
import { filterByRange, ExportRange } from '../utils/dateRange';
import { useAnnounce } from '../hooks/useAnnounce';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { ExportPreviewCard } from '../components/ExportPreviewCard';

type Props = NativeStackScreenProps<RootStackParamList, 'ExportSheet'>;

type ExportFormat = 'csv' | 'pdf' | 'image';

const RANGE_OPTIONS: { key: ExportRange; label: string }[] = [
  { key: 'thisMonth', label: 'This month' },
  { key: 'all', label: 'All time' },
];

const FORMAT_OPTIONS: { key: ExportFormat; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'csv', label: 'CSV', icon: 'grid-outline' },
  { key: 'pdf', label: 'PDF', icon: 'document-text-outline' },
  { key: 'image', label: 'Image', icon: 'image-outline' },
];

export function ExportSheetScreen({ navigation }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { transactions } = useTransactions();
  const announce = useAnnounce();
  const [range, setRange] = useState<ExportRange>('thisMonth');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<React.ComponentRef<typeof View>>(null);

  const filtered = filterByRange(transactions, range);
  const income = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const rangeLabel = RANGE_OPTIONS.find((option) => option.key === range)?.label ?? '';

  const handleExport = async () => {
    if (filtered.length === 0) {
      announce('There is nothing to export for this range');
      return;
    }

    setIsExporting(true);
    try {
      if (format === 'csv') {
        const csv = transactionsToCsv(filtered);
        const fileUri = `${FileSystem.cacheDirectory}moneymind-export-${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csv);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export report' });
        }
      } else if (format === 'pdf') {
        const html = transactionsToReportHtml(filtered, rangeLabel);
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Export report' });
        }
      } else {
        const uri = await captureRef(previewRef, { format: 'png', quality: 1 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share report' });
        }
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
        <View style={[styles.optionRow, { marginBottom: spacing.lg }]}>
          {RANGE_OPTIONS.map((option) => {
            const selected = option.key === range;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setRange(option.key)}
                style={[
                  styles.chip,
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

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.sm }}>
          Format
        </Text>
        <View style={[styles.optionRow, { marginBottom: spacing.lg }]}>
          {FORMAT_OPTIONS.map((option) => {
            const selected = option.key === format;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setFormat(option.key)}
                style={[
                  styles.formatChip,
                  {
                    backgroundColor: selected ? colors.primaryLight : colors.surface,
                    borderColor: selected ? colors.primary : colors.border,
                    borderRadius: radii.md,
                    padding: spacing.sm,
                    marginRight: spacing.sm,
                  },
                ]}
              >
                <Ionicons name={option.icon} size={18} color={selected ? colors.primary : colors.textSecondary} />
                <Text style={{ color: selected ? colors.primary : colors.textPrimary, fontWeight: typography.weight.semibold, fontSize: typography.size.xs, marginTop: 4 }}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <ExportPreviewCard ref={previewRef} income={income} expense={expense} count={filtered.length} rangeLabel={rangeLabel} />
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
            {isExporting ? 'Exporting…' : `Export ${FORMAT_OPTIONS.find((o) => o.key === format)?.label}`}
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
  optionRow: {
    flexDirection: 'row',
  },
  chip: {
    borderWidth: 1,
  },
  formatChip: {
    alignItems: 'center',
    borderWidth: 1,
    width: 72,
  },
  exportButton: {
    alignItems: 'center',
  },
});
