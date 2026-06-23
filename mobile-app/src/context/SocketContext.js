import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useRegion } from './RegionContext';
import { apiGet, apiPost } from '../api/client';
import CallInvitationModal from '../components/CallInvitationModal';
import { Audio } from 'expo-av';
import { getSocketUrl } from '../utils/fixUrl';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { region, getBaseUrl } = useRegion();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const [onlineSpecialists, setOnlineSpecialists] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [acceptedCallInfo, setAcceptedCallInfo] = useState(null);
  const ringtoneRef = useRef(null);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    if (!socketUrl) return;
    
    const newSocket = io(socketUrl, { auth: { token } });
    socketRef.current = newSocket;
    setSocket(newSocket);
    
    const emitOnline = () => {
      const allowedRoles = ['specialist', 'consultant'];
      if (user && allowedRoles.includes(user.role)) {
        console.log('📡 [DEBUG] Emitting specialist-online from mobile:', user.firstName);
        socketRef.current.emit('specialist-online', user);
      }
    };

    socketRef.current.on('connect', () => {
      console.log('🔌 [DEBUG] Socket Connected:', socketRef.current.id);
      socketRef.current.emit('join-platform', { platform: region });
      socketRef.current.emit('get-online-specialists');
      
      // If user is a specialist, tell the server they are online
      emitOnline();
    });

    socketRef.current.on('reconnect', () => {
      emitOnline();
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 [DEBUG] Socket Disconnected:', reason);
    });
    
    socketRef.current.on('update-specialists', (data) => {
      console.log('📡 [DEBUG] Received online specialists:', data);
      setOnlineSpecialists(data);
    });

    socketRef.current.on('incoming-call', async ({ appointmentId }) => {
      console.log('🛎️ [MOBILE] Received incoming-call for appt:', appointmentId);
      playRingtone();
      try {
        const appointment = await apiGet(`medical-tourism/consultation-appointments/${appointmentId}`);
        setIncomingCall(appointment);
        setShowCallModal(true);
      } catch (err) {
        console.error('Failed to fetch appointment for call:', err);
      }
    });

    socketRef.current.on('session-created', ({ appointmentId: apptId, session }) => {
      stopRingtone();
      // If we are a specialist and we just created a session, we might want to navigate
      // But usually the accept-call handler handles this.
    });
    
    return () => {
      socketRef.current?.disconnect();
      stopRingtone();
    };
  }, [token, region, user]);

  const playRingtone = async () => {
    try {
      if (ringtoneRef.current) {
        await ringtoneRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: '/assets/sounds/ringtone.mp3' },
        { shouldPlay: true, isLooping: true }
      );
      ringtoneRef.current = sound;
    } catch (error) {
      console.log('🔈 Sound playback failed (Policy):', error.message);
    }
  };

  const stopRingtone = async () => {
    if (ringtoneRef.current) {
      await ringtoneRef.current.stopAsync();
      await ringtoneRef.current.unloadAsync();
      ringtoneRef.current = null;
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall || !socket) return;
    stopRingtone();
    
    console.log('✅ [MOBILE] Accepting call...');
    socket.emit('accept-call', { 
      specialistId: user._id, 
      appointmentId: incomingCall._id 
    });

    try {
      const res = await apiPost('medical-tourism/video-sessions', {
        appointment: incomingCall._id,
        specialist: user._id,
        user: incomingCall.patient?._id || incomingCall.patient
      });

      if (res.success) {
        socket.emit('session-created', {
          appointmentId: incomingCall._id,
          session: res.session,
          specialistToken: res.session.specialistToken,
          patientToken: res.session.patientToken
        });
        
        setShowCallModal(false);
        setAcceptedCallInfo({
          sessionId: res.session._id,
          appointmentId: incomingCall._id
        });
        // Navigation should be handled by a global navigation ref or by the component consuming this
      }
    } catch (err) {
      console.error('Error accepting call:', err);
    }
  };

  const clearAcceptedSession = () => setAcceptedCallInfo(null);

  const handleDeclineCall = () => {
    if (!incomingCall || !socket) return;
    stopRingtone();
    socket.emit('reject-call', { 
      specialistId: user._id, 
      appointmentId: incomingCall._id 
    });
    setShowCallModal(false);
    setIncomingCall(null);
  };

  return (
    <SocketContext.Provider value={{ 
      socket, 
      onlineSpecialists, 
      incomingCall, 
      acceptedCallInfo,
      clearAcceptedSession,
      handleAcceptCall, 
      handleDeclineCall 
    }}>
      {children}
      <CallInvitationModal 
        visible={showCallModal}
        caller={incomingCall?.patient?.firstName ? `${incomingCall.patient.firstName} ${incomingCall.patient.lastName}` : "Incoming Patient"}
        appointment={incomingCall}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
