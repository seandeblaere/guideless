import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  textColor?: string;
  backgroundColor?: string;
}

export function Button({ 
  title, 
  loading = false,
  textColor = '#FFFFFF',
  backgroundColor = '#2563EB',
  variant = 'primary',
  disabled,
  style,
  ...props 
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor: backgroundColor },
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[
          { fontFamily: 'DMSans-Regular' },
          styles.buttonText,
          { color: textColor },
          isDisabled && styles.disabledButtonText,
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButton: {
    elevation: 2,
    shadowColor: '#2E3A59',
    shadowOffset: {
      width: 0.5,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2E3A59',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
  },
  disabledButtonText: {
    opacity: 0.7,
  },
});