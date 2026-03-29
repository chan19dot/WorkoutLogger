import React from 'react';
import { Text, TextProps } from 'react-native';
import { typography } from '../theme';

interface TypographyProps extends TextProps {
    variant?: keyof typeof typography;
    children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
    variant = 'body',
    style,
    children,
    ...props
}) => {
    return (
        <Text style={[typography[variant], style]} {...props}>
            {children}
        </Text>
    );
};
