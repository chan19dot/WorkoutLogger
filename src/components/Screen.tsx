import React from 'react';
import { StatusBar, StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface ScreenProps extends ViewProps {
    children: React.ReactNode;
}

export const Screen: React.FC<ScreenProps> = ({ children, style, ...props }) => {
    return (
        <SafeAreaView style={[styles.container, style]} {...props}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
