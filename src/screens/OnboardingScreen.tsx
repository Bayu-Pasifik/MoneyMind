import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAnnounce } from '../hooks/useAnnounce';

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    icon: 'wallet-outline',
    title: 'Track every rupiah',
    description: 'Log income and expenses in seconds and always know where your money goes.',
  },
  {
    icon: 'camera-outline',
    title: 'Scan receipts instantly',
    description: 'Snap a photo of a receipt and let MoneyMind fill in the details for you.',
  },
  {
    icon: 'stats-chart-outline',
    title: 'See the bigger picture',
    description: 'Visual breakdowns and an AI assistant help you understand your spending habits.',
  },
];

type Props = {
  onDone: () => void;
};

const { width } = Dimensions.get('window');

export function OnboardingScreen({ onDone }: Props) {
  const { colors, spacing, radii, typography } = useTheme();
  const announce = useAnnounce();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const goToIndex = (next: number) => {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    setIndex(next);
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setIndex(next);
  };

  const handleNext = () => {
    if (isLast) {
      announce('Onboarding complete');
      onDone();
    } else {
      goToIndex(index + 1);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topRow, { paddingHorizontal: spacing.lg, paddingTop: spacing.sm }]}>
        <View style={{ flex: 1 }} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          onPress={onDone}
        >
          <Text style={{ color: colors.textSecondary, fontSize: typography.size.md }}>Skip</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width, paddingHorizontal: spacing.xxl }]}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.surfaceAlt, borderRadius: radii.pill, marginBottom: spacing.xxl },
              ]}
            >
              <Ionicons name={slide.icon} size={48} color={colors.primary} />
            </View>
            <Text
              accessibilityRole="header"
              style={{
                color: colors.textPrimary,
                fontSize: typography.size.xxl,
                fontWeight: typography.weight.bold,
                textAlign: 'center',
                marginBottom: spacing.md,
              }}
            >
              {slide.title}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: typography.size.md,
                textAlign: 'center',
              }}
            >
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.dotsRow, { marginBottom: spacing.xl }]}>
        {SLIDES.map((slide, slideIndex) => (
          <View
            key={slide.title}
            style={[
              styles.dot,
              {
                backgroundColor: slideIndex === index ? colors.primary : colors.border,
                borderRadius: radii.pill,
                width: slideIndex === index ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Get started' : 'Next'}
          onPress={handleNext}
          style={[styles.nextButton, { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md }]}
        >
          <Text style={{ color: colors.primaryText, fontWeight: typography.weight.semibold, fontSize: typography.size.md }}>
            {isLast ? 'Get started' : 'Next'}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
  },
  nextButton: {
    alignItems: 'center',
  },
});
