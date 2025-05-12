import React, {
    useEffect,
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
  } from 'react';
  import AgoraRTC from 'agora-rtc-sdk-ng';
  import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
  import { Rnd } from 'react-rnd';
  
  const AgoraVideoChat = forwardRef(
    ({ agoraAppId, agoraToken, agoraChannelName }, ref) => {
      const [localVideoTrack, setLocalVideoTrack] = useState(null);
      const [users, setUsers] = useState([]);  // Track remote users
      const [mainUser, setMainUser] = useState(null); // Track the selected remote user
      const [isCameraOn, setIsCameraOn] = useState(true);
      const [isMicOn, setIsMicOn] = useState(true);
  
      const clientRef = useRef(null);
      const localVideoRef = useRef(null);  // Local video reference
      const audioTrackRef = useRef(null);
      const cleanupRef = useRef(false);
      const mainVideoRef = useRef(null);  // Main video (remote user) reference
  
      // Ensure this is always called
      useImperativeHandle(ref, () => ({
        endCall: async () => {
          cleanupRef.current = true;
          if (clientRef.current) {
            await clientRef.current.leave();
            clientRef.current.removeAllListeners();
            clientRef.current = null;
          }
          if (localVideoTrack) {
            localVideoTrack.stop();
            localVideoTrack.close();
            setLocalVideoTrack(null);
          }
          if (audioTrackRef.current) {
            audioTrackRef.current.stop();
            audioTrackRef.current.close();
          }
          setUsers([]);
          setMainUser(null);
        },
      }), [localVideoTrack]);
  
      const initializeAgoraCall = async () => {
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;
  
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video') {
            setUsers((prev) => {
              if (prev.find((u) => u.uid === user.uid)) return prev;
              return [...prev, user];
            });
          }
          if (mediaType === 'audio') user.audioTrack?.play();
        });
  
        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') {
            setUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          }
          if (mediaType === 'audio') user.audioTrack?.stop();
        });
  
        try {
          await client.join(agoraAppId, agoraChannelName, agoraToken, 0);
          if (cleanupRef.current) return;
  
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  
          setLocalVideoTrack(videoTrack);
          audioTrackRef.current = audioTrack;
  
          videoTrack.play(localVideoRef.current);
          await client.publish([videoTrack, audioTrack]);
        } catch (err) {
          console.error('Agora init error:', err);
        }
      };
  
      useEffect(() => {
        cleanupRef.current = false;
        if (agoraAppId && agoraToken && agoraChannelName) initializeAgoraCall();
        return () => {
          cleanupRef.current = true;
          if (clientRef.current) {
            clientRef.current.leave();
            clientRef.current.removeAllListeners();
          }
          if (localVideoTrack) {
            localVideoTrack.stop();
            localVideoTrack.close();
          }
          if (audioTrackRef.current) {
            audioTrackRef.current.stop();
            audioTrackRef.current.close();
          }
          setUsers([]);
        };
      }, [agoraAppId, agoraToken, agoraChannelName]);
  
      useEffect(() => {
        if (mainUser && mainUser.videoTrack && mainVideoRef.current) {
          mainUser.videoTrack.play(mainVideoRef.current);
        } else if (localVideoTrack && mainVideoRef.current) {
          localVideoTrack.play(mainVideoRef.current);  // Show local video if no main user
        }
      }, [mainUser, localVideoTrack]);
  
      const handleToggleCamera = () => {
        if (localVideoTrack) {
          localVideoTrack.setEnabled(!isCameraOn);
          setIsCameraOn((prev) => !prev);
        }
      };
  
      const handleToggleMic = () => {
        if (audioTrackRef.current) {
          audioTrackRef.current.setEnabled(!isMicOn);
          setIsMicOn((prev) => !prev);
        }
      };
  
      return (
        <div className="relative w-full h-[80vh] bg-black rounded-xl overflow-hidden border shadow-lg">
          {/* Main video */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div ref={mainVideoRef} className="w-full h-full" />
          </div>
  
          {/* Draggable local video thumbnail */}
          <Rnd
            default={{
              x: 16,
              y: 16,
              width: 160,
              height: 120,
            }}
            bounds="parent"
            minWidth={120}
            minHeight={90}
            className="z-10 border-2 border-white rounded-md overflow-hidden bg-black"
          >
            <div
              ref={localVideoRef}
              className="w-full h-full cursor-pointer"
              onClick={() => {
                // Toggle between local and remote video
                if (!mainUser) {
                  // Set main user to the first remote user (for now)
                  setMainUser(users[0] || null);
                } else {
                  // Reset to showing local video
                  setMainUser(null);
                }
              }}
            />
          </Rnd>
  
          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/60 px-4 py-2 rounded-full z-20">
            <button onClick={handleToggleMic} className="text-white hover:text-red-500">
              {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            <button onClick={handleToggleCamera} className="text-white hover:text-red-500">
              {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
            <button onClick={() => ref?.current?.endCall()} className="text-white hover:text-red-500">
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      );
    }
  );
  
  export default AgoraVideoChat;
  