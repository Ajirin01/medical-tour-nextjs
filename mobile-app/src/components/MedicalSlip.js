import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MedicalSlip({ appointment }) {
  if (!appointment) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consultation Slip</Text>
      <View style={styles.row}><Text style={styles.label}>Doctor</Text><Text style={styles.val}>{appointment.specialist?.firstName} {appointment.specialist?.lastName}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Date</Text><Text style={styles.val}>{new Date(appointment.appointmentDate).toLocaleDateString()}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Time</Text><Text style={styles.val}>{appointment.time}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Type</Text><Text style={styles.val}>{appointment.type || 'Video'}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 16, marginVertical: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#1e40af', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, color: '#64748b' },
  val: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
});
