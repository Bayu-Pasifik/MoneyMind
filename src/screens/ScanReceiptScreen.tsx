import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
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
import { CATEGORY_LABEL } from '../utils/categories';
import { formatDate } from '../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanReceipt'>;

type Step = 'capture' | 'processing' | 'review';

type ExtractedReceipt = {
  merchant: string;
  amount: string;
  category: TransactionCategory;
  itemCount: number;
};

const RECEIPT_CATEGORIES: TransactionCategory[] = ['food', 'shopping', 'bills', 'other'];

/** Mocks on-device OCR: a real receipt-parsing model is out of scope here. */
function mockExtractReceipt(): ExtractedReceipt {
  const merchants = ['Warung Makan Sedap', 'Indomaret', 'Alfamart', 'Kopi Kenangan'];
  const merchant = merchants[Math.floor(Math.random() * merchants.length)];
  const amount = String(10000 * Math.ceil(Math.random() * 15));
  const category = RECEIPT_CATEGORIES[Math.floor(Math.random() * RECEIPT_CATEGORIES.length)];
  const itemCount = 1 + Math.floor(Math.random() * 6);
  return { merchant, amount, category, itemCount };
}

export function ScanReceiptScreen({ navigation }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
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

  const processCapture = async (uri: string) => {
    setPhotoUri(uri);
    setStep('processing');
    await new Promise((resolve) => setTimeout(resolve, 600));
    const extracted = mockExtractReceipt();
    setMerchant(extracted.merchant);
    setAmount(extracted.amount);
    setCategory(extracted.category);
    setItemCount(extracted.itemCount);
    setStep('review');
    announce('Receipt scanned, review the details');
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
    const parsedAmount = Number(amount);
    if (!merchant.trim() || !parsedAmount || parsedAmount <= 0) {
      announce('Enter a merchant and a valid amount before saving');
      return;
    }
    const transaction: Transaction = {
      id: `scan-${Date.now()}`,
      title: merchant.trim(),
      merchant: merchant.trim(),
      amount: parsedAmount,
      type: 'expense',
      category,
      date: new Date().toISOString(),
      receiptImageUri: photoUri,
      accountName: 'Cash Wallet',
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
          Review receipt
        </Text>

        {photoUri ? (
          <Image source={{ uri: photoUri }} style={[styles.preview, { borderRadius: radii.lg, marginBottom: spacing.lg }]} />
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
            <View style={[styles.verifiedBadge, { backgroundColor: '#E6FAF4', borderRadius: radii.pill }]}>
              <Ionicons name="checkmark-circle" size={12} color="#00795E" />
              <Text style={styles.verifiedLabel}>AI Verified</Text>
            </View>
          </View>
          <View style={[styles.extractedRow, { borderBottomColor: colors.border }]}>
            <Text style={{ color: colors.textTertiary, fontSize: typography.size.xs }}>Date</Text>
            <Text style={{ color: colors.textPrimary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold }}>
              {formatDate(new Date().toISOString())}
            </Text>
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
                      {CATEGORY_LABEL[option]}
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
          onChangeText={setAmount}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
