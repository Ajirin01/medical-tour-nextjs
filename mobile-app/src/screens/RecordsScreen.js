import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, FlatList, RefreshControl, Alert, Modal, TouchableWithoutFeedback, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegion } from '../context/RegionContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

// ---------- Sub-list components ----------

const PrescriptionList = ({ sessions, navigation, colors }) => {
  if (!sessions.length) return <EmptyState icon="document-text-outline" label="No prescriptions yet" />;
  return sessions.map((session, i) => (
    <View key={session._id || i} style={styles.recordGroup}>
      <Text style={[styles.groupHeader]}>{`Session ${new Date(session.createdAt).toLocaleDateString()}`}</Text>
      {(!session.prescriptions || session.prescriptions.length === 0) ? (
        <View style={[styles.noItemInline, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.noItemInlineText, { color: colors.subtext }]}>No prescriptions issued for this session.</Text>
        </View>
      ) : (
        session.prescriptions.map((p, j) => (
          <View key={j} style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardIconBox}>
              <Ionicons name="medical" size={20} color="#4f46e5" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{p.medication}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>{p.dosage} · {p.frequency}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  ));
};

const LabReferralList = ({ sessions, navigation, colors }) => {
  if (!sessions.length) return <EmptyState icon="flask-outline" label="No lab referrals yet" />;
  return sessions.map((session, i) => (
    <View key={session._id || i} style={styles.recordGroup}>
      <Text style={[styles.groupHeader]}>{`Session ${new Date(session.createdAt).toLocaleDateString()}`}</Text>
      {(!session.labReferrals || session.labReferrals.length === 0) ? (
        <View style={[styles.noItemInline, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.noItemInlineText, { color: colors.subtext }]}>No lab referrals issued for this session.</Text>
        </View>
      ) : (
        session.labReferrals.map((l, j) => (
          <View key={j} style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.cardIconBox, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="flask" size={20} color="#16a34a" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{l.testName}</Text>
              <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>{l.labName || 'Any Lab'} · {l.status}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  ));
};

const CertificateList = ({ certs, navigation, colors }) => {
  if (!certs.length) return <EmptyState icon="ribbon-outline" label="No certificates yet" />;
  return certs.map((cert, i) => (
    <TouchableOpacity 
      key={cert._id || i} 
      style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.navigate('CertificateDetail', { certId: cert._id })}
    >
      <View style={[styles.cardIconBox, { backgroundColor: '#fff7ed' }]}>
        <Ionicons name="ribbon" size={20} color="#ea580c" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{cert.diagnosis}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.subtext }]}>Issued {new Date(cert.issueDate).toLocaleDateString()}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.subtext} />
    </TouchableOpacity>
  ));
};

const EmptyState = ({ icon, label }) => (
  <View style={styles.emptyState}>
    <Ionicons name={icon} size={48} color="#e2e8f0" />
    <Text style={styles.emptyText}>{label}</Text>
  </View>
);

// ---------- Main Screen ----------

const RecordsScreen = ({ route, navigation }) => {
  const { sessionId } = route.params || {};
  const { getBaseUrl, region } = useRegion();
  const { user, token } = useAuth();
  const { colors, isDark } = useTheme();
  const userData = user?.user || user;
  
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  
  const [prescSessions, setPrescSessions] = useState([]);
  const [labSessions, setLabSessions] = useState([]);
  const [certs, setCerts] = useState([]);

  const isDoctor = userData?.role === 'specialist' || userData?.role === 'doctor';
  const canUpdate = isDoctor && sessionId;

  const fetchRecords = async () => {
    try {
      const headers = { 'x-platform': region, 'Authorization': `Bearer ${token}` };
      const userId = userData?._id;

      let fetchedPresc = [];
      let fetchedLabs = [];
      let fetchedCerts = [];

      if (sessionId) {
        // Mode A: Context-specific view (e.g. from Call Sessions)
        const [sessionRes, certRes] = await Promise.all([
          axios.get(`${getBaseUrl()}/video-sessions/${sessionId}`, { headers }).catch(() => ({ data: {} })),
          axios.get(`${getBaseUrl()}/certificates/get-all/no-pagination`, { headers }).catch(() => ({ data: [] })),
        ]);
        
        if (sessionRes.data?.session) {
          fetchedPresc = [sessionRes.data.session];
          fetchedLabs = [sessionRes.data.session];
        }
        
        fetchedCerts = (certRes.data || []).filter(c => (c.session?._id || c.session) === sessionId);
      } else {
        // Mode B: Global Health Wallet view
        const [prescRes, labRes, certRes] = await Promise.all([
          axios.get(`${getBaseUrl()}/video-sessions/by-user/${userId}/prescriptions`, { headers }).catch(() => ({ data: { sessions: [] } })),
          axios.get(`${getBaseUrl()}/video-sessions/by-user/${userId}/lab-referrals`, { headers }).catch(() => ({ data: { sessions: [] } })),
          axios.get(`${getBaseUrl()}/certificates/get-all/no-pagination`, { headers }).catch(() => ({ data: [] })),
        ]);

        fetchedPresc = prescRes.data?.sessions || [];
        fetchedLabs = labRes.data?.sessions || [];
        fetchedCerts = certRes.data || [];
      }

      setPrescSessions(fetchedPresc);
      setLabSessions(fetchedLabs);
      setCerts(fetchedCerts);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRecords();
    });
    return unsubscribe;
  }, [navigation]);

  const handleBack = () => {
    if (sessionId) {
      navigation.navigate('CallSessions');
    } else {
      navigation.goBack();
    }
  };

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} />;
    
    switch (activeTab) {
      case 'prescriptions': return <PrescriptionList sessions={prescSessions} navigation={navigation} colors={colors} />;
      case 'labs': return <LabReferralList sessions={labSessions} navigation={navigation} colors={colors} />;
      case 'certs': return <CertificateList certs={certs} navigation={navigation} colors={colors} />;
      default: return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleBack} style={[styles.backButton, { backgroundColor: colors.input }]}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{sessionId ? 'Session Records' : 'Medical Records'}</Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>
          {sessionId ? 'Consultation summary and issued documents' : 'Your clinical history and issued documents'}
        </Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, { backgroundColor: colors.input }, activeTab === 'prescriptions' && styles.activeTab]}
            onPress={() => setActiveTab('prescriptions')}
          >
            <Text style={[styles.tabText, { color: colors.subtext }, activeTab === 'prescriptions' && styles.activeTabText]}>Prescriptions</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, { backgroundColor: colors.input }, activeTab === 'labs' && styles.activeTab]}
            onPress={() => setActiveTab('labs')}
          >
            <Text style={[styles.tabText, { color: colors.subtext }, activeTab === 'labs' && styles.activeTabText]}>Labs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, { backgroundColor: colors.input }, activeTab === 'certs' && styles.activeTab]}
            onPress={() => setActiveTab('certs')}
          >
            <Text style={[styles.tabText, { color: colors.subtext }, activeTab === 'certs' && styles.activeTabText]}>Certificates</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRecords(); }} />}
      >
        {renderContent()}
      </ScrollView>

      {/* Doctor-only action button */}
      {canUpdate && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setUpdateModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
          <Text style={styles.fabText}>Update</Text>
        </TouchableOpacity>
      )}

      {/* Action Modal for Web Compatibility */}
      <Modal
        visible={updateModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setUpdateModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setUpdateModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalDragIndicator, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Update Records</Text>
            <Text style={[styles.modalSubtitle, { color: colors.subtext }]}>Select the type of record you'd like to issue.</Text>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity style={styles.modalOptionBtn} onPress={() => { 
                setUpdateModalVisible(false); 
                navigation.navigate('CreatePrescription', { sessionId, existingPrescriptions: prescSessions[0]?.prescriptions || [] }); 
              }}>
                <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
                  <Ionicons name="document-text" size={24} color="#4f46e5" />
                </View>
                <Text style={styles.modalOptionText}>Prescription</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalOptionBtn} onPress={() => { 
                setUpdateModalVisible(false); 
                navigation.navigate('CreateLabReferral', { sessionId, existingLabs: labSessions[0]?.labReferrals || [] }); 
              }}>
                <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                  <Ionicons name="flask" size={24} color="#16a34a" />
                </View>
                <Text style={styles.modalOptionText}>Lab Referral</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalOptionBtn} onPress={() => { 
                setUpdateModalVisible(false); 
                navigation.navigate('CreateCertificate', { sessionId }); 
              }}>
                <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                  <Ionicons name="ribbon" size={24} color="#ea580c" />
                </View>
                <Text style={styles.modalOptionText}>Certificate</Text>
                <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setUpdateModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 24, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backButton: { padding: 8, marginRight: 12, borderRadius: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  tabs: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  activeTab: { backgroundColor: '#4f46e5' },
  tabText: { fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#fff' },
  content: { padding: 24 },
  recordGroup: { marginBottom: 24 },
  groupHeader: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  recordCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2
  },
  cardIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { fontSize: 13 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94a3b8', fontWeight: '500' },
  noItemInline: { padding: 16, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  noItemInlineText: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },
  fab: { 
    position: 'absolute', bottom: 32, right: 24, 
    backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 14, 
    borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8,
    elevation: 10
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalDragIndicator: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, marginBottom: 24 },
  modalOptions: { gap: 12, marginBottom: 24 },
  modalOptionBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalOptionText: { flex: 1, fontSize: 16, fontWeight: '600', marginLeft: 16 },
  modalCancelBtn: { padding: 16, borderRadius: 16, alignItems: 'center' },
  modalCancelText: { fontSize: 16, fontWeight: '700' }
});

export default RecordsScreen;
