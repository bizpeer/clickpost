import React, { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from './themed-text';

export type ThemedInputProps = TextInputProps & {
  label?: string;
  error?: string;
  lightColor?: string;
  darkColor?: string;
};

export function ThemedInput({
  label,
  error,
  style,
  lightColor,
  darkColor,
  onFocus,
  onBlur,
  ...rest
}: ThemedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const iconColor = useThemeColor({ light: lightColor, dark: darkColor }, 'icon');
  
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.container}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <View style={[
        styles.inputWrapper,
        { borderColor: error ? '#FF3B30' : isFocused ? '#FF3B30' : iconColor },
        isFocused && styles.inputFocused
      ]}>
        <TextInput
          style={[styles.input, { color: textColor }, style]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#94a3b8"
          {...rest}
        />
      </View>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#64748b',
  },
  inputWrapper: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    justifyContent: 'center',
    transitionProperty: 'border-color, shadow-color',
    transitionDuration: '200ms',
  } as any,
  inputFocused: {
    backgroundColor: '#fff',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  input: {
    fontSize: 16,
    height: '100%',
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
    fontWeight: '600',
  },
});
