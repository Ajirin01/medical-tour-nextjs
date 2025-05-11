import React, { useEffect, useState, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const AgoraVideoChat = ({ agoraAppId, agoraToken, agoraChannelName }) => {
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [users, setUsers] = useState([]);
  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  const cleanupRef = useRef(false); // Prevent async cleanup race


  const initializeAgoraCall = async () => {
    console.log("🎥 Initializing Agora Call with:", { agoraAppId, agoraToken, agoraChannelName });

    if (!agoraAppId || !agoraToken || !agoraChannelName) {
      console.warn("⚠️ Agora: Missing required params");
      return;
    }

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    client.on('user-published', async (user, mediaType) => {
        try {
          await client.subscribe(user, mediaType); // use 'client' directly
          if (mediaType === 'video') {
            setUsers((prevUsers) => {
              if (prevUsers.some((u) => u.uid === user.uid)) return prevUsers;
              return [...prevUsers, user];
            });
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        } catch (err) {
          console.error("Failed to subscribe to user:", err);
        }
      });
      
      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        }
        if (mediaType === 'audio') {
          user.audioTrack?.stop();
        }
      });
      

    // client.on('user-unpublished', (user, mediaType) => {
    //   if (mediaType === 'video') {
    //     setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    //   }
    //   if (mediaType === 'audio') {
    //     user.audioTrack?.stop();
    //   }
    // });

    try {
      await client.join(agoraAppId, agoraChannelName, agoraToken, 0);

      if (cleanupRef.current) return;

      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

      setLocalVideoTrack(videoTrack);
      videoTrack.play(localVideoRef.current);

      await client.publish([videoTrack, audioTrack]);

      console.log("✅ Agora call initialized");
    } catch (error) {
      console.error("❌ Error initializing Agora call:", error);
    }
  };

  useEffect(() => {
    cleanupRef.current = false;

    // Only init if all required props are ready
    if (agoraAppId && agoraToken && agoraChannelName) {
      initializeAgoraCall();
    } else {
      console.warn("⛔️ Agora params not ready - skipping init");
    }

    return () => {
      cleanupRef.current = true;
      if (clientRef.current) {
        clientRef.current.leave().then(() => {
          console.log("👋 Left Agora channel");
        });
        clientRef.current.removeAllListeners();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      setUsers([]);
    };
  }, [agoraAppId, agoraToken, agoraChannelName]);

  useEffect(() => {
    users.forEach((user) => {
      const container = document.getElementById(`remote-video-${user.uid}`);
      if (user.videoTrack && container) {
        user.videoTrack.play(container);
      }
    });
  }, [users]);

  return (
    <div className="relative w-full h-[80vh] rounded-xl overflow-hidden shadow-lg border border-gray-300">
      <div ref={localVideoRef} className="w-full h-full" />

      {users.map((user) => (
        <div
          key={user.uid}
          className="absolute top-4 left-4 w-1/4 h-1/4 bg-gray-800 p-2 rounded-xl"
        >
          <div id={`remote-video-${user.uid}`} className="w-full h-full rounded-md overflow-hidden" />
          <p className="text-white text-sm mt-1">{user.name || 'Remote User'}</p>
        </div>
      ))}
    </div>
  );
};

export default AgoraVideoChat;
