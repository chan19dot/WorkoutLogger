import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../theme';
import { Card } from './Card';
import { Typography } from './Typography';

interface QuoteData {
    quote: string;
    author: string;
}

const QUOTE_KEY = '@daily_quote';
const QUOTE_DATE_KEY = '@daily_quote_date';

export const Quote: React.FC = () => {
    const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

    useEffect(() => {
        fetchDailyQuote();
    }, []);

    const fetchDailyQuote = async () => {
        try {
            const response = await fetch('https://dummyjson.com/quotes/random');
            const data = await response.json();

            setQuoteData({
                quote: data.quote,
                author: data.author
            });
        } catch (error) {
            console.log('Failed to fetch quote:', error);
            // Fallback quote
            setQuoteData({
                quote: "The only bad workout is the one that didn't happen.",
                author: "Unknown"
            });
        }
    };

    if (!quoteData) return null;

    return (
        <Card variant="flat" style={styles.container}>
            <Typography variant="body" style={styles.quoteText}>
                "{quoteData.quote}"
            </Typography>
            <View style={styles.authorContainer}>
                <Typography variant="smallBold" style={styles.authorText}>
                    - {quoteData.author}
                </Typography>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.md,
    },
    quoteText: {
        fontStyle: 'italic',
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    authorContainer: {
        alignItems: 'flex-end',
    },
    authorText: {
        opacity: 0.8,
    },
});
