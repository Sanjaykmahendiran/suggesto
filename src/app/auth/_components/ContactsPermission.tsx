"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useContacts } from '@/hooks/useContacts';
import { Capacitor } from '@capacitor/core';
import { Users, Shield, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactsPermissionProps {
  onPermissionGranted?: () => void;
  onSkip?: () => void;
  userRegisterLevel?: number;
}

const ContactsPermission = ({ onPermissionGranted, onSkip, userRegisterLevel }: ContactsPermissionProps) => {
  const {
    permissionStatus,
    requestPermission,
    loading,
    uploading,
    uploadProgress,
    getContacts
  } = useContacts();

  const [isVisible, setIsVisible] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log('ContactsPermission mounted');
    console.log('Platform:', Capacitor.isNativePlatform());
    console.log('Permission status:', permissionStatus);
    console.log('Platform info:', Capacitor.getPlatform());
    console.log('User register level:', userRegisterLevel);
  }, []);

  // Only show if register_level_status is 1
  if (userRegisterLevel !== 1) {
    console.log('Not showing contacts permission - register level is not 1');
    return null;
  }

  useEffect(() => {
    console.log('Permission status changed:', permissionStatus);
  }, [permissionStatus]);

  useEffect(() => {
    // Show permission request after a short delay for better UX
    const timer = setTimeout(() => {
      console.log('Permission request UI shown');
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestPermission = async () => {
    console.log('Requesting permission...');
    const granted = await requestPermission();
    console.log('Permission granted:', granted);

    if (granted) {
      onPermissionGranted;
      // Start background upload without showing progress
      handleUploadContacts();
      // Immediately proceed to next step
      handleComplete();
    }
  };

  const handleUploadContacts = async () => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userID') : null;

    if (!userId) {
      console.error('User ID not found for contacts upload');
      return;
    }

    try {
      console.log('Starting background contacts upload...');

      // Upload contacts in background without blocking UI
      getContacts(userId, true).then(result => {
        if (result.uploadResult && result.uploadResult.success) {
          console.log(`Successfully uploaded ${result.uploadResult.uploadedCount} contacts in background`);
          toast.success('Contacts uploaded successfully!');
        } else {
          console.log('Background contacts upload failed');
        }
      }).catch(error => {
        console.error('Background contacts upload error:', error);
      });

    } catch (error) {
      console.error('Error starting background contacts upload:', error);
    }
  };

  const handleComplete = () => {
    console.log('Contacts flow completed');
    setIsVisible(false);
    onPermissionGranted?.();
  };

  const handleSkip = () => {
    console.log('Skipping permission request');
    setIsVisible(false);
    onSkip?.();
  };

  const handleSkipUpload = () => {
    console.log('Skipping contacts upload');
    setIsVisible(false);
    onPermissionGranted?.();
  };

  if (!isVisible) {
    return null;
  }

  // Show permission request UI
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] rounded-2xl p-6 max-w-sm w-full mx-4 border border-gray-800">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#2b2b2b] rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-[#b56bbc]" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white text-center mb-2">
          Access Your Contacts
        </h3>

        {/* Description */}
        <p className="text-gray-400 text-center text-sm mb-6">
          To provide you with the best experience, we need access to your contacts.
          This helps us connect you with your friends and family.
        </p>

        {/* Permission Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-3 bg-[#2b2b2b] rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="text-white text-sm">Contacts Permission</span>
            </div>
            <div className="flex items-center space-x-2">
              {permissionStatus === 'granted' ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : permissionStatus === 'denied' ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-500 rounded-full" />
              )}
              <span className="text-xs text-gray-400 capitalize">
                {permissionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          {permissionStatus === 'denied' ? (
            <>
              <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-3 mb-3">
                <p className="text-red-400 text-xs text-center">
                  Permission was denied. Please enable contacts permission in your device settings.
                </p>
              </div>
              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full bg-transparent border-gray-600 text-white hover:bg-gray-800"
              >
                Continue Without Contacts
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleRequestPermission}
                disabled={loading}
                className="w-full bg-[#b56bbc] hover:bg-[#a055a3] text-white"
              >
                {loading ? "Requesting..." : "Allow Access"}
              </Button>

              <Button
                onClick={handleSkip}
                variant="outline"
                className="w-full bg-transparent border-gray-600 text-white hover:bg-gray-800"
              >
                Skip for Now
              </Button>
            </>
          )}
        </div>

        {/* Privacy note */}
        <p className="text-gray-500 text-xs text-center mt-4">
          Your privacy is important to us. We only access contacts when needed and never share your data.
        </p>
      </div>
    </div>
  );
};

export default ContactsPermission;