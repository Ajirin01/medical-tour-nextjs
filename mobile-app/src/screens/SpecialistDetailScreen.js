import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegion } from '../context/RegionContext';
import { apiGet } from '../api/client';

export default function SpecialistDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { getBaseUrl, region } = useRegion();
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = getBaseUrl().replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    fetchSpecialist();
  }, [id]);

  const fetchSpecialist = async () => {
    try {
      // The backend route for a single user/specialist
      const data = await apiGet(`medical-tourism/users/${id}`);
      setSpecialist(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load specialist details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" color="#1e40af" /></View>;
  }

  if (!specialist) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Specialist not found</Text>
      </View>
    );
  }

  const isOnline = specialist.isOnline;
  const currencySymbol = region === 'ireland' ? '€' : '$';

  const handleConsultNow = () => {
    if (isOnline) {
      navigation.navigate('Pricing', { 
        specialist: specialist,
        serviceTitle: 'Instant Consultation',
        basePrice: 20
      });
    } else {
      navigation.navigate('BookAppointment', { 
        specialty: specialist.specialty || specialist.specialization || 'General Practitioner' 
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            {specialist.profileImage ? (
              <Image source={{ uri: getImageUrl(specialist.profileImage) }} style={styles.avatar} />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Ionicons name="person" size={60} color="#1e40af" />
              </View>
            )}
            <View style={[styles.statusBadge, { backgroundColor: specialist.isOnline ? '#10b981' : '#94a3b8' }]} />
          </View>
          <Text style={styles.name}>Dr. {specialist.firstName} {specialist.lastName}</Text>
          <Text style={styles.specialty}>{specialist.specialty || specialist.specialization || 'Specialist'}</Text>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{specialist.experience || '5'}+</Text>
              <Text style={styles.statLabel}>Years Exp.</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1.2k</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {specialist.bio || `Dr. ${specialist.lastName} is a highly experienced professional dedicated to providing the best clinical care to patients globally.`}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialties & Treatments</Text>
          <View style={styles.tags}>
            {(specialist.treats || ['General Consultation', 'Medical Advice', 'Check-ups']).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.priceSection}>
          <View>
            <Text style={styles.priceLabel}>Consultation Fee</Text>
            <Text style={styles.priceValue}>from {currencySymbol}20.00</Text>
          </View>
          <TouchableOpacity 
            style={styles.bookBtn}
            onPress={handleConsultNow}
          >
            <Text style={styles.bookBtnText}>Consult Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 40 },
  header: { alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomLeftRadius: 32, borderBottomRightRadius: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', elevation: 5 },
  backBtn: { position: 'absolute', left: 24, top: 60, width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  placeholderAvatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  statusBadge: { position: 'absolute', bottom: 5, right: 10, width: 24, height: 24, borderRadius: 12, borderWidth: 4, borderColor: '#fff' },
  name: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  specialty: { fontSize: 16, color: '#64748b', marginTop: 4 },
  stats: { flexDirection: 'row', alignItems: 'center', marginTop: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  divider: { width: 1, height: 30, backgroundColor: '#e2e8f0' },
  section: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  aboutText: { fontSize: 15, color: '#475569', lineHeight: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { color: '#1e40af', fontSize: 13, fontWeight: '600' },
  priceSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  priceLabel: { fontSize: 14, color: '#64748b' },
  priceValue: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  bookBtn: { backgroundColor: '#1e40af', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)', elevation: 4 },
  bookBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorText: { fontSize: 16, color: '#ef4444', textAlign: 'center', marginTop: 100 },
});
