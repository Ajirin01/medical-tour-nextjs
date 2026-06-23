import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { useTheme } from '../context/ThemeContext';
import { apiPut, apiUpload } from '../api/client';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
  const { user, login, token } = useAuth();
  const { getBaseUrl } = useRegion();
  const { colors, isDark } = useTheme();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialty, setSpecialty] = useState(user?.specialty || user?.specialization || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = getBaseUrl().replace('/api', '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', {
        uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      });

      const response = await apiUpload('medical-tourism/users/update/profile-image', formData);
      if (response.user) {
        await login(response.user, token);
        Alert.alert('Success', 'Profile image updated');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Upload Failed', 'Could not upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      const payload = { firstName, lastName, phone };
      if (user.role === 'specialist') {
        payload.specialization = specialty;
      }

      const response = await apiPut(`medical-tourism/users/${user._id}`, payload);
      if (response) {
        await login(response, token);
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChange, placeholder, editable = true }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.subtext }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.input, color: colors.text, borderColor: colors.border }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        editable={editable}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Text style={[styles.saveText, { color: colors.primary }]}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} disabled={uploading}>
            {user?.profileImage ? (
              <Image source={{ uri: getImageUrl(user.profileImage) }} style={styles.avatar} />
            ) : (
              <View style={[styles.placeholderAvatar, { backgroundColor: colors.iconBackground }]}>
                <Ionicons name="person" size={50} color={colors.primary} />
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarNote, { color: colors.subtext }]}>Tap to change photo</Text>
        </View>

        <View style={styles.form}>
          <InputField label="First Name" value={firstName} onChange={setFirstName} placeholder="Enter first name" />
          <InputField label="Last Name" value={lastName} onChange={setLastName} placeholder="Enter last name" />
          <InputField label="Email Address" value={user?.email} editable={false} />
          <InputField label="Phone Number" value={phone} onChange={setPhone} placeholder="+1 234 567 890" />
          
          {(user.role === 'specialist' || user.role === 'consultant') && (
            <InputField label="Specialization" value={specialty} onChange={setSpecialty} placeholder="e.g. Cardiologist" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 40, borderBottomWidth: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  saveText: { fontSize: 16, fontWeight: '700' },
  scroll: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, position: 'relative' },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  placeholderAvatar: { width: '100%', height: '100%', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarNote: { marginTop: 12, fontSize: 14, fontWeight: '500' },
  form: { gap: 20 },
  inputContainer: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { padding: 16, borderRadius: 12, borderWidth: 1, fontSize: 16 },
});
