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
import { useLocale } from '../i18n/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ExportSheet'>;

type ExportFormat = 'csv' | 'pdf' | 'image';

export function ExportSheetScreen({ navigation }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t, locale } = useLocale();
  const { transactions } = useTransactions();
  const announce = useAnnounce();
  const [range, setRange] = useState<ExportRange>('thisMonth');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<React.ComponentRef<typeof View>>(null);

  const RANGE_OPTIONS: { key: ExportRange; label: string }[] = [
    { key: 'thisMonth', label: t('export.rangeThisMonth') },
    { key: 'all', label: t('export.rangeAllTime') },
  ];

  const FORMAT_OPTIONS: { key: ExportFormat; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'csv', label: t('export.formatCsv'), icon: 'grid-outline' },
    { key: 'pdf', label: t('export.formatPdf'), icon: 'document-text-outline' },
    { key: 'image', label: t('export.formatImage'), icon: 'image-outline' },
  ];

  const filtered = filterByRange(transactions, range);
  const income = filtered.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const expense = filtered.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  const rangeLabel = RANGE_OPTIONS.find((option) => option.key === range)?.label ?? '';

  const handleExport = async () => {
    if (filtered.length === 0) {
      announce(t('export.nothingToExport'));
      return;
    }

    setIsExporting(true);
    try {
      if (format === 'csv') {
        const csv = transactionsToCsv(filtered);
        const fileUri = `${FileSystem.cacheDirectory}moneymind-export-${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csv);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: t('export.title') });
        }
      } else if (format === 'pdf') {
        const html = transactionsToReportHtml(filtered, rangeLabel, t, locale);
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: t('export.title') });
        }
      } else {
        const uri = await captureRef(previewRef, { format: 'png', quality: 1 });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: t('export.title') });
        }
      }
      announce(t('export.exported'));
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
          {t('export.title')}
        </Text>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.sm }}>
          {t('export.range')}
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
          {t('export.format')}
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
          accessibilityLabel={t('export.title')}
          disabled={isExporting}
          onPress={handleExport}
          style={[
            styles.exportButton,
            { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md, opacity: isExporting ? 0.6 : 1 },
          ]}
        >
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>
            {isExporting
              ? t('export.exporting')
              : t('export.exportButton', { format: FORMAT_OPTIONS.find((o) => o.key === format)?.label ?? '' })}
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
