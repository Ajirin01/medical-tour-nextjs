import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

const WebCardInput = ({ onConfirm, loading, amount, currencySymbol }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Card Details</Text>
      <View style={styles.cardWrapper}>
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1e293b',
                '::placeholder': { color: '#94a3b8' },
              },
            },
          }}
        />
      </View>
      <TouchableOpacity 
        style={[styles.payButton, loading && styles.disabled]} 
        onPress={() => {
          console.log('🔘 [WebCardInput] Pay button clicked');
          onConfirm();
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>Pay {currencySymbol}{amount}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  cardWrapper: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#1e40af',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default WebCardInput;
