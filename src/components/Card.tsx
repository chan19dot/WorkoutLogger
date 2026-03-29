import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../theme';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'flat' | 'outline';
}

export const Card: React.FC<CardProps> = ({ children, variant = 'elevated', style, ...props }) => {
    return (
        <View style={[styles.card, styles[variant], style]} {...props}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    elevated: {
        borderColor: colors.primary,
        borderWidth: 2,
        ...shadows.neon,
    },
    flat: {
        backgroundColor: colors.surfaceLight,
        borderColor: colors.secondary,
        borderWidth: 1,
        ...shadows.pinkGlow,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.accent,
        ...shadows.limeGlow,
    },
});
