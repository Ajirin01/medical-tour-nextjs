import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, SafeAreaView, ActivityIndicator, Alert, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function BookAppointmentScreen({ navigation, route }) {
  const { user } = useAuth();
  const initialSpecialty = route.params?.specialty || null;
  const [slots, setSlots] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [selectedDay, setSelectedDay] = useState(null); // Will hold a Date object
  const isLocked = route.params?.specialty ? true : false;
  const [showSpecialtyPicker, setShowSpecialtyPicker] = useState(false);

  // Booking modal
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ userRole: 'specialist', isBooked: 'false' });
      const [slotsRes] = await Promise.all([
        apiGet(`medical-tourism/availabilities/slots/by?${params.toString()}`),
      ]);
      const rawSlots = slotsRes?.data || slotsRes || [];
      setSlots(Array.isArray(rawSlots) ? rawSlots : []);
    } catch (err) {
      console.error('BookAppointment fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Derive unique specialties from loaded slots
  const specialties = [...new Set(
    slots
      .map(s => s.user?.specialty)
      .filter(Boolean)
  )].sort();

  useEffect(() => { fetchData(); }, [fetchData]);

  // Generate next 14 days for the filter row
  const NEXT_DAYS = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0,0,0,0);
    return d;
  });

  // --- Expansion & Filtering ---
  const generateExpandedSlots = () => {
    const expanded = [];
    const jsDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (const currentDate of NEXT_DAYS) {
      const dayName = jsDays[currentDate.getDay()];
      
      slots.forEach(slot => {
        const doc = slot.user;
        if (!doc) return;

        // Apply filters
        const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.toLowerCase();
        const spec = (doc.specialty || '').toLowerCase();
        const matchesSearch = !search || fullName.includes(search.toLowerCase()) || spec.includes(search.toLowerCase());
        const matchesDay = !selectedDay || currentDate.getTime() === selectedDay.getTime();
        const matchesSpecialty = !selectedSpecialty || doc.specialty === selectedSpecialty;

        if (!matchesSearch || !matchesDay || !matchesSpecialty) return;
        
        if (slot.type === 'recurring' && slot.dayOfWeek === dayName) {
           expanded.push({
             ...slot,
             _id: `${slot._id}-${currentDate.getTime()}`, // Unique ID for list
             originalId: slot._id,
             actualDate: new Date(currentDate)
           });
        } else if (slot.type === 'one-time' && slot.date) {
           const slotDate = new Date(slot.date);
           slotDate.setHours(0, 0, 0, 0);
           if (slotDate.getTime() === currentDate.getTime()) {
             expanded.push({
               ...slot,
               _id: `${slot._id}-${currentDate.getTime()}`,
               originalId: slot._id,
               actualDate: new Date(currentDate)
             });
           }
        }
      });
    }
    
    // Sort by actual date, then start time
    return expanded.sort((a, b) => {
      if (a.actualDate.getTime() !== b.actualDate.getTime()) {
        return a.actualDate - b.actualDate;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  };

  const filtered = generateExpandedSlots();

  const handleBookSlot = () => {
    if (!selectedSlot) return;
    
    const appointmentDate = selectedSlot.actualDate;
    setShowBookModal(false);
    
    navigation.navigate('Checkout', {
      doctor: selectedSlot.user,
      amount: selectedSlot.user?.appointmentPrice || selectedSlot.user?.price || 50,
      slotData: {
        _id: selectedSlot.originalId,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        type: selectedSlot.type,
        category: selectedSlot.category,
        duration: selectedSlot.duration
      },
      appointmentDate: appointmentDate.toISOString()
    });
  };

  const renderSlot = ({ item }) => {
    const doc = item.user;
    return (
      <TouchableOpacity
        style={styles.slotCard}
        onPress={() => { setSelectedSlot(item); setShowBookModal(true); }}
      >
        <View style={styles.slotLeft}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={22} color="#1e40af" />
          </View>
          <View style={styles.slotInfo}>
            <Text style={styles.doctorName}>Dr. {doc?.firstName} {doc?.lastName}</Text>
            <Text style={styles.specialty}>{doc?.specialty || 'Specialist'}</Text>
          </View>
        </View>
        <View style={styles.slotRight}>
          <View style={[styles.dayBadge, { backgroundColor: item.type === 'one-time' ? '#f0fdf4' : '#eff6ff' }]}>
            <Text style={[styles.dayText, { color: item.type === 'one-time' ? '#16a34a' : '#1e40af' }]}>
              {item.actualDate.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <Text style={styles.timeRange}>{item.startTime} – {item.endTime}</Text>
          <Text style={styles.duration}>{item.duration} min</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors or specialties..."
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        {/* Specialty picker */}
        <TouchableOpacity 
          style={[styles.filterChip, isLocked && { opacity: 0.8 }]} 
          onPress={() => !isLocked && setShowSpecialtyPicker(true)}
        >
          <Ionicons name="medical-outline" size={14} color={selectedSpecialty ? '#1e40af' : '#64748b'} />
          <Text style={[styles.filterChipText, selectedSpecialty && styles.filterChipActive]}>
            {selectedSpecialty || 'All Specialties'}
          </Text>
          {!isLocked && <Ionicons name="chevron-down" size={14} color="#94a3b8" />}
        </TouchableOpacity>

        {/* Day filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
          <TouchableOpacity
            style={[styles.dayChip, !selectedDay && styles.dayChipActive]}
            onPress={() => setSelectedDay(null)}
          >
            <Text style={[styles.dayChipText, !selectedDay && styles.dayChipTextActive]}>All</Text>
          </TouchableOpacity>
          {NEXT_DAYS.map(d => (
            <TouchableOpacity
              key={d.toISOString()}
              style={[styles.dayChip, selectedDay?.getTime() === d.getTime() && styles.dayChipActive]}
              onPress={() => setSelectedDay(selectedDay?.getTime() === d.getTime() ? null : d)}
            >
              <Text style={[styles.dayChipText, selectedDay?.getTime() === d.getTime() && styles.dayChipTextActive]}>
                {d.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.resultCount}>{filtered.length} slot{filtered.length !== 1 ? 's' : ''} available</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1e40af" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={renderSlot}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="calendar-clear-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No available slots found</Text>
              <Text style={styles.emptySubText}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}

      {/* Specialty Picker Modal */}
      <Modal visible={showSpecialtyPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModal}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Filter by Specialty</Text>
              <TouchableOpacity onPress={() => setShowSpecialtyPicker(false)}>
                <Ionicons name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.pickerItem}
              onPress={() => { setSelectedSpecialty(null); setShowSpecialtyPicker(false); }}
            >
              <Text style={[styles.pickerItemText, !selectedSpecialty && { color: '#1e40af', fontWeight: '700' }]}>
                All Specialties
              </Text>
            </TouchableOpacity>
            <FlatList
              data={specialties}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => { setSelectedSpecialty(item); setShowSpecialtyPicker(false); }}
                >
                  <Text style={[styles.pickerItemText, selectedSpecialty === item && { color: '#1e40af', fontWeight: '700' }]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Booking Confirmation Modal */}
      <Modal visible={showBookModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.bookModal}>
            <Text style={styles.bookModalTitle}>Confirm Booking</Text>
            {selectedSlot && (
              <>
                <View style={styles.bookDetail}>
                  <Ionicons name="person" size={20} color="#1e40af" />
                  <Text style={styles.bookDetailText}>
                    Dr. {selectedSlot.user?.firstName} {selectedSlot.user?.lastName}
                  </Text>
                </View>
                <View style={styles.bookDetail}>
                  <Ionicons name="calendar" size={20} color="#1e40af" />
                  <Text style={styles.bookDetailText}>
                    {selectedSlot.actualDate.toLocaleDateString('en-IE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.bookDetail}>
                  <Ionicons name="time" size={20} color="#1e40af" />
                  <Text style={styles.bookDetailText}>{selectedSlot.startTime} – {selectedSlot.endTime}</Text>
                </View>
                <View style={styles.bookDetail}>
                  <Ionicons name="timer" size={20} color="#1e40af" />
                  <Text style={styles.bookDetailText}>{selectedSlot.duration} minutes</Text>
                </View>
              </>
            )}
            <View style={styles.bookModalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowBookModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleBookSlot} disabled={booking}>
                {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  searchRow: { padding: 16, paddingBottom: 8, backgroundColor: '#fff' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 14, height: 46, gap: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1e293b' },
  filtersRow: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', gap: 6 },
  filterChipText: { fontSize: 13, color: '#64748b', fontWeight: '500' },
  filterChipActive: { color: '#1e40af', fontWeight: '700' },
  dayScroll: { marginTop: 4 },
  dayChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8 },
  dayChipActive: { backgroundColor: '#1e40af' },
  dayChipText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  dayChipTextActive: { color: '#fff' },
  resultCount: { paddingHorizontal: 20, paddingVertical: 10, fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  list: { padding: 16, paddingBottom: 100 },
  slotCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', elevation: 2 },
  slotLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  slotInfo: { flex: 1 },
  doctorName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  specialty: { fontSize: 12, color: '#64748b', marginTop: 2 },
  slotRight: { alignItems: 'flex-end', gap: 4 },
  dayBadge: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  dayText: { fontSize: 12, fontWeight: '700', color: '#1e40af' },
  timeRange: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  duration: { fontSize: 11, color: '#94a3b8' },
  empty: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  emptySubText: { fontSize: 13, color: '#94a3b8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 32 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  pickerTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  pickerItem: { padding: 18, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  pickerItemText: { fontSize: 15, color: '#1e293b' },
  pickerItemSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  bookModal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28 },
  bookModalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 24, textAlign: 'center' },
  bookDetail: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  bookDetailText: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
  bookModalBtns: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#64748b' },
  confirmBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#1e40af', alignItems: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
