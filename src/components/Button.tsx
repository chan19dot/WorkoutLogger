import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../theme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    isLoading,
    style,
    disabled,
    ...props
}) => {
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[variant],
                disabled && styles.disabled,
                style
            ]}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={isOutline || isGhost ? colors.primary : colors.textDark} />
            ) : (
                <Text style={[
                    styles.text,
                    variant === 'primary' ? { color: colors.textDark, fontWeight: '900' } : null,
                    variant === 'secondary' ? { color: colors.text, fontWeight: '900' } : null,
                    isOutline || isGhost ? styles.textOutline : null
                ]}>
                    {title.toUpperCase()}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 60,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
    },
    primary: {
        backgroundColor: colors.primary,
        ...shadows.neon,
    },
    secondary: {
        backgroundColor: colors.secondary,
        ...shadows.pinkGlow,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        ...typography.h3,
        color: colors.text,
    },
    textOutline: {
        color: colors.primary,
    },
});
