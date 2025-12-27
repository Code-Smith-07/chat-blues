import React, { useState, useRef, useEffect } from 'react';

const VideoCall = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      setIsConnected(true);
    } catch (error) {
      console.error('Error starting video call:', error);
      alert('Error accessing camera/microphone. Please check permissions.');
    }
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      setIsJoining(true);
      // Here you would implement room joining logic
      // For now, just start the video call
      startVideoCall();
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
    setIsJoining(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Video Call
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Connect with others through video calls
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <div className="space-y-6">
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room ID
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID to join"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={joinRoom}
                  disabled={!roomId.trim() || isJoining}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isJoining ? 'Joining...' : 'Join Room'}
                </button>

                <button
                  onClick={startVideoCall}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Start Call
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Local Video */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                You
              </h3>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg object-cover"
              />
            </div>

            {/* Remote Video */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Remote Participant
              </h3>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg object-cover"
              />
            </div>
          </div>
        )}

        {isConnected && (
          <div className="text-center mt-8">
            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              End Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;