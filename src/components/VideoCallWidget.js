import { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import { createWebRTCWidget } from '@/lib/webrtcWidget';
import { useSession } from "next-auth/react";
import IssueCertificateModal from "./gabriel/doctor/IssueCertificateModal";

const VideoCallWidget = ({ roomId }) => {
    const { data: session } = useSession();
    const [isCallIncoming, setIsCallIncoming] = useState(false);
    const [isInCall, setIsInCall] = useState(false);
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const [showCertModal, setShowCertModal] = useState(false);
    
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const webrtcInstance = useRef(null);
    const socket = useRef(null);

    const isDoctor = session?.user?.role === "specialist" || session?.user?.role === "doctor";

    useEffect(() => {
        if (!roomId || webrtcInstance.current) return;
    
        socket.current = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    
        webrtcInstance.current = createWebRTCWidget({
            videoSize: 500,
            backgroundColor: '#f8f9fa',
            localVideoElement: localVideoRef.current,
            remoteVideoElement: remoteVideoRef.current,
            onCallAccepted: () => {
                setIsCallIncoming(false);
                setIsInCall(true);
            },
            onIncomingCall: () => {
                setIsCallIncoming(true);
            },
            onCallEnded: () => {
                setIsInCall(false);
                setIsCallIncoming(false);
            }
        });
    
        webrtcInstance.current.joinRoom(roomId);
    
        return () => {
            if (webrtcInstance.current) {
                webrtcInstance.current.endCall();
                webrtcInstance.current = null;
            }
        };
    }, [roomId]);
    

    const sendCallRequest = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.sendCallRequest();
        }
    };

    const endCall = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.endCall();
        }
        setIsInCall(false);
    };

    const toggleMuteAudio = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.toggleMuteAudio();
            setAudioMuted(!audioMuted);
        }
    };

    const toggleMuteVideo = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.toggleMuteVideo();
            setVideoMuted(!videoMuted);
        }
    };

    const acceptCall = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.acceptCall();
            setIsCallIncoming(false);
        }
    };

    const rejectCall = () => {
        if (webrtcInstance.current) {
            webrtcInstance.current.rejectCall();
            setIsCallIncoming(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="flex gap-4">
                <div className="resizable border-blue-500 overflow-hidden rounded-2xl shadow-lg bg-black">
                    <video ref={localVideoRef} autoPlay muted playsInline className="video-element w-full h-full object-cover" />
                </div>
                <div className="resizable border-green-500 overflow-hidden rounded-2xl shadow-lg bg-black">
                    <video ref={remoteVideoRef} autoPlay playsInline className="video-element w-full h-full object-cover" />
                </div>
            </div>

            {/* Incoming call notification */}
            {isCallIncoming && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-white">
                    <div className="bg-gray-900/80 p-10 rounded-3xl border border-white/20 text-center shadow-2xl scale-110">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-green-500/20 blur-2xl animate-pulse"></div>
                            <span className="text-6xl animate-bounce inline-block">📞</span>
                        </div>
                        <p className="text-2xl font-bold mb-8">Incoming Consultation...</p>
                        <div className="flex gap-6">
                            <button onClick={acceptCall} className="bg-green-600 px-8 py-3 rounded-xl hover:bg-green-500 transition-all font-bold shadow-lg shadow-green-900/20 active:scale-95">
                                Accept Call
                            </button>
                            <button onClick={rejectCall} className="bg-red-600 px-8 py-3 rounded-xl hover:bg-red-500 transition-all font-bold shadow-lg shadow-red-900/20 active:scale-95">
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap gap-4 mt-8 justify-center">
                {!isInCall && (
                    <button onClick={sendCallRequest} className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-3 rounded-full text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95">
                        Start Video Consultation
                    </button>
                )}
                {isInCall && (
                    <>
                        <button onClick={endCall} className="bg-red-600 px-6 py-3 rounded-full text-white font-bold hover:bg-red-500 transition-all shadow-lg active:scale-95">
                            End Call
                        </button>
                        <button onClick={toggleMuteAudio} className="bg-gray-800/80 px-6 py-3 rounded-full text-white font-bold backdrop-blur-md border border-white/10 hover:bg-gray-700 transition-all active:scale-95">
                            {audioMuted ? '🔇 Unmute' : '🎤 Mute'}
                        </button>
                        <button onClick={toggleMuteVideo} className="bg-gray-800/80 px-6 py-3 rounded-full text-white font-bold backdrop-blur-md border border-white/10 hover:bg-gray-700 transition-all active:scale-95">
                            {videoMuted ? '📷 Start Video' : '📹 Stop Video'}
                        </button>

                        {isDoctor && (
                            <button 
                                onClick={() => setShowCertModal(true)}
                                className="bg-indigo-600 px-6 py-3 rounded-full text-white font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center gap-2"
                            >
                                📜 Issue Certificate
                            </button>
                        )}
                    </>
                )}
            </div>

            {showCertModal && (
                <IssueCertificateModal 
                    sessionId={roomId} 
                    onClose={() => setShowCertModal(false)} 
                />
            )}
        </div>
    );
};

export default VideoCallWidget;
