import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegion } from '../context/RegionContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const CreateCertificateScreen = ({ route, navigation }) => {
  const { sessionId } = route.params || {};
  const { getBaseUrl, region } = useRegion();
  const { token } = useAuth();
  
  const [diagnosis, setDiagnosis] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCertID = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `CH-${new Date().getFullYear()}-${rand}`;
  };

  const handleSubmit = async () => {
    if (!diagnosis.trim() || !comment.trim()) {
      Alert.alert('Error', 'Diagnosis and Comments are required.');
      return;
    }

    setLoading(true);
    try {
      const headers = { 'x-platform': region, 'Authorization': `Bearer ${token}` };
      
      const sessionRes = await axios.get(`${getBaseUrl()}/video-sessions/${sessionId}`, { headers });
      const sessionData = sessionRes.data?.session;

      if (!sessionData) throw new Error("Could not fetch session details.");

      const payload = {
        appointment: sessionData.appointment?._id || sessionData.appointment,
        session: sessionId,
        patient: sessionData.user?._id || sessionData.user,
        doctor: sessionData.specialist?._id || sessionData.specialist,
        diagnosis,
        comment,
        certID: generateCertID(),
        doctorSignature: ""
      };

      await axios.post(`${getBaseUrl()}/certificates/create`, payload, { headers });

      Alert.alert('Success', 'Medical Certificate generated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error('Error creating certificate:', error);
      Alert.alert('Error', 'Failed to generate medical certificate. Please try again.');
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
        <Text style={styles.title}>Issue Certificate</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Ionicons name="ribbon" size={20} color="#ea580c" />
          <Text style={styles.infoText}>Generate an official medical certificate. A unique ID will be automatically assigned.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Diagnosis <Text style={{color: 'red'}}>*</Text></Text>
          <TextInput style={styles.input} placeholder="e.g. Severe Migraine" value={diagnosis} onChangeText={setDiagnosis} placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Comments / Recommendations <Text style={{color: 'red'}}>*</Text></Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Describe condition and rest period..." value={comment} onChangeText={setComment} placeholderTextColor="#94a3b8" multiline numberOfLines={4} textAlignVertical="top" />
        </View>

        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="document-lock" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Generate Certificate</Text>
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
  infoBox: { flexDirection: 'row', backgroundColor: '#fff7ed', padding: 16, borderRadius: 12, marginBottom: 24, gap: 12, alignItems: 'center' },
  infoText: { flex: 1, color: '#ea580c', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#1e293b' },
  textArea: { height: 120 },
  submitButton: { backgroundColor: '#ea580c', borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});

export default CreateCertificateScreen;
