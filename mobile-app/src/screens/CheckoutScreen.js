import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { useStripe } from '../utils/stripe';
import WebCardInput from '../components/WebCardInput';

export default function CheckoutScreen({ route, navigation }) {
  const { doctor, amount, appointmentId, slotData, appointmentDate } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [finalApptId, setFinalApptId] = useState(appointmentId);
  const paymentStarted = useRef(false);
  const { user } = useAuth();
  const { region, getBaseUrl } = useRegion();
  const { initPaymentSheet, presentPaymentSheet, confirmPayment } = useStripe();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = getBaseUrl().replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const isIrish = region === 'ireland';
  const currencySymbol = isIrish ? '€' : '$';
  const currencyCode = isIrish ? 'eur' : 'usd';
  
  const baseAmount = amount || 50;
  const serviceFee = 5;
  const totalPayment = baseAmount + serviceFee;

  useEffect(() => {
    if (!paymentStarted.current) {
      paymentStarted.current = true;
      handleInitialSetup();
    }
  }, []);

  const handleInitialSetup = async () => {
    setLoading(true);
    try {
      let apptId = finalApptId;

      // 1. Create Appointment if it doesn't exist
      if (!apptId && slotData && appointmentDate) {
        console.log('Creating appointment...');
        const isNow = route.params?.consultMode === 'now';
        const apptResponse = await apiPost('medical-tourism/consultation-appointments/create/custom', {
          patient: user?._id,
          consultant: doctor._id,
          slot: slotData,
          date: appointmentDate,
          duration: slotData.duration,
          type: 'general',
          mode: isNow ? 'now' : 'appointment',
        });
        apptId = apptResponse.appointment?._id;
        setFinalApptId(apptId);
      }

      if (!apptId) throw new Error('Could not create appointment record');

      // 2. Fetch Payment Intent
      const response = await apiPost('medical-tourism/payments/create/intent', {
        amount: Math.round(totalPayment * 100),
        currency: currencyCode,
        appointmentId: apptId
      });

      if (!response.clientSecret) throw new Error('Failed to get payment intent');
      setClientSecret(response.clientSecret);

      // 3. If Native, Auto-trigger Payment Sheet
      if (Platform.OS !== 'web') {
        const initialized = await initializeNativePaymentSheet(apptId, response.clientSecret);
        if (initialized) {
          const { error } = await presentPaymentSheet();
          handlePaymentResult(error);
        }
      }
    } catch (error) {
      console.error('Setup Error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeNativePaymentSheet = async (apptId, secret) => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'SozoDigiCare',
      paymentIntentClientSecret: secret,
      defaultBillingDetails: {
        email: user?.email,
        name: `${user?.firstName} ${user?.lastName}`,
      },
      allowsDelayedPaymentMethods: false,
    });

    if (error) {
      Alert.alert('Payment Config Error', error.message);
      return false;
    }
    return true;
  };

  const handlePaymentResult = (error) => {
    if (error) {
      if (error.code !== 'Canceled') {
        Alert.alert('Payment Error', error.message);
      }
    } else {
      const isNow = route.params?.consultMode === 'now';
      if (isNow) {
        navigation.navigate('Call', { 
          appointmentId: finalApptId,
          specialistId: doctor?._id,
          specialistName: `Dr. ${doctor?.firstName} ${doctor?.lastName}`
        });
      } else {
        Alert.alert('Success', 'Payment processed successfully!', [
          { text: 'View Appointments', onPress: () => navigation.navigate('Appointments') }
        ]);
      }
    }
  };

  const handleWebPayment = async () => {
    console.log('🛠️ [Checkout] handleWebPayment started');
    setProcessingPayment(true);
    try {
      console.log('🛠️ [Checkout] Calling confirmPayment with secret:', clientSecret?.substring(0, 10) + '...');
      const result = await confirmPayment(clientSecret, {
        payment_method: {
          billing_details: {
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
          }
        }
      });

      if (result.error) {
        console.error('❌ [Checkout] Payment result error:', result.error.message);
        Alert.alert('Payment Failed', result.error.message);
      } else {
        console.log('🎉 [Checkout] Payment success!');
        handlePaymentResult(null);
      }
    } catch (err) {
      console.error('💥 [Checkout] Critical error in web payment:', err);
      Alert.alert('Error', err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Secure Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Consultation Summary</Text>
          <View style={styles.doctorRow}>
            <View style={styles.avatarContainer}>
              {doctor?.profileImage ? (
                <Image source={{ uri: getImageUrl(doctor.profileImage) }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={24} color="#1e40af" />
              )}
            </View>
            <View>
              <Text style={styles.doctorName}>Dr. {doctor?.lastName || 'Medical Specialist'}</Text>
              <Text style={styles.doctorSpec}>{doctor?.specialty || 'General Practitioner'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Plan: {route.params?.duration} Mins</Text>
            <Text style={styles.priceValue}>{currencySymbol}{baseAmount}.00</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>{currencySymbol}{serviceFee}.00</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: '#e2e8f0' }]} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Due</Text>
            <Text style={styles.totalValue}>{currencySymbol}{totalPayment}.00</Text>
          </View>
        </View>

        {Platform.OS === 'web' && clientSecret ? (
          <WebCardInput 
            amount={totalPayment} 
            currencySymbol={currencySymbol} 
            loading={processingPayment}
            onConfirm={handleWebPayment}
          />
        ) : (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#1e40af" />
            <Text style={styles.statusText}>Connecting to secure payment gateway...</Text>
            <Text style={styles.subStatusText}>Please do not close the app</Text>
          </View>
        )}

        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={16} color="#10b981" />
          <Text style={styles.securityText}>Secured by Stripe</Text>
        </View>

        {/* Manual Retry Button if it fails */}
        {(Platform.OS !== 'web' || !clientSecret) && !loading && (
          <TouchableOpacity style={styles.retryBtn} onPress={handleInitialSetup}>
            <Text style={styles.retryText}>Retry Setup</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', elevation: 4, marginBottom: 20 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatar: { width: '100%', height: '100%' },
  doctorName: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  doctorSpec: { fontSize: 14, color: '#64748b', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceLabel: { fontSize: 15, color: '#64748b' },
  priceValue: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  totalLabel: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#1e40af' },
  statusContainer: { alignItems: 'center', marginVertical: 40 },
  statusText: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginTop: 20 },
  subStatusText: { fontSize: 14, color: '#64748b', marginTop: 8 },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  securityText: { fontSize: 14, color: '#64748b', fontWeight: '500' },
  retryBtn: { margin: 24, padding: 18, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  retryText: { fontSize: 16, fontWeight: '700', color: '#1e40af' },
});

