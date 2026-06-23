import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function StripeCardForm({ onSuccess }) {
  return <View style={styles.c}><Text style={styles.t}>Card payments available on native app</Text></View>;
}
const styles = StyleSheet.create({ c: { padding: 16, backgroundColor: '#f1f5f9', borderRadius: 8 }, t: { color: '#64748b', textAlign: 'center' } });
