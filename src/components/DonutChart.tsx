import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { CategoryBreakdown } from '../utils/analytics';
import { CATEGORY_CHART_COLORS, CATEGORY_LABEL } from '../utils/categories';

type Props = {
  data: CategoryBreakdown[];
  size?: number;
  strokeWidth?: number;
};

export function DonutChart({ data, size = 180, strokeWidth = 22 }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetSoFar = 0;

  const summary = data
    .map((slice) => `${CATEGORY_LABEL[slice.category]} ${Math.round(slice.ratio * 100)} percent`)
    .join(', ');

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Spending by category: ${summary}`}
    >
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {data.map((slice) => {
            const sliceLength = circumference * slice.ratio;
            const dashArray = `${sliceLength} ${circumference - sliceLength}`;
            const strokeDashoffset = -offsetSoFar;
            offsetSoFar += sliceLength;

            return (
              <Circle
                key={slice.category}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={CATEGORY_CHART_COLORS[slice.category]}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={strokeDashoffset}
                fill="none"
                strokeLinecap="butt"
              />
            );
          })}
        </G>
      </Svg>
      </View>
    </View>
  );
}
