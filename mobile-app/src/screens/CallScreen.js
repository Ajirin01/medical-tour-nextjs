import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Dimensions, Platform, TextInput, ScrollView, KeyboardAvoidingView, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiGet, apiPost, apiPut, apiUpload } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

let AgoraRTC;
if (Platform.OS === 'web') {
  AgoraRTC = require('agora-rtc-sdk-ng');
}

const { width, height } = Dimensions.get('window');

export default function CallScreen({ route, navigation }) {
  const { sessionId, appointmentId, specialistId, specialistName } = route.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const dialingSoundRef = useRef(null);
  const hasEmittedInvite = useRef(false);
 
  const { socket } = useSocket();
  const [specialist, setSpecialist] = useState(null);
  const [invitationRejected, setInvitationRejected] = useState(false);
  const [busyMessage, setBusyMessage] = useState("");

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatNotification, setChatNotification] = useState(null);

  const [timeLeft, setTimeLeft] = useState(null);
  const [showClinicalWorkspace, setShowClinicalWorkspace] = useState(false);
  const [clinicalData, setClinicalData] = useState({
    notes: "",
    prescriptions: [],
    labReferrals: []
  });
  const [isSavingClinical, setIsSavingClinical] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState("End Call?");
  const [confirmModalMessage, setConfirmModalMessage] = useState("Are you sure you want to end this consultation?");
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const agoraClientRef = useRef(null);
  const localTracksRef = useRef({ video: null, audio: null });
  const remoteUsersRef = useRef({});
  const joiningRef = useRef(false);
  const cleanupRef = useRef(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);

  const AGORA_APP_ID = "e0cc3fbd75624f5cb40accf365c6df76";
 
  useEffect(() => {
    if (socket && specialistId && appointmentId && !hasEmittedInvite.current) {
      hasEmittedInvite.current = true;
      console.log(`📡 [Call] Emitting invite-specialist-to-call for ${specialistName || specialistId}`);
      socket.emit("invite-specialist-to-call", {
        specialistId,
        appointmentId,
      });
      setWaiting(true);
    }
  }, [socket, specialistId, appointmentId, specialistName]);

  useEffect(() => {
    if (specialistId) {
      apiGet(`users/${specialistId}`).then(setSpecialist).catch(console.error);
    }
    
    if (waiting) {
      playDialingSound();
    } else {
      stopDialingSound();
    }
    
    if (socket) {
      socket.on("session-created", ({ appointmentId: incomingId, session: newSession }) => {
        if (incomingId === appointmentId) {
          console.log("🚀 [Call] Session created via socket!");
          stopDialingSound();
          setSession(newSession);
          setWaiting(false);
          setLoading(false);
        }
      });

      socket.on("call-rejected", (data) => {
        if (data.appointmentId === appointmentId) {
          stopDialingSound();
          setWaiting(true);
          setInvitationRejected(true);
        }
      });

      socket.on("specialist-busy", (data) => {
        if (data.appointmentId === appointmentId) {
          stopDialingSound();
          setBusyMessage("Doctor is currently on another call. Please wait...");
        }
      });

      socket.on("request-patient-end-session", (data) => {
        const reqAptId = data.appointmentId || data.roomId;
        const myAptId = appointmentId || (session?.appointment?._id || session?.appointment);
        console.log("🛎️ [Call] request-patient-end-session received:", reqAptId, "My ID:", myAptId, "Role:", user?.role);
        
        // If IDs match and we are NOT the specialist, we show the modal
        const isNotSpecialist = user.role !== 'specialist' && user.role !== 'consultant';
        if (reqAptId?.toString() === myAptId?.toString() && isNotSpecialist) {
          setConfirmModalTitle("Doctor Requested to End Session");
          setConfirmModalMessage("The doctor has requested to end the session. Please confirm to proceed.");
          setShowConfirmEndModal(true);
        }
      });

      socket.on("patient-rejected-end-session", ({ appointmentId: reqAptId }) => {
        const myAptId = appointmentId || (session?.appointment?._id || session?.appointment);
        if (reqAptId?.toString() === myAptId?.toString() && (user.role === 'specialist' || user.role === 'consultant')) {
          Alert.alert("Refused", "Patient refused to end the session.");
        }
      });

      socket.on("session-ended", (data) => {
        const myAptId = appointmentId || (session?.appointment?._id || session?.appointment);
        if (data.appointmentId?.toString() === myAptId?.toString()) {
          console.log("🔔 [Call] session-ended event received");
          leaveAgora();
          navigation.navigate('Records', { sessionId: session?._id });
        }
      });

      socket.on("call-ended", (data) => {
        const myAptId = appointmentId || (session?.appointment?._id || session?.appointment);
        if (data.appointmentId?.toString() === myAptId?.toString()) {
          console.log("📞 [Call] Call ended by other party");
          leaveAgora();
          navigation.navigate('Records', { sessionId: session?._id });
        }
      });
    }

    if (sessionId || appointmentId) {
      initializeSession();
    }

    return () => {
      stopDialingSound();
      if (socket) {
        socket.off("session-created");
        socket.off("call-rejected");
        socket.off("specialist-busy");
        socket.off("call-ended");
        socket.off("request-patient-end-session");
        socket.off("patient-rejected-end-session");
      }
    };
  }, [appointmentId, socket, waiting, session, user]);

  const playDialingSound = async () => {
    try {
      if (dialingSoundRef.current) return;
      const { sound } = await Audio.Sound.createAsync(
        { uri: '/assets/sounds/ringtone.mp3' },
        { shouldPlay: true, isLooping: true }
      );
      dialingSoundRef.current = sound;
    } catch (e) {
      console.log("🔈 Dialing sound blocked:", e.message);
    }
  };

  const stopDialingSound = async () => {
    if (dialingSoundRef.current) {
      try {
        await dialingSoundRef.current.stopAsync();
        await dialingSoundRef.current.unloadAsync();
      } catch (e) {}
      dialingSoundRef.current = null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let localClient = null;
    let localTracks = { video: null, audio: null };

    const startAgora = async () => {
      if (Platform.OS !== 'web' || !AgoraRTC) return;
      
      localClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClientRef.current = localClient;

      localClient.on("user-published", async (user, mediaType) => {
        await localClient.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteUserJoined(true);
          setTimeout(() => {
            user.videoTrack?.play("remote-video-container");
          }, 500);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      localClient.on("user-unpublished", (user) => {
        setRemoteUserJoined(false);
      });

      try {
        const channelName = appointmentId || (session?.appointment?._id || session?.appointment);
        if (!channelName) {
          console.error("❌ [Agora] No channel name found!");
          return;
        }

        console.log(`📡 [Agora] Joining channel: ${channelName} with UID: ${user._id}`);
        
        await localClient.join(AGORA_APP_ID, String(channelName), null, user._id);

        if (!isMounted) {
          await localClient.leave();
          return;
        }

        localTracks.audio = await AgoraRTC.createMicrophoneAudioTrack();
        localTracks.video = await AgoraRTC.createCameraVideoTrack();
        localTracksRef.current = localTracks;

        if (!isMounted) {
          localTracks.audio.close();
          localTracks.video.close();
          await localClient.leave();
          return;
        }

        await localClient.publish(Object.values(localTracks));
        setTimeout(() => {
          localTracks.video.play("local-video-container");
        }, 500);

        console.log("✅ Joined Agora Channel:", channelName);
      } catch (err) {
        console.error("Agora Init Error:", err);
      }
    };

    if (session && Platform.OS === 'web') {
      startAgora();
    }

    return () => {
      isMounted = false;
      if (localTracks.audio) {
        localTracks.audio.stop();
        localTracks.audio.close();
      }
      if (localTracks.video) {
        localTracks.video.stop();
        localTracks.video.close();
      }
      if (localClient) {
        localClient.leave();
      }
    };
  }, [session]);

  const leaveAgora = async () => {
    if (localTracksRef.current.audio) {
      localTracksRef.current.audio.stop();
      localTracksRef.current.audio.close();
    }
    if (localTracksRef.current.video) {
      localTracksRef.current.video.stop();
      localTracksRef.current.video.close();
    }
    if (agoraClientRef.current) {
      await agoraClientRef.current.leave();
    }
  };

  const toggleMute = () => {
    if (localTracksRef.current.audio) {
      const isMuted = !muted;
      localTracksRef.current.audio.setEnabled(!isMuted);
      setMuted(isMuted);
    }
  };

  const toggleVideo = () => {
    if (localTracksRef.current.video) {
      const isVideoOff = !videoOff;
      localTracksRef.current.video.setEnabled(!isVideoOff);
      setVideoOff(isVideoOff);
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    setUnreadCount(0);
  };

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    const msg = {
      id: Date.now(),
      sender: user.firstName,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const channelId = appointmentId || (session?.appointment?._id || session?.appointment);
    console.log('💬 [MOBILE] Sending chat message to room:', channelId, msg);
    socket.emit('chat-message', { roomId: channelId, message: msg });
    setMessages(prev => [...prev, msg]);
    setNewMessage("");
  };

  useEffect(() => {
    if (socket && session) {
      socket.on('chat-message', (msg) => {
        setMessages(prev => [...prev, msg]);
        if (!showChat) {
          setUnreadCount(prev => prev + 1);
          setChatNotification(msg.text);
          setTimeout(() => setChatNotification(null), 3000);
        }
      });
      return () => socket.off('chat-message');
    }
  }, [socket, session, showChat]);

  // Countdown Timer Logic
  useEffect(() => {
    if (session && timeLeft === null) {
      const duration = session.appointment?.duration || 15;
      setTimeLeft(duration * 60);
    }

    if (timeLeft !== null && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0) {
      Alert.alert("Time Up", "Your consultation time has ended.");
      performEndCall();
    }
  }, [session, timeLeft]);

  const formatTime = (seconds) => {
    if (seconds === null) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const msg = {
        id: Date.now(),
        sender: user.firstName,
        image: uri,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const channelId = appointmentId || (session?.appointment?._id || session?.appointment);
      socket.emit('chat-message', { roomId: channelId, message: msg });
      setMessages(prev => [...prev, msg]);
    }
  };

  const saveClinicalData = async () => {
    if (!session?._id) {
      Alert.alert("Error", "No active session ID found.");
      return;
    }
    setIsSavingClinical(true);
    try {
      const payload = {
        sessionNotes: clinicalData.notes,
        prescriptions: clinicalData.prescriptions.filter(p => p.medication && p.medication.trim()),
        labReferrals: clinicalData.labReferrals.filter(l => l.testName && l.testName.trim())
      };
      
      console.log("💾 [Call] Saving clinical documentation for session:", session._id, payload);
      const res = await apiPut(`medical-tourism/video-sessions/${session._id}`, payload);
      
      if (res.success && res.session) {
        setSession(res.session);
        Alert.alert("Success", "Clinical documentation saved successfully.");
        setShowClinicalWorkspace(false);
      } else {
        throw new Error(res.message || "Unknown error occurred");
      }
    } catch (err) {
      console.error("❌ [Call] Clinical save error:", err);
      Alert.alert("Error", "Failed to save clinical documentation: " + err.message);
    } finally {
      setIsSavingClinical(false);
    }
  };

  const addPrescription = () => {
    setClinicalData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { medication: "", dosage: "", frequency: "" }]
    }));
  };

  const updatePrescription = (index, field, value) => {
    const updated = [...clinicalData.prescriptions];
    updated[index][field] = value;
    setClinicalData(prev => ({ ...prev, prescriptions: updated }));
  };

  const removePrescription = (index) => {
    setClinicalData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const addLabReferral = () => {
    setClinicalData(prev => ({
      ...prev,
      labReferrals: [...prev.labReferrals, { testName: "", labName: "", note: "", status: "pending" }]
    }));
  };

  const updateLabReferral = (index, field, value) => {
    const updated = [...clinicalData.labReferrals];
    updated[index][field] = value;
    setClinicalData(prev => ({ ...prev, labReferrals: updated }));
  };

  const removeLabReferral = (index) => {
    setClinicalData(prev => ({
      ...prev,
      labReferrals: prev.labReferrals.filter((_, i) => i !== index)
    }));
  };

  const initializeSession = async () => {
    console.log('📡 [Call] Initializing session. sessionId:', sessionId, 'appointmentId:', appointmentId);
    try {
      let activeSession = null;

      if (sessionId) {
        console.log(`📡 [Call] Fetching session by ID: ${sessionId}`);
        const response = await apiGet(`medical-tourism/video-sessions/${sessionId}`);
        activeSession = response.session;
      } else if (appointmentId) {
        try {
          console.log(`📡 [Call] Fetching session by appointment: ${appointmentId}`);
          const response = await apiGet(`medical-tourism/video-sessions/by-appointment/${appointmentId}`);
          activeSession = response.session;
          setWaiting(false);
          stopDialingSound();
        } catch (err) {
          if (err.message.includes('404')) {
            console.log('⏳ [Call] Appointment found, waiting for session init...');
            return;
          }
          throw err;
        }
      }

      console.log('📡 [Call] Active session data:', activeSession ? 'Found' : 'Not Found');
      if (activeSession) {
        console.log("📝 [Call] Syncing clinical workspace and joining socket room");
        setSession(activeSession);
        
        // Ensure we are in the socket room for events
        const channelId = appointmentId || (activeSession?.appointment?._id || activeSession?.appointment);
        if (socket && channelId) {
          socket.emit('join-session', { roomId: channelId.toString(), userId: user._id });
        }

        setClinicalData({
          notes: activeSession.sessionNotes || "",
          prescriptions: activeSession.prescriptions || [],
          labReferrals: activeSession.labReferrals || []
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Session Init Error:', error);
      Alert.alert('Connection Error', 'Could not establish connection to the consultation server.');
      navigation.goBack();
    }
  };

  const handleEndCall = () => {
    const isSpecialist = user?.role === 'specialist' || user?.role === 'consultant';
    const channelId = appointmentId || (session?.appointment?._id || session?.appointment);
    console.log("🖱️ [Call] End Call button pressed. Role:", user?.role, "isSpecialist:", isSpecialist);
    
    if (Platform.OS === 'web') {
      // Use native browser confirm on web for maximum reliability
      const msg = isSpecialist 
        ? "Request patient to end session? (Cancel to end directly)" 
        : "Are you sure you want to end this consultation?";
      
      if (window.confirm(msg)) {
        if (isSpecialist) {
          console.log("📡 [Call] Sending end-session request to patient");
          socket.emit("request-patient-end-session", { appointmentId: channelId });
        } else {
          performEndCall();
        }
      } else if (isSpecialist) {
        // Specialist chose to end directly
        performEndCall();
      }
    } else {
      // Mobile native alerts
      if (isSpecialist) {
        socket.emit("request-patient-end-session", { appointmentId: channelId });
        Alert.alert(
          "Request Sent", 
          "Awaiting patient's confirmation to end the session...",
          [
            { text: "Wait", style: "cancel" },
            { text: "End Directly", style: "destructive", onPress: () => performEndCall() }
          ]
        );
      } else {
        setConfirmModalTitle("End Session?");
        setConfirmModalMessage("Are you sure you want to end this consultation session?");
        setShowConfirmEndModal(true);
      }
    }
  };

  const handleCancelEnd = () => {
    setShowConfirmEndModal(false);
    if (user.role === 'user') {
      const channelId = appointmentId || (session?.appointment?._id || session?.appointment);
      socket.emit("patient-rejected-end-session", { appointmentId: channelId });
    }
  };

  const performEndCall = async () => {
    try {
      console.log("🏁 [Call] performEndCall started");
      setIsEnding(true);
      const channelId = appointmentId || (session?.appointment?._id || session?.appointment);
      
      // 1. Notify via socket (if connected)
      if (socket && socket.connected) {
        console.log("📡 [Call] Emitting session-ended for:", channelId);
        socket.emit("session-ended", { specialist: user, appointmentId: channelId });
      }

      // 2. Local Cleanup (non-blocking errors)
      console.log("🧹 [Call] Cleaning up Agora and sounds...");
      try {
        await leaveAgora();
        await stopDialingSound();
      } catch (e) {
        console.log("⚠️ [Call] Cleanup warning:", e.message);
      }

      // 3. Update DB
      const endTime = new Date();
      const startTime = session?.startTime ? new Date(session.startTime) : new Date();
      const durationInMinutes = Math.round((endTime - startTime) / 60000);

      console.log("💾 [Call] Saving session end to DB...");
      try {
        if (session?._id) {
          await Promise.all([
            apiPut(`medical-tourism/video-sessions/${session._id}`, { 
              endTime: endTime.toISOString(), 
              durationInMinutes 
            }),
            apiPut(`medical-tourism/consultation-appointments/update/custom/${channelId}`, { 
              status: "completed" 
            })
          ]);
          console.log("✅ [Call] DB updated.");
        }
      } catch (dbErr) {
        console.error("❌ [Call] DB Update failed:", dbErr);
      }
      
      // 4. Force Navigation
      console.log("🚀 [Call] Navigating to Records");
      navigation.navigate('Records', { sessionId: session?._id });
      
    } catch (err) {
      console.error("❌ [Call] Critical error in performEndCall:", err);
      Alert.alert("Terminating Call", "Call ended. Returning to dashboard.");
      navigation.navigate('Main');
    } finally {
      setIsEnding(false);
      setShowConfirmEndModal(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loaderText}>
          {specialistName ? `Connecting to ${specialistName}...` : "Connecting to secure server..."}
        </Text>
      </View>
    );
  }

  if (waiting) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.waitingCard}>
          {specialist?.profileImage ? (
             <Ionicons name="person-circle" size={100} color="#3b82f6" />
          ) : (
            <Ionicons name="person-circle" size={100} color="#94a3b8" />
          )}
          
          <Text style={styles.waitingTitle}>
            {invitationRejected ? "Call Rejected" : busyMessage ? "Specialist Busy" : "Waiting for Doctor"}
          </Text>
          
          <Text style={styles.waitingDoctor}>
            {specialist ? `Dr. ${specialist.firstName} ${specialist.lastName}` : "Connecting..."}
          </Text>

          <Text style={styles.waitingText}>
            {invitationRejected 
              ? "The specialist is unavailable right now. Please try again later." 
              : busyMessage 
              ? busyMessage 
              : "We've notified the doctor of your arrival. Please stay on this screen."}
          </Text>

          {!invitationRejected && !busyMessage && (
            <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 30 }} />
          )}

          {(invitationRejected || busyMessage) && (
            <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {/* Main Video Area */}
        <View style={styles.remoteVideo}>
          <View id="remote-video-container" style={StyleSheet.absoluteFill} />
          
          {!remoteUserJoined && (
            <View style={styles.remotePlaceholder}>
              <Ionicons name="person" size={80} color="#475569" />
              <Text style={styles.remoteName}>
                {session?.specialist?.firstName ? `Dr. ${session.specialist.lastName}` : 'Waiting for doctor...'}
              </Text>
            </View>
          )}

          {/* Local Video (PIP) */}
          <View style={styles.localVideo}>
            <View id="local-video-container" style={StyleSheet.absoluteFill} />
            {videoOff && (
              <View style={[styles.localPlaceholder, { backgroundColor: '#334155' }]}>
                <Ionicons name="videocam-off" size={24} color="#fff" />
              </View>
            )}
          </View>
        </View>

        {/* Chat Overlay */}
        {showChat && (
          <View style={styles.chatOverlay}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Session Chat</Text>
              <TouchableOpacity onPress={() => setShowChat(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.messageList} contentContainerStyle={{ padding: 16 }}>
              {messages.map(msg => (
                <View key={msg.id} style={[styles.messageItem, msg.sender === user.firstName ? styles.myMessage : styles.theirMessage]}>
                  {msg.image ? (
                    <TouchableOpacity onPress={() => setFullScreenImage(msg.image)}>
                      <Image source={{ uri: msg.image }} style={styles.messageImage} resizeMode="cover" />
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.messageText}>{msg.text}</Text>
                  )}
                  <Text style={styles.messageTime}>{msg.time}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputArea}>
              <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                <Ionicons name="image" size={24} color="#94a3b8" />
              </TouchableOpacity>
              <TextInput 
                style={styles.chatInput} 
                placeholder="Type a message..." 
                placeholderTextColor="#94a3b8"
                value={newMessage}
                onChangeText={setNewMessage}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Full Screen Image Modal */}
        <Modal visible={!!fullScreenImage} transparent animationType="fade">
          <View style={styles.fullScreenModal}>
            <TouchableOpacity style={styles.closeFullBtn} onPress={() => setFullScreenImage(null)}>
              <Ionicons name="close-circle" size={40} color="#fff" />
            </TouchableOpacity>
            {fullScreenImage && (
              <Image source={{ uri: fullScreenImage }} style={styles.fullImage} resizeMode="contain" />
            )}
          </View>
        </Modal>

        {/* Clinical Workspace Modal (Specialist Only) */}
        <Modal visible={showClinicalWorkspace} animationType="slide">
          <SafeAreaView style={styles.clinicalContainer}>
            <View style={styles.clinicalHeader}>
              <Text style={styles.clinicalTitle}>Clinical Workspace</Text>
              <TouchableOpacity onPress={() => setShowClinicalWorkspace(false)}>
                <Ionicons name="close" size={28} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.clinicalContent}>
              <View style={styles.clinicalSection}>
                <Text style={styles.sectionTitle}>Session Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  placeholder="Document clinical findings..."
                  value={clinicalData.notes}
                  onChangeText={(text) => setClinicalData(prev => ({ ...prev, notes: text }))}
                />
              </View>

              <View style={styles.clinicalSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Prescriptions</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={addPrescription}>
                    <Ionicons name="add-circle" size={24} color="#3b82f6" />
                    <Text style={styles.addBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
                {clinicalData.prescriptions.map((p, i) => (
                  <View key={i} style={styles.prescriptionCard}>
                    <View style={styles.prescriptionHeader}>
                      <Ionicons name="medical-outline" size={18} color="#3b82f6" />
                      <TextInput
                        style={styles.medNameInput}
                        placeholder="Medication Name"
                        value={p.medication}
                        onChangeText={(val) => updatePrescription(i, 'medication', val)}
                      />
                      <TouchableOpacity onPress={() => removePrescription(i)}>
                        <Ionicons name="close-circle" size={22} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.prescriptionDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Dosage</Text>
                        <TextInput
                          style={styles.detailInput}
                          placeholder="e.g. 500mg"
                          value={p.dosage}
                          onChangeText={(val) => updatePrescription(i, 'dosage', val)}
                        />
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Frequency</Text>
                        <TextInput
                          style={styles.detailInput}
                          placeholder="e.g. Twice Daily"
                          value={p.frequency}
                          onChangeText={(val) => updatePrescription(i, 'frequency', val)}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.clinicalSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Lab Referrals</Text>
                  <TouchableOpacity style={styles.addBtn} onPress={addLabReferral}>
                    <Ionicons name="add-circle" size={24} color="#16a34a" />
                    <Text style={[styles.addBtnText, { color: '#16a34a' }]}>Add</Text>
                  </TouchableOpacity>
                </View>
                {clinicalData.labReferrals.map((l, i) => (
                  <View key={i} style={[styles.prescriptionCard, { borderLeftColor: '#16a34a' }]}>
                    <View style={styles.prescriptionHeader}>
                      <Ionicons name="flask-outline" size={18} color="#16a34a" />
                      <TextInput
                        style={styles.medNameInput}
                        placeholder="Test Name (e.g. Blood Test)"
                        value={l.testName}
                        onChangeText={(val) => updateLabReferral(i, 'testName', val)}
                      />
                      <TouchableOpacity onPress={() => removeLabReferral(i)}>
                        <Ionicons name="close-circle" size={22} color="#94a3b8" />
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={[styles.detailInput, { marginTop: 4 }]}
                      placeholder="Preferred Lab (Optional)"
                      value={l.labName}
                      onChangeText={(val) => updateLabReferral(i, 'labName', val)}
                    />
                    <TextInput
                      style={[styles.detailInput, { marginTop: 8, height: 60 }]}
                      placeholder="Special Instructions..."
                      multiline
                      value={l.note}
                      onChangeText={(val) => updateLabReferral(i, 'note', val)}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.clinicalFooter}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveClinicalData}>
                <Text style={styles.saveBtnText}>Save Documentation</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Chat Notification Pop-up */}
        {!showChat && chatNotification && (
          <TouchableOpacity style={styles.chatToast} onPress={toggleChat}>
            <View style={styles.toastIcon}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
            </View>
            <View style={styles.toastContent}>
              <Text style={styles.toastTitle}>New Message</Text>
              <Text style={styles.toastText} numberOfLines={1}>{chatNotification}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Controls Overlay */}
        <View style={styles.controls}>
          <View style={styles.infoBar}>
            <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
            <View style={styles.encryptedBadge}>
              <Ionicons name="lock-closed" size={12} color="#10b981" />
              <Text style={styles.encryptedText}>Encrypted</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, muted && styles.actionBtnActive]} 
              onPress={toggleMute}
            >
              <Ionicons name={muted ? 'mic-off' : 'mic'} size={24} color={muted ? '#fff' : '#1e293b'} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.endCallBtn]} 
              onPress={handleEndCall}
            >
              <Ionicons name="call" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, videoOff && styles.actionBtnActive]} 
              onPress={toggleVideo}
            >
              <Ionicons name={videoOff ? 'videocam-off' : 'videocam'} size={24} color={videoOff ? '#fff' : '#1e293b'} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, (showChat || unreadCount > 0) && styles.chatBtnActive]} 
              onPress={toggleChat}
            >
              <Ionicons name="chatbubble-ellipses" size={24} color={(showChat || unreadCount > 0) ? '#fff' : '#1e293b'} />
              {unreadCount > 0 && !showChat && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {(user.role === 'specialist' || user.role === 'consultant') && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]} onPress={() => setShowClinicalWorkspace(true)}>
                <Ionicons name="medical" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  loaderContainer: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#94a3b8', marginTop: 16, fontSize: 16 },
  remoteVideo: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  remotePlaceholder: { alignItems: 'center' },
  remoteName: { color: '#f8fafc', fontSize: 18, fontWeight: '600', marginTop: 16 },
  localVideo: { position: 'absolute', top: 60, right: 24, width: 100, height: 150, borderRadius: 16, backgroundColor: '#334155', borderWidth: 2, borderColor: '#475569', overflow: 'hidden' },
  localPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 12, paddingBottom: 30 },
  infoBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 20 },
  timer: { color: '#fff', fontSize: 18, fontWeight: '700', textShadow: '0 1px 3px rgba(0,0,0,0.5)' },
  encryptedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  encryptedText: { color: '#10b981', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%' },
  actionBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
  actionBtnActive: { backgroundColor: '#ef4444' },
  endCallBtn: { backgroundColor: '#ef4444', width: 58, height: 58, borderRadius: 29, transform: [{ rotate: '135deg' }] },
  footerActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 24 },
  footerBtn: { alignItems: 'center', gap: 8 },
  footerBtnText: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  waitingCard: { backgroundColor: '#1e293b', padding: 40, borderRadius: 32, alignItems: 'center', width: width * 0.85, ...Platform.select({ web: { boxShadow: '0px 10px 20px rgba(0,0,0,0.3)' }, default: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 } }) },
  chatOverlay: { position: 'absolute', top: 100, bottom: 200, left: 20, right: 20, backgroundColor: '#1e293b', borderRadius: 20, overflow: 'hidden', zIndex: 1000 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  chatTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  messageList: { flex: 1 },
  chatInputArea: { flexDirection: 'row', padding: 12, backgroundColor: '#334155', alignItems: 'center' },
  chatInput: { flex: 1, height: 40, color: '#fff', backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 16, marginRight: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  messageItem: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#3b82f6' },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: '#475569' },
  messageText: { color: '#fff', fontSize: 14 },
  messageTime: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  chatBtnActive: { backgroundColor: '#3b82f6' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  chatToast: { position: 'absolute', top: 120, left: 24, right: 24, backgroundColor: 'rgba(30, 41, 59, 0.95)', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 2000 },
  toastIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  toastContent: { flex: 1 },
  toastTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  toastText: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  waitingTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 20 },
  waitingDoctor: { color: '#3b82f6', fontSize: 18, fontWeight: '600', marginTop: 8 },
  waitingText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 16, lineHeight: 20 },
  retryButton: { marginTop: 30, backgroundColor: '#334155', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  retryButtonText: { color: '#fff', fontWeight: '700' },
  messageImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 4 },
  imageBtn: { padding: 8 },
  clinicalContainer: { flex: 1, backgroundColor: '#f8fafc' },
  clinicalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  clinicalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  clinicalContent: { flex: 1, padding: 20 },
  clinicalSection: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#475569', marginBottom: 12 },
  notesInput: { backgroundColor: '#fff', borderRadius: 16, padding: 16, height: 150, textAlignVertical: 'top', fontSize: 15, color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addBtnText: { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
  prescriptionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#3b82f6', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  prescriptionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  medNameInput: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1e293b', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 4 },
  prescriptionDetails: { flexDirection: 'row', gap: 15 },
  detailItem: { flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 },
  detailInput: { fontSize: 14, color: '#475569', backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  clinicalFooter: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  saveBtn: { backgroundColor: '#1e40af', borderRadius: 16, padding: 18, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  fullScreenModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  closeFullBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullImage: { width: width, height: height },
});
