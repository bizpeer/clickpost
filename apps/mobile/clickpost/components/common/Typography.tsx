import React from 'react';
import { Text, TextStyle, useColorScheme } from 'react-native';
import { Colors } from '../../constants/theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' | 'tiny';
  color?: string;
  bold?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  color,
  bold = false,
  style,
  numberOfLines,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return { fontSize: 28, fontWeight: '800', lineHeight: 34 };
      case 'h2':
        return { fontSize: 22, fontWeight: '700', lineHeight: 28 };
      case 'h3':
        return { fontSize: 18, fontWeight: '600', lineHeight: 24 };
      case 'body':
        return { fontSize: 16, fontWeight: '400', lineHeight: 22 };
      case 'caption':
        return { fontSize: 12, fontWeight: '400', lineHeight: 16, opacity: 0.7 };
      case 'label':
        return { fontSize: 14, fontWeight: '600', lineHeight: 20 };
      case 'tiny':
        return { fontSize: 10, fontWeight: '400', lineHeight: 14, opacity: 0.5 };
      default:
        return { fontSize: 16, fontWeight: '400', lineHeight: 22 };
    }
  };

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        getVariantStyle(),
        { color: color || theme.text },
        bold && { fontWeight: 'bold' },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
