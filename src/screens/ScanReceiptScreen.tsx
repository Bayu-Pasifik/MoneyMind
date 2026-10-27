import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useTransactions } from '../store/TransactionsContext';
import { useAnnounce } from '../hooks/useAnnounce';
import { Transaction, TransactionCategory } from '../types/transaction';
import { RootStackParamList } from '../navigation/types';
import { ScanViewfinder } from '../components/ScanViewfinder';
import { getCategoryLabel } from '../utils/categories';
import { formatAmountInput, formatDate, parseAmountInput } from '../utils/format';
import { fromDateInputValue, toDateInputValue } from '../utils/dateInput';
import { extractReceiptFromImage, OcrError } from '../utils/ocr';
import { useLocale } from '../i18n/LocaleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanReceipt'>;

type Step = 'capture' | 'processing' | 'review';

const RECEIPT_CATEGORIES: TransactionCategory[] = ['food', 'shopping', 'bills', 'other'];

export function ScanReceiptScreen({ navigation }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const { t, locale } = useLocale();
  const { addTransaction } = useTransactions();
  const announce = useAnnounce();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>('capture');
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('food');
  const [itemCount, setItemCount] = useState(1);
  const [dateText, setDateText] = useState(toDateInputValue(new Date().toISOString()));
  const [ocrVerified, setOcrVerified] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const processCapture = async (uri: string) => {
    setPhotoUri(uri);
    setStep('processing');
    setOcrError(null);
    try {
      const extracted = await extractReceiptFromImage(uri);
      setMerchant(extracted.merchant);
      setAmount(formatAmountInput(String(extracted.amount)));
      setCategory(extracted.category);
      setItemCount(extracted.itemCount);
      setDateText(toDateInputValue(new Date().toISOString()));
      setOcrVerified(true);
      setStep('review');
      announce('Receipt scanned, review the details');
    } catch (error) {
      console.log('[OCR] error:', error);
      const message = error instanceof OcrError ? error.message : 'Could not read this receipt. Try again or enter it manually.';
      setMerchant('');
      setAmount('');
      setCategory('other');
      setItemCount(1);
      setDateText(toDateInputValue(new Date().toISOString()));
      setOcrVerified(false);
      setOcrError(message);
      setStep('review');
      announce(message);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef) return;
    const photo = await cameraRef.takePictureAsync({ quality: 0.6 });
    if (photo?.uri) {
      await processCapture(photo.uri);
    }
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!result.canceled && result.assets[0]) {
      await processCapture(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const parsedAmount = parseAmountInput(amount);
    if (!merchant.trim() || !parsedAmount || parsedAmount <= 0) {
      announce('Enter a merchant and a valid amount before saving');
      return;
    }
    const date = fromDateInputValue(dateText);
    if (!date) {
      announce('Enter the date as YYYY-MM-DD');
      return;
    }
    const transaction: Transaction = {
      id: `scan-${Date.now()}`,
      title: merchant.trim(),
      merchant: merchant.trim(),
      amount: parsedAmount,
      type: 'expense',
      category,
      date,
      receiptImageUri: photoUri,
      accountName: 'Cash Wallet',
      source: 'scan',
    };
    addTransaction(transaction);
    announce('Receipt saved as a new expense');
    navigation.goBack();
  };

  if (step === 'capture') {
    if (!permission) {
      return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} />;
    }

    if (!permission.granted) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background, padding: spacing.xl }]}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: typography.size.lg,
              fontWeight: typography.weight.semibold,
              marginBottom: spacing.md,
            }}
          >
            Camera access needed
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.md, marginBottom: spacing.lg }}>
            MoneyMind needs camera access to scan receipts. You can also pick a photo from your library instead.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={requestPermission}
            style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md }]}
          >
            <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>
              Grant camera access
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handlePickFromGallery}
            style={[styles.secondaryButton, { borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.md }]}
          >
            <Text style={{ color: colors.textPrimary, fontWeight: typography.weight.semibold }}>
              Choose from gallery
            </Text>
          </Pressable>
        </SafeAreaView>
      );
    }

    return (
      <View style={styles.container}>
        <CameraView ref={setCameraRef} style={styles.camera} facing="back" />
        <SafeAreaView style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
            hitSlop={8}
            onPress={() => navigation.goBack()}
            style={[styles.closeButton, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radii.pill }]}
          >
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <View style={styles.viewfinderWrap}>
            <ScanViewfinder />
          </View>
          <View style={styles.bottomControls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Pick from gallery"
              onPress={handlePickFromGallery}
              style={[styles.galleryButton, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radii.pill }]}
            >
              <Ionicons name="images-outline" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Capture receipt"
              onPress={handleCapture}
              style={styles.shutterButton}
            >
              <View style={styles.shutterInner} />
            </Pressable>
            <View style={styles.galleryButton} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (step === 'processing') {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={{ color: colors.textSecondary, marginTop: spacing.lg }}>Reading receipt…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          accessibilityRole="header"
          style={{
            color: colors.textPrimary,
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            marginBottom: spacing.lg,
          }}
        >
          Review receipt
        </Text>

        {photoUri ? (
          <Image source={{ uri: photoUri }} style={[styles.preview, { borderRadius: radii.lg, marginBottom: spacing.lg }]} />
        ) : null}

        {ocrError ? (
          <View
            style={[
              styles.errorBanner,
              { backgroundColor: '#FEF0F0', borderColor: colors.dangerText, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.lg },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={18} color={colors.dangerText} />
            <Text style={{ color: colors.dangerText, fontSize: typography.size.sm, marginLeft: spacing.sm, flex: 1 }}>
              {ocrError}
            </Text>
          </View>
        ) : null}

        <View
          style={[
            styles.extractedCard,
            { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.card, padding: spacing.lg, marginBottom: spacing.lg },
          ]}
        >
          <View style={styles.extractedHeader}>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
              Extracted details
            </Text>
            {ocrVerified ? (
              <View style={[styles.verifiedBadge, { backgroundColor: '#E6FAF4', borderRadius: radii.pill }]}>
                <Ionicons name="checkmark-circle" size={12} color="#00795E" />
                <Text style={styles.verifiedLabel}>OCR Verified</Text>
              </View>
            ) : (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill }]}>
                <Ionicons name="create-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.verifiedLabel, { color: colors.textSecondary }]}>Needs review</Text>
              </View>
            )}
          </View>
          <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginBottom: 4 }}>Date</Text>
            <TextInput
              value={dateText}
              onChangeText={setDateText}
              accessibilityLabel="Receipt date"
              placeholder={toDateInputValue(new Date().toISOString())}
              placeholderTextColor={colors.textTertiary}
              style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, padding: 0 }}
            />
            {fromDateInputValue(dateText) ? (
              <Text style={{ color: colors.textTertiary, fontSize: 11, marginTop: 2 }}>
                {formatDate(fromDateInputValue(dateText)!, locale)}
              </Text>
            ) : (
              <Text style={{ color: colors.dangerText, fontSize: 11, marginTop: 2 }}>
                Use format YYYY-MM-DD
              </Text>
            )}
          </View>
          <View style={[styles.extractedRow, { borderBottomColor: colors.border }]}>
            <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs }}>Items</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
              {itemCount} item{itemCount === 1 ? '' : 's'}
            </Text>
          </View>
          <View style={{ marginTop: spacing.sm }}>
            <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs, marginBottom: spacing.xs }}>Category</Text>
            <View style={styles.categoryRow}>
              {RECEIPT_CATEGORIES.map((option) => {
                const selected = option === category;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setCategory(option)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: selected ? colors.primaryLight : colors.surfaceAlt,
                        borderColor: selected ? colors.primary : 'transparent',
                        borderRadius: radii.pill,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: 4,
                      },
                    ]}
                  >
                    <Text style={{ color: selected ? colors.primary : colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
                      {getCategoryLabel(t, option)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          Merchant
        </Text>
        <TextInput
          value={merchant}
          onChangeText={setMerchant}
          accessibilityLabel="Merchant"
          placeholder="Merchant name"
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.input,
            { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.lg },
          ]}
        />

        <Text style={{ color: colors.textSecondary, fontSize: typography.size.sm, marginBottom: spacing.xs }}>
          Amount
        </Text>
        <TextInput
          value={amount}
          onChangeText={(text) => setAmount(formatAmountInput(text))}
          accessibilityLabel="Amount"
          placeholder="0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numeric"
          style={[
            styles.input,
            { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, marginBottom: spacing.xxl },
          ]}
        />

        <Pressable
          accessibilityRole="button"
          onPress={handleSave}
          style={[styles.primaryButton, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md }]}
        >
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold }}>
            Save as expense
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setStep('capture')}
          style={[styles.secondaryButton, { borderColor: colors.border, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.md }]}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: typography.weight.semibold }}>
            Retake
          </Text>
        </Pressable>
      </ScrollView>
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
  },
  viewfinderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  galleryButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  preview: {
    width: '100%',
    height: 220,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  extractedCard: {
    borderWidth: 1,
  },
  extractedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedLabel: {
    color: '#00795E',
    fontSize: 11,
    fontWeight: '600',
  },
  extractedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryButton: {
    alignItems: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    borderWidth: 1,
  },
});
