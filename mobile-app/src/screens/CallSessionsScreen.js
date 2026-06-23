import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiGet } from '../api/client';

export default function CallSessionsScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await apiGet('medical-tourism/video-sessions/by-user/all');
      if (res.success && Array.isArray(res.sessions)) {
        setSessions(res.sessions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const renderItem = ({ item }) => {
    const isCompleted = !!item.endTime;
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.doctorInfo}>
            <View style={styles.avatar}>
              <Ionicons name="videocam" size={24} color="#1e40af" />
            </View>
            <View>
              <Text style={styles.doctorName}>Session with Dr. {item.specialist?.lastName || 'Doctor'}</Text>
              <Text style={styles.specialty}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isCompleted ? '#dcfce7' : '#eff6ff' }]}>
            <Text style={[styles.statusText, { color: isCompleted ? '#16a34a' : '#1e40af' }]}>
              {isCompleted ? 'Completed' : 'Active'}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => {
              if (isCompleted) {
                navigation.navigate('Records', { sessionId: item._id });
              } else {
                navigation.navigate('Call', { sessionId: item._id });
              }
            }}
          >
            <Text style={styles.primaryBtnText}>{isCompleted ? 'View Records' : 'Join Session'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Call Sessions</Text>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator size="large" color="#1e40af" /></View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={item => item._id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="videocam-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No recent call sessions found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  list: { padding: 24, paddingBottom: 100 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  doctorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  doctorName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  specialty: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cardFooter: { flexDirection: 'row', gap: 12 },
  primaryBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#1e40af', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  emptyState: { alignItems: 'center', padding: 40, marginTop: 40 },
  emptyText: { color: '#94a3b8', marginTop: 16, fontSize: 15, fontWeight: '500' },
});
