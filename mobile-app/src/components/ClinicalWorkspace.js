import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
export default function ClinicalWorkspace({ session }) {
  return <View style={styles.c}><Text style={styles.t}>Clinical Workspace</Text><Text style={styles.sub}>{session?.id || 'No active session'}</Text></View>;
}
const styles = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  t: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  sub: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
});
