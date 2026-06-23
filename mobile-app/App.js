import React, { useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RegionProvider } from './src/context/RegionContext';
import { SocketProvider, useSocket } from './src/context/SocketContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import SignInScreen from './src/screens/SignInScreen';
import RegionSelectionScreen from './src/screens/RegionSelectionScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SpecialistScreen from './src/screens/SpecialistScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import RecordsScreen from './src/screens/RecordsScreen';
import PricingScreen from './src/screens/PricingScreen';
import SpecialistDetailScreen from './src/screens/SpecialistDetailScreen';
import CallScreen from './src/screens/CallScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import PrescriptionManagementScreen from './src/screens/PrescriptionManagementScreen';
import PrescriptionDetailScreen from './src/screens/PrescriptionDetailScreen';
import CreatePrescriptionScreen from './src/screens/CreatePrescriptionScreen';
import LabReferralDetailScreen from './src/screens/LabReferralDetailScreen';
import CreateLabReferralScreen from './src/screens/CreateLabReferralScreen';
import CertificateDetailScreen from './src/screens/CertificateDetailScreen';
import CreateCertificateScreen from './src/screens/CreateCertificateScreen';
import CallSessionsScreen from './src/screens/CallSessionsScreen';
import BookAppointmentScreen from './src/screens/BookAppointmentScreen';
import ConsultNowScreen from './src/screens/ConsultNowScreen';
import AppointmentDetailScreen from './src/screens/AppointmentDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import { StripeProvider } from './src/utils/stripe';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const isSpecialist = user?.role === 'specialist' || user?.role === 'consultant';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtext,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 6,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'home' : 'home-outline',
            Specialists: focused ? 'people' : 'people-outline',
            Appointments: focused ? 'calendar' : 'calendar-outline',
            Records: focused ? 'folder' : 'folder-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      {!isSpecialist && <Tab.Screen name="Specialists" component={SpecialistScreen} />}
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen} 
        options={{ tabBarLabel: isSpecialist ? 'Schedule' : 'Appointments' }}
      />
      <Tab.Screen 
        name="Records" 
        component={RecordsScreen} 
        options={{ tabBarLabel: isSpecialist ? 'Patients' : 'Records' }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

// Reads auth state from context and routes accordingly — this is what
// makes login persist across app restarts.
function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    // AsyncStorage hasn't finished loading yet — show a neutral splash
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#1e40af" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        // ── Authenticated routes ─────────────────────────────
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="SpecialistDetail" component={SpecialistDetailScreen} />
          <Stack.Screen name="Call" component={CallScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="Pricing" component={PricingScreen} />
          <Stack.Screen name="PrescriptionManagement" component={PrescriptionManagementScreen} />
          <Stack.Screen name="PrescriptionDetail" component={PrescriptionDetailScreen} />
          <Stack.Screen name="CreatePrescription" component={CreatePrescriptionScreen} />
          <Stack.Screen name="LabReferralDetail" component={LabReferralDetailScreen} />
          <Stack.Screen name="CreateLabReferral" component={CreateLabReferralScreen} />
          <Stack.Screen name="CertificateDetail" component={CertificateDetailScreen} />
          <Stack.Screen name="CreateCertificate" component={CreateCertificateScreen} />
          <Stack.Screen name="CallSessions" component={CallSessionsScreen} />
          <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
          <Stack.Screen name="ConsultNow" component={ConsultNowScreen} />
          <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          {/* Also accessible as stack screens for direct deep linking */}
          <Stack.Screen name="Specialists" component={SpecialistScreen} />
          <Stack.Screen name="Appointments" component={AppointmentsScreen} />
          <Stack.Screen name="Records" component={RecordsScreen} />
        </>
      ) : (
        // ── Unauthenticated routes ───────────────────────────
        <>
          <Stack.Screen name="RegionSelection" component={RegionSelectionScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

function GlobalCallNavigator() {
  const navigation = useNavigation();
  const { acceptedCallInfo, clearAcceptedSession } = useSocket();

  useEffect(() => {
    if (acceptedCallInfo) {
      console.log('🚀 [NAV] Automatically navigating to Call for session:', acceptedCallInfo.sessionId);
      navigation.navigate('Call', { 
        sessionId: acceptedCallInfo.sessionId,
        appointmentId: acceptedCallInfo.appointmentId
      });
      clearAcceptedSession();
    }
  }, [acceptedCallInfo, navigation, clearAcceptedSession]);

  return null;
}

const STRIPE_KEY = "pk_test_51RbmjhEKPFuTaqOcdOvot8O5sILEjVUs9ULCEz7e1hAkJPGaPNFEtwYlhSi5yOLaVAGoMrMr5m4HcrRyFQZgwn3C00NEbjNixx";

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <ThemeProvider>
        <RegionProvider>
          <AuthProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </AuthProvider>
        </RegionProvider>
      </ThemeProvider>
    </StripeProvider>
  );
}

function AppContent() {
  const { colors, isDark } = useTheme();
  
  return (
    <NavigationContainer theme={{
      dark: isDark,
      colors: {
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      }
    }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <GlobalCallNavigator />
      <RootNavigator />
    </NavigationContainer>
  );
}
