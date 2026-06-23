import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { gpServices } from '../data/gpServices';

export default function ConsultNowScreen({ navigation }) {
  const { onlineSpecialists } = useSocket();
  const [loading, setLoading] = useState(false);

  // Filter for General Practitioners specifically
  const onlineGPs = useMemo(() => {
    console.log('📡 [DEBUG] Online Specialists (Filtered):', onlineSpecialists);
    return onlineSpecialists.filter(s => {
      // Filter out test accounts
      if (s.lastName?.toLowerCase().includes('test') || s.firstName?.toLowerCase().includes('test')) return false;

      const spec = (s.specialization || s.specialty || s.category || '').toLowerCase();
      // If they have a specialty, check it. If not, include them if they are the only ones (fallback)
      if (spec === '') return true; 
      return spec.includes('general') || spec.includes('gp') || spec.includes('family');
    });
  }, [onlineSpecialists]);

  const { socket } = useSocket();
  useEffect(() => {
    if (socket) {
      socket.emit('get-all-online-debug');
      socket.on('all-online-debug', (data) => {
        console.log('📡 [DEBUG] ALL Online (Any Platform):', data);
      });
    }
  }, [socket]);

  const isAnyGPOnline = onlineGPs.length > 0;

  const renderService = ({ item, index }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        if (isAnyGPOnline) {
          // Navigate to Pricing for the online GP
          navigation.navigate('Pricing', { 
            specialist: onlineGPs[0], 
            serviceTitle: item.title,
            basePrice: item.price
          });
        } else {
          // Navigate to Book Appointment pre-filtered for General Practitioner
          navigation.navigate('BookAppointment', { 
            specialty: 'General Practitioner' 
          });
        }
      }}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: isAnyGPOnline ? '#f0fdf4' : '#fef2f2' }]}>
            <View style={[styles.statusDot, { backgroundColor: isAnyGPOnline ? '#22c55e' : '#ef4444' }]} />
            <Text style={[styles.statusText, { color: isAnyGPOnline ? '#16a34a' : '#dc2626' }]}>
              {isAnyGPOnline ? 'GP Available Now' : 'Book Appointment'}
            </Text>
          </View>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.description}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.price}>€{item.price}</Text>
          <View style={[styles.actionBtn, { backgroundColor: isAnyGPOnline ? '#1e40af' : '#fff', borderWidth: isAnyGPOnline ? 0 : 1 }]}>
            <Text style={[styles.actionBtnText, { color: isAnyGPOnline ? '#fff' : '#1e40af' }]}>
              {isAnyGPOnline ? 'Consult Now' : 'Book Now'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Instant GP</Text>
        <Text style={styles.subtitle}>Get medical care within minutes</Text>
      </View>

      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#1e40af" />
        <Text style={styles.infoText}>
          {isAnyGPOnline 
            ? "We have doctors online right now. You can start a consultation immediately."
            : "No doctors are currently online for instant calls. Please book a scheduled appointment."}
        </Text>
      </View>

      <FlatList
        data={gpServices}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderService}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', elevation: 5 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 4 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', margin: 24, marginBottom: 0, padding: 16, borderRadius: 16, gap: 12 },
  infoText: { flex: 1, fontSize: 14, color: '#1e40af', fontWeight: '500', lineHeight: 20 },
  list: { padding: 24, paddingBottom: 100 },
  card: { backgroundColor: '#fff', borderRadius: 24, marginBottom: 20, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', elevation: 3 },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 20 },
  statusRow: { marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 20, fontWeight: '800', color: '#1e40af' },
  actionBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderColor: '#1e40af' },
  actionBtnText: { fontSize: 14, fontWeight: '700' },
});
