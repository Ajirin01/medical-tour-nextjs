import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
const PrescriptionManagementScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>PrescriptionManagement</Text>
    <TouchableOpacity style={styles.btn} onPress={() => navigation && navigation.goBack()}>
      <Text style={styles.btnText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '700', color: '#1e293b', marginBottom: 20 },
  btn: { backgroundColor: '#1e40af', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
});
export default PrescriptionManagementScreen;
