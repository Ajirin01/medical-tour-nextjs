import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CertificateDetailScreen({ route, navigation }) {
  const { certificate } = route.params || {};

  const data = certificate || {};
  const doctor = data.specialist || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Medical Certificate</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={24} color="#1e40af" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.certificateCard}>
          {/* Certificate Header */}
          <View style={styles.certHeader}>
            <View style={styles.logoBox}>
              <Ionicons name="ribbon" size={40} color="#1e40af" />
            </View>
            <Text style={styles.certTitle}>Certificate of Medical Fitness</Text>
            <Text style={styles.certId}>ID: {data.certID || 'CH-2024-XXXX'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Statement */}
          <View style={styles.statementBox}>
            <Text style={styles.statementText}>
              This is to certify that I have medically examined
            </Text>
            <Text style={styles.patientName}>
              {data.patientName || `${data.patient?.firstName || ''} ${data.patient?.lastName || ''}` || 'The Patient'}
            </Text>
            <Text style={styles.statementText}>
              on {new Date(data.createdAt || Date.now()).toLocaleDateString()} via secure digital consultation.
            </Text>
          </View>

          {/* Diagnosis & Findings */}
          <View style={styles.findingsBox}>
            <View style={styles.findingRow}>
              <Text style={styles.findingLabel}>Clinical Diagnosis:</Text>
              <Text style={styles.findingValue}>{data.diagnosis || 'General Medical Condition'}</Text>
            </View>
            <View style={styles.findingRow}>
              <Text style={styles.findingLabel}>Recommendation:</Text>
              <Text style={styles.findingValue}>{data.comment || 'Patient is advised to take rest and follow prescribed treatment plan.'}</Text>
            </View>
          </View>

          <View style={styles.periodBox}>
            <View style={styles.periodItem}>
              <Text style={styles.periodLabel}>From</Text>
              <Text style={styles.periodDate}>{new Date(data.startDate || data.createdAt || Date.now()).toLocaleDateString()}</Text>
            </View>
            <View style={styles.periodItem}>
              <Text style={styles.periodLabel}>To</Text>
              <Text style={styles.periodDate}>{new Date(data.endDate || Date.now()).toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Verification QR Placeholder */}
          <View style={styles.footer}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={60} color="#cbd5e1" />
              <Text style={styles.qrText}>Scan to Verify</Text>
            </View>
            <View style={styles.docInfo}>
              <View style={styles.sigLine} />
              <Text style={styles.docName}>Dr. {doctor.firstName || ''} {doctor.lastName || 'Specialist'}</Text>
              <Text style={styles.docSpec}>{doctor.specialty || 'Authorized Medical Practitioner'}</Text>
              <Text style={styles.docReg}>Reg No: {doctor.doctorRegistrationNumber || 'REG-99201'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.verifyBtn}>
          <Ionicons name="shield-checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.verifyBtnText}>Verify Authenticity</Text>
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
  certificateCard: { backgroundColor: '#fff', borderRadius: 2, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', elevation: 8, borderTopWidth: 8, borderTopColor: '#1e40af' },
  certHeader: { alignItems: 'center', marginBottom: 24 },
  logoBox: { marginBottom: 16 },
  certTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  certId: { fontSize: 12, color: '#64748b', marginTop: 8, fontWeight: '600' },
  divider: { height: 2, backgroundColor: '#f1f5f9', marginVertical: 24 },
  statementBox: { alignItems: 'center', marginBottom: 32 },
  statementText: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 24 },
  patientName: { fontSize: 22, fontWeight: '800', color: '#1e40af', marginVertical: 8, textAlign: 'center' },
  findingsBox: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 12, marginBottom: 24 },
  findingRow: { marginBottom: 16 },
  findingLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  findingValue: { fontSize: 15, color: '#1e293b', lineHeight: 22, fontWeight: '500' },
  periodBox: { flexDirection: 'row', gap: 20 },
  periodItem: { flex: 1, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 8, alignItems: 'center' },
  periodLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  periodDate: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 },
  qrPlaceholder: { alignItems: 'center', gap: 4 },
  qrText: { fontSize: 9, color: '#94a3b8', fontWeight: '700' },
  docInfo: { alignItems: 'flex-end', flex: 1 },
  sigLine: { width: 140, height: 1, backgroundColor: '#cbd5e1', marginBottom: 12 },
  docName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  docSpec: { fontSize: 11, color: '#64748b', marginTop: 2 },
  docReg: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  verifyBtn: { backgroundColor: '#1e293b', marginTop: 24, padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)', elevation: 4 },
  verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
