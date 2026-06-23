import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegion } from '../context/RegionContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreateLabReferralScreen = ({ route, navigation }) => {
  const { sessionId, existingLabs = [] } = route.params || {};
  const { getBaseUrl, region } = useRegion();
  const { token } = useAuth();
  
  const [testName, setTestName] = useState('');
  const [labName, setLabName] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!testName.trim()) {
      Alert.alert('Error', 'Test Name is required.');
      return;
    }

    setLoading(true);
    try {
      const headers = { 'x-platform': region, 'Authorization': `Bearer ${token}` };
      
      const newLab = {
        testName,
        labName: labName.trim() || undefined,
        note: note.trim() || undefined,
        status: 'pending',
        referralDate: new Date()
      };

      const updatedLabs = [...existingLabs, newLab];

      await axios.put(`${getBaseUrl()}/video-sessions/${sessionId}`, {
        labReferrals: updatedLabs
      }, { headers });

      Alert.alert('Success', 'Lab Referral added to session successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error adding lab referral:', error);
      Alert.alert('Error', 'Failed to add lab referral. Please try again.');
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
        <Text style={styles.title}>Add Lab Referral</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Ionicons name="flask" size={20} color="#16a34a" />
          <Text style={styles.infoText}>Request a laboratory test for this patient.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Test Name <Text style={{color: 'red'}}>*</Text></Text>
          <TextInput style={styles.input} placeholder="e.g. Complete Blood Count (CBC)" value={testName} onChangeText={setTestName} placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Lab Name (Optional)</Text>
          <TextInput style={styles.input} placeholder="e.g. City Central Lab" value={labName} onChangeText={setLabName} placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doctor's Note (Optional)</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Additional instructions..." value={note} onChangeText={setNote} placeholderTextColor="#94a3b8" multiline numberOfLines={4} textAlignVertical="top" />
        </View>

        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Issue Referral</Text>
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
  infoBox: { flexDirection: 'row', backgroundColor: '#f0fdf4', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12, alignItems: 'center' },
  infoText: { flex: 1, color: '#16a34a', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#1e293b' },
  textArea: { height: 100 },
  submitButton: { backgroundColor: '#16a34a', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default CreateLabReferralScreen;
