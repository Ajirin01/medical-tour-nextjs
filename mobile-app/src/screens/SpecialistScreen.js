import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegion } from '../context/RegionContext';
import { apiGet } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export default function SpecialistScreen({ navigation }) {
  const { region, getBaseUrl } = useRegion();
  const { colors } = useTheme();
  const currencySymbol = region === 'ireland' ? '€' : '$';
  const [specialists, setSpecialists] = useState([]);
  const [search, setSearch] = useState('');

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = getBaseUrl().replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      const data = await apiGet('medical-tourism/users/get-all/doctors/no-pagination');
      if (Array.isArray(data)) setSpecialists(data);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredSpecialists = specialists.filter(s => {
    // Filter out test accounts
    if (s.lastName?.toLowerCase().includes('test') || s.firstName?.toLowerCase().includes('test')) return false;

    return (s.firstName + ' ' + s.lastName).toLowerCase().includes(search.toLowerCase()) ||
    s.specialization?.toLowerCase().includes(search.toLowerCase())
  });

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('SpecialistDetail', { id: item._id })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.iconBackground }]}>
            {item.profileImage ? (
              <Image source={{ uri: getImageUrl(item.profileImage) }} style={styles.avatarImg} />
            ) : (
              <Ionicons name="person" size={24} color={colors.primary} />
            )}
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>Dr. {item.firstName} {item.lastName}</Text>
            <Text style={[styles.specialty, { color: colors.subtext }]}>{item.specialization || 'Specialist'}</Text>
          </View>
          <View style={styles.status}>
            <View style={[styles.dot, { backgroundColor: item.isOnline ? '#10b981' : '#94a3b8' }]} />
            <Text style={[styles.statusText, { color: colors.subtext }]}>{item.isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={styles.stat}><Ionicons name="star" size={16} color="#fbbf24" /><Text style={[styles.statText, { color: colors.subtext }]}>4.9 (120)</Text></View>
          <View style={styles.stat}><Ionicons name="cash-outline" size={16} color={colors.subtext} /><Text style={[styles.statText, { color: colors.subtext }]}>from {currencySymbol}20</Text></View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Find a Specialist</Text>
        <View style={[styles.searchBox, { backgroundColor: colors.input }]}>
          <Ionicons name="search" size={20} color={colors.subtext} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search doctors, specialties..." 
            placeholderTextColor={colors.subtext}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <FlatList
        data={filteredSpecialists}
        keyExtractor={item => item._id || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 5 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 48 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  list: { padding: 24, paddingBottom: 100 },
  card: { borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  specialty: { fontSize: 13, marginTop: 4 },
  status: { alignItems: 'flex-end' },
  dot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  statusText: { fontSize: 12 },
  cardFooter: { flexDirection: 'row', gap: 16, borderTopWidth: 1, paddingTop: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, fontWeight: '500' },
});
