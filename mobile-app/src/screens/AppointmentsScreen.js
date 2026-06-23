import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { apiGet } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export default function AppointmentsScreen({ navigation }) {
  const { user } = useAuth();
  const { getBaseUrl } = useRegion();
  const { colors, isDark } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Upcoming');

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = getBaseUrl().replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await apiGet('medical-tourism/consultation-appointments/all/no/pagination');
      if (Array.isArray(data)) {
        console.log('📅 [DEBUG] First appointment data:', JSON.stringify(data[0], null, 2));
        setAppointments(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date || apt.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    
    const isCompleted = apt.status === 'completed';
    const isPastDate = aptDate < today;

    if (activeTab === 'Upcoming') {
      return !isCompleted && !isPastDate;
    } else {
      return isCompleted || isPastDate;
    }
  });

  const renderItem = ({ item }) => {
    const isSpecialist = user?.role === 'specialist' || user?.role === 'consultant';
    const otherParty = isSpecialist ? (item.user || item.patient) : (item.consultant || item.specialist);
    const displayName = isSpecialist 
      ? `${otherParty?.firstName} ${otherParty?.lastName}`
      : `Dr. ${otherParty?.lastName || 'Doctor'}`;

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]} 
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.iconBackground }]}>
              {otherParty?.profileImage ? (
                <Image source={{ uri: getImageUrl(otherParty.profileImage) }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={24} color={colors.primary} />
              )}
            </View>
            <View>
              <Text style={[styles.doctorName, { color: colors.text }]}>{displayName}</Text>
              <Text style={[styles.specialty, { color: colors.subtext }]}>
                {isSpecialist ? 'Patient' : (otherParty?.specialty || otherParty?.specialization || 'Specialist')}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? '#dcfce7' : colors.iconBackground }]}>
            <Text style={[styles.statusText, { color: item.status === 'completed' ? '#16a34a' : colors.primary }]}>
              {item.status || 'Scheduled'}
            </Text>
          </View>
        </View>
      
      <View style={[styles.cardBody, { backgroundColor: colors.input }]}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={colors.subtext} />
          <Text style={[styles.infoText, { color: colors.subtext }]}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color={colors.subtext} />
          <Text style={[styles.infoText, { color: colors.subtext }]}>
            {item.slot?.startTime || item.startTime || item.time || (item.date ? new Date(item.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="videocam-outline" size={18} color={colors.subtext} />
          <Text style={[styles.infoText, { color: colors.subtext }]}>
            {(!item.slot || !item.slot.startTime) ? 'Instant Consultation' : 'Scheduled Video Call'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border, backgroundColor: colors.input }]}>
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id })}
        >
          <Text style={styles.primaryBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Appointments</Text>
        <View style={[styles.tabs, { backgroundColor: colors.input }]}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Upcoming' && [styles.activeTab, { backgroundColor: colors.card }]]}
            onPress={() => setActiveTab('Upcoming')}
          >
            <Text style={[styles.tabText, { color: colors.subtext }, activeTab === 'Upcoming' && { color: colors.text }]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Past' && [styles.activeTab, { backgroundColor: colors.card }]]}
            onPress={() => setActiveTab('Past')}
          >
            <Text style={[styles.tabText, { color: colors.subtext }, activeTab === 'Past' && { color: colors.text }]}>Past</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={item => item._id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={48} color={colors.subtext} />
              <Text style={[styles.emptyText, { color: colors.subtext }]}>No {activeTab.toLowerCase()} appointments found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 5 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  tabs: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#1e293b' },
  list: { padding: 24, paddingBottom: 100 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { borderRadius: 16, padding: 20, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  doctorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  doctorName: { fontSize: 16, fontWeight: '700' },
  specialty: { fontSize: 13, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cardBody: { borderRadius: 12, padding: 16, marginBottom: 16, gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoText: { fontSize: 14, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', gap: 12 },
  secondaryBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  secondaryBtnText: { fontWeight: '600', fontSize: 14 },
  primaryBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 40 },
  emptyText: { marginTop: 16, fontSize: 15, fontWeight: '500' },
});
