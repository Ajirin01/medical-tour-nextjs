import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LabReferralDetailScreen({ route, navigation }) {
  const { referral, session } = route.params || {};

  const data = referral || session?.labReferrals?.[0] || {};
  const doctor = session?.specialist || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Laboratory Referral</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={24} color="#1e40af" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.referralCard}>
          {/* Clinic Header */}
          <View style={styles.clinicHeader}>
            <View style={styles.logoCircle}>
              <Ionicons name="flask" size={30} color="#0891b2" />
            </View>
            <View>
              <Text style={styles.clinicName}>SozoDigiCare Diagnostic</Text>
              <Text style={styles.clinicSub}>Clinical Investigation Request</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Patient Info */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Patient Name</Text>
              <Text style={styles.infoValue}>{session?.patient?.firstName} {session?.patient?.lastName || 'User'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ref Number</Text>
              <Text style={styles.infoValue}>LR-{session?._id?.substring(0, 8).toUpperCase() || 'TEMP-123'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Tests Requested */}
          <Text style={styles.sectionTitle}>Requested Investigations</Text>
          <View style={styles.testList}>
            {(data.tests || ['Full Blood Count', 'Basic Metabolic Panel']).map((test, index) => (
              <View key={index} style={styles.testItem}>
                <Ionicons name="checkmark-circle" size={20} color="#0891b2" />
                <Text style={styles.testName}>{test}</Text>
              </View>
            ))}
          </View>

          {data.notes && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Clinical Indications</Text>
              <Text style={styles.notesText}>{data.notes}</Text>
            </>
          )}

          <View style={styles.divider} />

          {/* Issuing Specialist */}
          <View style={styles.doctorArea}>
            <Text style={styles.infoLabel}>Referring Specialist</Text>
            <Text style={styles.docName}>Dr. {doctor.firstName} {doctor.lastName}</Text>
            <Text style={styles.docSpec}>{doctor.specialty || 'Medical Specialist'}</Text>
            <Text style={styles.docId}>License: {doctor.doctorRegistrationNumber || 'REG-99201'}</Text>
          </View>

          <View style={styles.footerNote}>
            <Ionicons name="information-circle-outline" size={16} color="#64748b" />
            <Text style={styles.footerNoteText}>This is a digitally signed document. Validation can be performed via the SozoDigiCare portal.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.mapBtn}>
          <Ionicons name="location-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.mapText}>Find Nearby Laboratories</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  shareBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  referralCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', elevation: 5 },
  clinicHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  logoCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ecfeff', justifyContent: 'center', alignItems: 'center' },
  clinicName: { fontSize: 18, fontWeight: '800', color: '#0891b2' },
  clinicSub: { fontSize: 12, color: '#64748b' },
  divider: { hieght: 1, backgroundColor: '#f1f5f9', marginVertical: 20, height: 1 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1e293b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  testList: { gap: 12 },
  testItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', padding: 12, borderRadius: 10 },
  testName: { fontSize: 15, fontWeight: '600', color: '#334155' },
  notesText: { fontSize: 14, color: '#64748b', lineHeight: 22, fontStyle: 'italic' },
  doctorArea: { marginTop: 10 },
  docName: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginTop: 4 },
  docSpec: { fontSize: 13, color: '#64748b' },
  docId: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  footerNote: { marginTop: 32, flexDirection: 'row', gap: 8, backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 },
  footerNoteText: { flex: 1, fontSize: 11, color: '#64748b', lineHeight: 16 },
  mapBtn: { backgroundColor: '#0891b2', marginTop: 24, padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(8, 145, 178, 0.2)', elevation: 4 },
  mapText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
