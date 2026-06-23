import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CallInvitationModal({ visible, caller, appointment, onAccept, onDecline }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons name="videocam" size={40} color="#1e40af" />
          <Text style={styles.title}>Incoming Consultation</Text>
          <Text style={styles.caller}>{caller}</Text>
          
          {appointment && (
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>{appointment.category || 'General Consultation'}</Text>
              </View>
              {appointment.reason && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Reason:</Text>
                  <Text style={styles.infoValue}>{appointment.reason}</Text>
                </View>
              )}
            </View>
          )}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.decline]} onPress={onDecline}>
              <Ionicons name="call" size={24} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.accept]} onPress={onAccept}>
              <Ionicons name="videocam" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', width: '80%' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 12, color: '#1e293b' },
  caller: { fontSize: 16, color: '#64748b', marginTop: 4, marginBottom: 24 },
  actions: { flexDirection: 'row', gap: 32 },
  btn: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  decline: { backgroundColor: '#ef4444' },
  accept: { backgroundColor: '#10b981' },
  infoBox: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  infoValue: { fontSize: 13, color: '#1e293b', fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 8 },
});
