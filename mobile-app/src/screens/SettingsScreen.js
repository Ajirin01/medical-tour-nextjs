import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRegion } from '../context/RegionContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { region } = useRegion();
  const { isDark, toggleTheme, colors } = useTheme();

  // Local state for toggles (should ideally be synced with backend/AsyncStorage)
  const [notifications, setNotifications] = React.useState(true);
  const [twoFactor, setTwoFactor] = React.useState(false);
  const [emailUpdates, setEmailUpdates] = React.useState(true);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = region === 'ireland' 
      ? (process.env.EXPO_PUBLIC_IRISH_API_URL || 'https://api.sozodigicare.com') 
      : (process.env.EXPO_PUBLIC_GLOBAL_API_URL || 'https://api.sozodigicare.com');
    return `${baseUrl.replace('/api', '')}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: () => logout()
      }
    ]);
  };

  const SettingItem = ({ icon, title, value, type = 'chevron', onPress, color = colors.primary }) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={[styles.iconBox, { backgroundColor: isDark ? color + '33' : color + '11' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
      {type === 'chevron' && <Ionicons name="chevron-forward" size={20} color={colors.subtext} />}
      {type === 'switch' && (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: '#cbd5e1', true: colors.primary }}
        />
      )}
      {type === 'text' && <Text style={{ color: colors.subtext }}>{value}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Profile Card */}
        <TouchableOpacity 
          style={[styles.profileCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image source={{ uri: getImageUrl(user.profileImage) }} style={styles.avatar} />
            ) : (
              <View style={[styles.placeholderAvatar, { backgroundColor: colors.iconBackground }]}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user?.firstName} {user?.lastName}</Text>
            <Text style={{ color: colors.subtext }}>{user?.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: isDark ? '#1e40af33' : '#eff6ff' }]}>
              <Text style={[styles.roleText, { color: colors.primary }]}>{user?.role?.toUpperCase()}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>APPEARANCE</Text>
          <SettingItem 
            icon="moon" 
            title="Night Mode" 
            value={isDark} 
            type="switch" 
            onPress={toggleTheme} 
            color="#6366f1"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>ACCOUNT</Text>
          <SettingItem 
            icon="earth" 
            title="Region" 
            value={region === 'ireland' ? 'Ireland' : 'Global'} 
            type="text"
            onPress={() => navigation.navigate('RegionSelection')}
            color="#22c55e"
          />
          <SettingItem 
            icon="person-outline" 
            title="Edit Profile" 
            onPress={() => navigation.navigate('Profile')}
          />
          <SettingItem 
            icon="shield-checkmark-outline" 
            title="Two-Factor Auth" 
            value={twoFactor}
            type="switch"
            onPress={() => setTwoFactor(!twoFactor)}
            color="#10b981" 
          />
          <SettingItem 
            icon="notifications-outline" 
            title="Push Notifications" 
            value={notifications}
            type="switch"
            onPress={() => setNotifications(!notifications)}
            color="#f59e0b" 
          />
          <SettingItem 
            icon="mail-outline" 
            title="Email Updates" 
            value={emailUpdates}
            type="switch"
            onPress={() => setEmailUpdates(!emailUpdates)}
            color="#3b82f6" 
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subtext }]}>SUPPORT</Text>
          <SettingItem icon="help-circle-outline" title="Help Center" color="#64748b" />
          <SettingItem icon="information-circle-outline" title="Terms & Privacy" color="#64748b" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.4 (Build 2405)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  scroll: { paddingBottom: 60 },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: 24, marginBottom: 8 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', marginRight: 20 },
  avatar: { width: '100%', height: '100%' },
  placeholderAvatar: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  roleText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  section: { marginTop: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 24, padding: 18, borderRadius: 16, backgroundColor: '#fef2f2', gap: 10 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
  versionText: { textAlign: 'center', color: '#94a3b8', fontSize: 12, marginBottom: 20 },
});
