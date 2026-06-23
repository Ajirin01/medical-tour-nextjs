import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegion } from '../context/RegionContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreatePrescriptionScreen = ({ route, navigation }) => {
  const { sessionId, existingPrescriptions = [] } = route.params || {};
  const { getBaseUrl, region } = useRegion();
  const { token } = useAuth();
  
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!medication.trim() || !dosage.trim() || !frequency.trim()) {
      Alert.alert('Error', 'Please fill in all fields (Medication, Dosage, and Frequency).');
      return;
    }

    setLoading(true);
    try {
      const headers = { 'x-platform': region, 'Authorization': `Bearer ${token}` };
      
      const newPrescription = { medication, dosage, frequency };
      const updatedPrescriptions = [...existingPrescriptions, newPrescription];

      await axios.put(`${getBaseUrl()}/video-sessions/${sessionId}`, {
        prescriptions: updatedPrescriptions
      }, { headers });

      Alert.alert('Success', 'Prescription added to session successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error adding prescription:', error);
      Alert.alert('Error', 'Failed to add prescription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Prescription</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#4f46e5" />
          <Text style={styles.infoText}>This will be permanently attached to the consultation session records.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medication Name</Text>
          <TextInput style={styles.input} placeholder="e.g. Amoxicillin" value={medication} onChangeText={setMedication} placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosage</Text>
          <TextInput style={styles.input} placeholder="e.g. 500mg" value={dosage} onChangeText={setDosage} placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Frequency</Text>
          <TextInput style={styles.input} placeholder="e.g. Twice a day for 7 days" value={frequency} onChangeText={setFrequency} placeholderTextColor="#94a3b8" />
        </View>

        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Issue Prescription</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backButton: { padding: 8, marginRight: 12, backgroundColor: '#f8fafc', borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  scrollContent: { padding: 24 },
  infoBox: { flexDirection: 'row', backgroundColor: '#eef2ff', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12, alignItems: 'center' },
  infoText: { flex: 1, color: '#4f46e5', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#1e293b' },
  submitButton: { backgroundColor: '#4f46e5', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default CreatePrescriptionScreen;
