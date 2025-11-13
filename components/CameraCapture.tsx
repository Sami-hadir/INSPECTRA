
import React, { useRef, useEffect, useCallback } from 'react';
import { CameraIcon } from './icons';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      alert("שגיאה בגישה למצלמה. אנא ודא שהענקת הרשאות.");
      onClose();
    }
  }, [onClose]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);
  
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
      stopCamera();
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex justify-center items-center gap-8">
        <button
          onClick={handleCapture}
          className="p-4 bg-white rounded-full text-gray-900 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white"
          aria-label="צלם תמונה"
        >
          <CameraIcon className="h-8 w-8" />
        </button>
        <button
          onClick={onClose}
          className="absolute right-4 text-white text-lg bg-gray-800 bg-opacity-70 px-4 py-2 rounded-lg"
        >
          סגור
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
