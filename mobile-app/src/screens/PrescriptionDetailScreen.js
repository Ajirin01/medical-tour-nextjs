import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrescriptionDetailScreen({ route, navigation }) {
  const { prescription, session } = route.params || {};

  // Handle case where we might be passing just the session which contains prescriptions
  const data = prescription || session?.prescriptions?.[0] || {};
  const doctor = session?.specialist || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Medical Prescription</Text>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={24} color="#1e40af" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.prescriptionCard}>
          {/* Clinic Header */}
          <View style={styles.clinicHeader}>
            <View style={styles.logoCircle}>
              <Ionicons name="medical" size={30} color="#1e40af" />
            </View>
            <View>
              <Text style={styles.clinicName}>SozoDigiCare Global</Text>
              <Text style={styles.clinicSub}>Digital Consultation Services</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Doctor & Patient Info */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Doctor</Text>
              <Text style={styles.infoValue}>Dr. {doctor.firstName} {doctor.lastName}</Text>
              <Text style={styles.infoSub}>{doctor.specialty || 'General Practitioner'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date Issued</Text>
              <Text style={styles.infoValue}>{new Date(session?.createdAt || Date.now()).toLocaleDateString()}</Text>
              <Text style={styles.infoSub}>Valid for 6 months</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Medication List */}
          <Text style={styles.sectionTitle}>Medications</Text>
          {(data.medications || []).length > 0 ? (
            data.medications.map((med, index) => (
              <View key={index} style={styles.medicationItem}>
                <View style={styles.medHeader}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                </View>
                <Text style={styles.medInstructions}>{med.instructions}</Text>
                <View style={styles.medFooter}>
                  <Text style={styles.medDuration}>Duration: {med.duration || 'As prescribed'}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyMed}>
              <Text style={styles.medInstructions}>{data.medication || 'No medication details provided.'}</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Doctor Signature Area */}
          <View style={styles.signatureArea}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Digital Signature</Text>
            <Text style={styles.docId}>License No: {doctor.doctorRegistrationNumber || 'REG-99201'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.downloadBtn}>
          <Ionicons name="download-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.downloadText}>Download PDF Copy</Text>
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
  prescriptionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', elevation: 5 },
  clinicHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  logoCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  clinicName: { fontSize: 18, fontWeight: '800', color: '#1e40af' },
  clinicSub: { fontSize: 12, color: '#64748b' },
  divider: { hieght: 1, backgroundColor: '#f1f5f9', marginVertical: 20, height: 1 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  infoSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  medicationItem: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  medName: { fontSize: 16, fontWeight: '700', color: '#1e40af' },
  medDosage: { fontSize: 14, fontWeight: '600', color: '#475569' },
  medInstructions: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  medFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  medDuration: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  emptyMed: { padding: 20, alignItems: 'center' },
  signatureArea: { alignItems: 'flex-end', marginTop: 20 },
  signatureLine: { width: 150, height: 1, backgroundColor: '#cbd5e1', marginBottom: 8 },
  signatureLabel: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  docId: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  downloadBtn: { backgroundColor: '#1e40af', marginTop: 24, padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 12px rgba(30, 64, 175, 0.2)', elevation: 4 },
  downloadText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
