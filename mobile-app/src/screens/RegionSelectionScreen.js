import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRegion } from '../context/RegionContext';
import { Ionicons } from '@expo/vector-icons';

export default function RegionSelectionScreen({ navigation }) {
  const { setRegion } = useRegion();

  const handleSelectRegion = (regionStr) => {
    setRegion(regionStr);
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="globe-outline" size={80} color="#1e40af" />
        <Text style={styles.title}>Welcome to SozoDigicare</Text>
        <Text style={styles.subtitle}>Select your region to continue</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionCard} onPress={() => handleSelectRegion('global')}>
          <View style={styles.iconContainer}>
            <Ionicons name="earth" size={32} color="#1e40af" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Global Portal</Text>
            <Text style={styles.optionSubtitle}>Access services worldwide</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} onPress={() => handleSelectRegion('ireland')}>
          <View style={[styles.iconContainer, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="location" size={32} color="#16a34a" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Irish Portal</Text>
            <Text style={styles.optionSubtitle}>Services specific to Ireland</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginTop: 24, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#64748b', marginTop: 8, textAlign: 'center' },
  optionsContainer: { gap: 16 },
  optionCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 20, 
    borderRadius: 16, 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    elevation: 3 
  },
  iconContainer: { 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    backgroundColor: '#eff6ff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  optionSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
});
