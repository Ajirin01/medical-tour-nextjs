import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

export default function ConfirmEndCallModal({ visible, onConfirm, onCancel, title, message }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title || "End Call?"}</Text>
          <Text style={styles.msg}>{message || "Are you sure you want to end this consultation?"}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancel} onPress={onCancel}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.confirm} onPress={onConfirm}><Text style={styles.confirmText}>End Call</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '80%' },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  msg: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancel: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  cancelText: { color: '#64748b', fontWeight: '600' },
  confirm: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#ef4444' },
  confirmText: { color: '#fff', fontWeight: '600' },
});
