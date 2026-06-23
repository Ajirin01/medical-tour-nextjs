import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useRegion } from '../context/RegionContext';
import { apiGet } from '../api/client';

export default function AppointmentDetailScreen({ route, navigation }) {
  const { appointmentId } = route.params;
  const { user } = useAuth();
  const { socket } = useSocket();
  const { getBaseUrl } = useRegion();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = getBaseUrl().replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const data = await apiGet(`medical-tourism/consultation-appointments/${appointmentId}`);
      setAppointment(data);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      Alert.alert('Error', 'Could not load appointment details.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (!appointment) return;
    
    // Determine the participant to ring/join with
    const specialistId = appointment.consultant?._id || appointment.specialist?._id;
    const specialistName = appointment.consultant ? `${appointment.consultant.firstName} ${appointment.consultant.lastName}` : 'Doctor';

    navigation.navigate('Call', {
      appointmentId: appointment._id,
      specialistId: specialistId,
      specialistName: specialistName
    });
  };

  const handleRing = () => {
    if (!appointment || !socket) return;
    
    const targetId = user.role === 'user' 
      ? (appointment.consultant?._id || appointment.specialist?._id)
      : (appointment.user?._id || appointment.patient?._id);
    
    if (!targetId) {
      Alert.alert('Error', 'Could not identify the participant to ring.');
      return;
    }

    console.log('📡 [Ring] Inviting participant:', targetId);
    socket.emit(user.role === 'user' ? 'invite-specialist-to-call' : 'invite-patient-to-call', {
      specialistId: user.role === 'user' ? targetId : user._id,
      patientId: user.role === 'user' ? user._id : targetId,
      appointmentId: appointment._id,
    });
    
    Alert.alert('Ringing', 'We are notifying the other participant to join the call.');
    
    // Automatically navigate to call screen after ringing
    handleJoin();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Appointment not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isSpecialist = user.role === 'specialist' || user.role === 'consultant';
  const otherParty = isSpecialist ? (appointment.user || appointment.patient) : (appointment.consultant || appointment.specialist);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.doctorInfo}>
            <View style={styles.avatar}>
              {otherParty?.profileImage ? (
                <Image source={{ uri: getImageUrl(otherParty.profileImage) }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={32} color="#1e40af" />
              )}
            </View>
            <View>
              <Text style={styles.label}>{isSpecialist ? 'Patient' : 'Consultant'}</Text>
              <Text style={styles.name}>{otherParty?.firstName} {otherParty?.lastName}</Text>
              <Text style={styles.subtext}>{otherParty?.specialty || otherParty?.category || 'General Consultation'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Time & Date</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={20} color="#1e40af" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {new Date(appointment.date).toLocaleDateString('en-IE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="time" size={20} color="#1e40af" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Time Slot</Text>
              <Text style={styles.infoValue}>
                {appointment.slot?.startTime || appointment.startTime || appointment.time || (appointment.date ? new Date(appointment.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A')} 
                {appointment.slot?.endTime || appointment.endTime ? ` - ${appointment.slot?.endTime || appointment.endTime}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="videocam" size={20} color="#1e40af" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Type</Text>
              <Text style={styles.infoValue}>
                {(!appointment.slot || !appointment.slot.startTime) ? 'Instant Consultation' : 'Scheduled Video Call'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: appointment.status === 'completed' ? '#dcfce7' : '#eff6ff' }]}>
            <Text style={[styles.statusText, { color: appointment.status === 'completed' ? '#16a34a' : '#1e40af' }]}>
              {appointment.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {appointment.status !== 'completed' && (
          <>
            <TouchableOpacity style={styles.ringBtn} onPress={handleRing}>
              <Ionicons name="notifications" size={20} color="#1e40af" />
              <Text style={styles.ringBtnText}>Ring {isSpecialist ? 'Patient' : 'Doctor'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
              <Text style={styles.joinBtnText}>Start Consultation</Text>
            </TouchableOpacity>
          </>
        )}
        
        {appointment.status === 'completed' && (
          <TouchableOpacity 
            style={styles.joinBtn} 
            onPress={() => navigation.navigate('Records', { appointmentId: appointment._id })}
          >
            <Text style={styles.joinBtnText}>View Records</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  content: { padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', elevation: 3 },
  doctorInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  label: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600' },
  name: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  subtext: { fontSize: 14, color: '#1e40af', marginTop: 2, fontWeight: '500' },
  infoSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 16, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', elevation: 1 },
  infoLabel: { fontSize: 13, color: '#64748b' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginTop: 2 },
  statusSection: { marginBottom: 24 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusText: { fontSize: 14, fontWeight: '700' },
  footer: { padding: 24, gap: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  joinBtn: { backgroundColor: '#1e40af', paddingVertical: 16, borderRadius: 12, alignItems: 'center', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)', elevation: 4 },
  joinBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ringBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff', paddingVertical: 16, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: '#bfdbfe' },
  ringBtnText: { color: '#1e40af', fontSize: 16, fontWeight: '600' },
  errorText: { fontSize: 16, color: '#ef4444', marginBottom: 16 },
  backBtn: { backgroundColor: '#1e40af', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backBtnText: { color: '#fff', fontWeight: '600' },
});
