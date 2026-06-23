import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { apiGet } from '../api/client';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { region, getBaseUrl } = useRegion();
  const { onlineSpecialists, incomingCall, handleAcceptCall } = useSocket();
  const [appointments, setAppointments] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { colors, isDark } = useTheme();

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = getBaseUrl().replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    // If a session was just created for an incoming call we accepted, navigate
    // Note: We might need a more robust way to detect 'acceptance'
  }, [incomingCall]);

  // Filter for GPs to check availability
  const onlineGPs = (onlineSpecialists || []).filter(s => {
    // Filter out test accounts
    if (s.lastName?.toLowerCase().includes('test') || s.firstName?.toLowerCase().includes('test')) return false;

    const spec = (s.specialization || s.specialty || s.category || '').toLowerCase();
    if (spec === '') return true; 
    return spec.includes('general') || spec.includes('gp') || spec.includes('family');
  });

  const isGPOnline = onlineGPs.length > 0;

  const handleConsultNow = () => {
    if (isGPOnline) {
      // Direct to pricing for the online GP
      navigation.navigate('Pricing', { 
        specialist: onlineGPs[0], 
        serviceTitle: 'GP Consultation',
        basePrice: 20
      });
    } else {
      // Direct to book appointment filtered by GP
      navigation.navigate('BookAppointment', { 
        specialty: 'General Practitioner' 
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      const data = await apiGet('medical-tourism/consultation-appointments/all/no/pagination');
      if (Array.isArray(data)) {
        // 1. Upcoming Appointments (limit to 3 for dashboard)
        const upcoming = data.filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled');
        setAppointments(upcoming.slice(0, 3)); 

        // 2. Completed Sessions for Earnings
        const completed = data.filter(apt => apt.status === 'completed');
        setCompletedSessions(completed);

        // 3. Calculate Earnings (70% of each session)
        const total = completed.reduce((sum, apt) => {
          const price = apt.price || apt.amount || 20; // fallback to 20 if price missing
          return sum + (price * 0.7);
        }, 0);
        setEarnings(total);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.subtext }]}>{getGreeting()},</Text>
            <Text style={[styles.name, { color: colors.text }]}>{user?.firstName || 'User'} {user?.lastName || ''}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: colors.iconBackground }]} onPress={() => navigation.navigate('Settings')}>
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Settings')}>
              {user?.profileImage ? (
                <Image source={{ uri: getImageUrl(user.profileImage) }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person-circle" size={48} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.regionBadge, { backgroundColor: colors.iconBackground }]}>
          <Ionicons name={region === 'ireland' ? 'location' : 'earth'} size={14} color={colors.primary} />
          <Text style={[styles.regionText, { color: colors.primary }]}>{region === 'ireland' ? 'Irish Portal' : 'Global Portal'}</Text>
        </View>
      </View>

      {user?.role === 'specialist' && (
        <View style={styles.earningsCard}>
          <View style={styles.earningsInfo}>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsValue}>{region === 'ireland' ? '€' : '$'}{earnings.toFixed(2)}</Text>
            <View style={styles.earningsStats}>
              <View style={styles.statMini}>
                <Ionicons name="videocam" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statMiniText}>{completedSessions.length} Sessions</Text>
              </View>
              <View style={styles.statMini}>
                <Ionicons name="trending-up" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statMiniText}>70% Commission</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.withdrawBtn}
            onPress={() => Alert.alert('Earnings', 'Payouts are processed automatically every Friday.')}
          >
            <Ionicons name="wallet-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.quickActionsGrid}>
        {user?.role === 'specialist' ? (
          <>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Appointments')}>
              <View style={[styles.actionIcon, { backgroundColor: colors.iconBackground }]}>
                <Ionicons name="calendar" size={28} color="#3b82f6" />
              </View>
              <Text style={[styles.actionText, { color: colors.subtext }]}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Records')}>
              <View style={[styles.actionIcon, { backgroundColor: isDark ? '#3b006b33' : '#fdf4ff' }]}>
                <Ionicons name="people" size={28} color="#9333ea" />
              </View>
              <Text style={[styles.actionText, { color: colors.subtext }]}>My Patients</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Specialists')}>
              <View style={[styles.actionIcon, { backgroundColor: colors.iconBackground }]}>
                <Ionicons name="medical" size={28} color="#3b82f6" />
              </View>
              <Text style={[styles.actionText, { color: colors.subtext }]}>Find Doctor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={handleConsultNow}>
              <View style={[styles.actionIcon, { backgroundColor: isGPOnline ? (isDark ? '#4a00803d' : '#fdf4ff') : colors.input }]}>
                <Ionicons name="videocam" size={28} color={isGPOnline ? '#9333ea' : colors.subtext} />
              </View>
              <Text style={[styles.actionText, { color: colors.subtext }]}>{isGPOnline ? 'Consult Now' : 'Book GP'}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Records')}>
          <View style={[styles.actionIcon, { backgroundColor: isDark ? '#4b000033' : '#fef2f2' }]}>
            <Ionicons name="document-text" size={28} color="#ef4444" />
          </View>
          <Text style={[styles.actionText, { color: colors.subtext }]}>Records</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('CallSessions')}>
          <View style={[styles.actionIcon, { backgroundColor: isDark ? '#4b200033' : '#fff7ed' }]}>
            <Ionicons name="time" size={28} color="#ea580c" />
          </View>
          <Text style={[styles.actionText, { color: colors.subtext }]}>Call History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Appointments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {appointments.length > 0 ? (
          appointments.map((apt) => {
            const isSpecialist = user?.role === 'specialist' || user?.role === 'consultant';
            const otherParty = isSpecialist ? (apt.user || apt.patient) : (apt.consultant || apt.specialist);
            const displayName = isSpecialist 
              ? `${otherParty?.firstName} ${otherParty?.lastName}`
              : `Dr. ${otherParty?.lastName || 'Doctor'}`;

            return (
              <TouchableOpacity 
                key={apt._id} 
                style={[styles.appointmentCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
                onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: apt._id })}
              >
                <View style={[styles.aptHeader, { borderBottomColor: colors.border }]}>
                  <View style={styles.aptAvatarContainer}>
                    {otherParty?.profileImage ? (
                      <Image source={{ uri: getImageUrl(otherParty.profileImage) }} style={styles.aptAvatar} />
                    ) : (
                      <View style={[styles.aptAvatarPlaceholder, { backgroundColor: colors.iconBackground }]}>
                        <Ionicons name="person" size={20} color={colors.primary} />
                      </View>
                    )}
                  </View>
                  <View style={styles.aptInfo}>
                    <Text style={[styles.doctorName, { color: colors.text }]}>{displayName}</Text>
                    <Text style={[styles.specialty, { color: colors.subtext }]}>
                      {isSpecialist ? 'Patient' : (otherParty?.specialty || otherParty?.specialization || 'Specialist')}
                    </Text>
                  </View>
                  <View style={[styles.aptType, { backgroundColor: colors.iconBackground }]}>
                    <Ionicons name="videocam" size={16} color={colors.primary} />
                  </View>
                </View>
                <View style={styles.aptFooter}>
                  <View style={styles.aptTime}>
                    <Ionicons name="calendar-outline" size={16} color={colors.subtext} />
                    <Text style={[styles.timeText, { color: colors.subtext }]}>
                      {apt.date ? new Date(apt.date).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}
                    </Text>
                  </View>
                  <View style={styles.aptTime}>
                    <Ionicons name="time-outline" size={16} color={colors.subtext} />
                    <Text style={[styles.timeText, { color: colors.subtext }]}>
                      {apt.slot?.startTime || apt.startTime || apt.time || (apt.date ? new Date(apt.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A')}
                      {apt.slot?.endTime || apt.endTime ? ` - ${apt.slot?.endTime || apt.endTime}` : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="calendar-outline" size={48} color={colors.subtext} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No upcoming appointments</Text>
            <TouchableOpacity 
              style={[styles.bookBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate(user?.role === 'specialist' ? 'Appointments' : 'Specialists')}
            >
              <Text style={styles.bookBtnText}>{user?.role === 'specialist' ? 'View Schedule' : 'Book Now'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 24, paddingTop: 60, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', elevation: 5 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 16, color: '#64748b' },
  name: { fontSize: 24, fontWeight: '800', color: '#1e293b', marginTop: 4 },
  profileBtn: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  settingsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  profileImage: { width: '100%', height: '100%' },
  regionBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 16 },
  regionText: { color: '#1e40af', fontWeight: '600', fontSize: 12, marginLeft: 6 },
  earningsCard: { backgroundColor: '#1e40af', margin: 24, padding: 24, borderRadius: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(30, 64, 175, 0.3)', elevation: 8 },
  earningsInfo: { flex: 1 },
  earningsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  earningsValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 8 },
  earningsStats: { flexDirection: 'row', gap: 16 },
  statMini: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statMiniText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' },
  withdrawBtn: { width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 24, paddingBottom: 8, marginTop: 0, gap: 12 },
  actionCard: { alignItems: 'center', width: '45%', marginBottom: 4 },
  actionIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 2 },
  actionText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  section: { padding: 24, paddingTop: 0 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  appointmentCard: { borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  aptHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 16, marginBottom: 16, gap: 12 },
  aptAvatarContainer: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  aptAvatar: { width: '100%', height: '100%' },
  aptAvatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  aptInfo: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: '700' },
  specialty: { fontSize: 13, marginTop: 4 },
  aptType: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  aptFooter: { flexDirection: 'row', gap: 24 },
  aptTime: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeText: { fontSize: 13, fontWeight: '500' },
  emptyState: { alignItems: 'center', padding: 32, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2 },
  emptyText: { marginTop: 12, marginBottom: 16, fontSize: 14 },
  bookBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  bookBtnText: { color: '#fff', fontWeight: '600' },
});
