import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegion } from '../context/RegionContext';

const PLANS = [
  {
    id: 'basic',
    title: 'Basic',
    price: 20,
    oldPrice: 25,
    duration: 15,
    features: ['15 mins duration', 'Quick consultation', 'Basic summary'],
    color: '#3b82f6'
  },
  {
    id: 'delux',
    title: 'Delux',
    price: 30,
    oldPrice: 40,
    duration: 25,
    features: ['25 mins duration', 'Detailed report', 'Follow-up included', 'Pharmacy Referral'],
    color: '#1e40af',
    isRecommended: true
  },
  {
    id: 'premium',
    title: 'Premium',
    price: 60,
    oldPrice: 75,
    duration: 40,
    features: ['40 mins duration', 'Complete report', 'Follow-up included', 'Pharmacy & Lab Referral'],
    color: '#1e3a8a'
  }
];

export default function PricingScreen({ route, navigation }) {
  const { specialist, serviceTitle, basePrice } = route.params || {};
  const { region } = useRegion();
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]); // Delux as default

  const currencySymbol = region === 'ireland' ? '€' : '$';

  const handleProceed = () => {
    // Navigate to checkout with the selected plan details
    navigation.navigate('Checkout', {
      doctor: specialist,
      amount: selectedPlan.price,
      appointmentDate: new Date().toISOString(),
      consultMode: 'now',
      duration: selectedPlan.duration,
      serviceTitle: serviceTitle,
      // Create a virtual slot for "now" consultations
      slotData: {
        _id: null,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: new Date(Date.now() + selectedPlan.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        duration: selectedPlan.duration,
        type: 'now'
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Select a Plan</Text>
        <Text style={styles.subtitle}>{serviceTitle || 'General Consultation'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          return (
            <TouchableOpacity 
              key={plan.id}
              style={[styles.planCard, isSelected && { borderColor: plan.color, borderWidth: 2 }]}
              onPress={() => setSelectedPlan(plan)}
            >
              {plan.isRecommended && (
                <View style={[styles.recommendedBadge, { backgroundColor: plan.color }]}>
                  <Text style={styles.recommendedText}>RECOMMENDED</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planTitle}>{plan.title}</Text>
                  <Text style={styles.planDuration}>{plan.duration} Minutes</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.oldPrice}>{currencySymbol}{plan.oldPrice}</Text>
                  <Text style={[styles.price, { color: plan.color }]}>{currencySymbol}{plan.price}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              {plan.features.map((feature, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
          <Text style={styles.proceedText}>Continue to Payment</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', elevation: 5 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  scroll: { padding: 24, paddingBottom: 120 },
  planCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', elevation: 2, position: 'relative' },
  recommendedBadge: { position: 'absolute', top: -12, right: 24, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  recommendedText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  planTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  planDuration: { fontSize: 14, color: '#64748b', marginTop: 4 },
  priceContainer: { alignItems: 'flex-end' },
  oldPrice: { fontSize: 14, color: '#94a3b8', textDecorationLine: 'line-through' },
  price: { fontSize: 28, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  featureText: { fontSize: 14, color: '#475569', fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(10px)' },
  proceedBtn: { backgroundColor: '#1e40af', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)', elevation: 4 },
  proceedText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
