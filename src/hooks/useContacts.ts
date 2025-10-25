import { useState, useEffect } from 'react';
import { Contacts, ContactPayload } from '@capacitor-community/contacts';
import { Capacitor } from '@capacitor/core';
import toast from 'react-hot-toast';

export const useContacts = () => {
  const [contacts, setContacts] = useState<ContactPayload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState('prompt'); // 'granted', 'denied', 'prompt'
  const [permissionRequested, setPermissionRequested] = useState(false);

  // Upload statistics
  const [uploadStats, setUploadStats] = useState({
    totalContacts: 0,
    processedBatches: 0,
    totalBatches: 0,
    uploadedCount: 0,
    failedBatches: 0
  });

  // Check permission status
  const checkPermissionStatus = async (): Promise<string> => {
    try {
      if (!Capacitor.isNativePlatform()) {
        return 'web';
      }

      const permission = await Contacts.checkPermissions();
      const status = permission.contacts;
      setPermissionStatus(status);
      return status;
    } catch (error) {
      console.error('Permission check failed:', error);
      return 'error';
    }
  };

  // Request contacts permission
  const requestPermission = async (): Promise<boolean> => {
    try {
      if (!Capacitor.isNativePlatform()) {
        toast.error('Contacts API is only available on mobile devices');
        return false;
      }

      setPermissionRequested(true);
      const permission = await Contacts.requestPermissions();
      const granted = permission.contacts === 'granted';

      setPermissionStatus(permission.contacts);

      if (granted) {
        // REMOVE THIS LINE: toast.success('Contacts permission granted!');
      } else {
        toast.error('Contacts permission denied. Please enable it in app settings.');
      }

      return granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      toast.error('Failed to request contacts permission');
      return false;
    }
  };

  // Clean phone number function - removes all non-digits and formatting
  const cleanPhoneNumber = (phoneNumber: string | undefined): string => {
    if (!phoneNumber) return '';

    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Handle different country codes
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US format: remove leading 1
      cleaned = cleaned.substring(1);
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      // India format: remove leading 91
      cleaned = cleaned.substring(2);
    }

    // Only return numbers with 10 digits
    return cleaned.length === 10 ? cleaned : '';
  };

  // Extract contact data with name and phone numbers
  const extractContactData = (contact: ContactPayload): string[] => {
    if (!contact.phones || contact.phones.length === 0) return [];

    // Get contact name
    const contactName = contact.name?.display ||
      (contact.name?.given && contact.name?.family
        ? `${contact.name.given} ${contact.name.family}`
        : contact.name?.given || contact.name?.family || 'Unknown');

    // Get valid phone numbers
    const validPhoneNumbers = contact.phones
      .map(phone => cleanPhoneNumber(phone.number))
      .filter(number => number.length === 10);

    // Return contact data strings in format "Name:PhoneNumber"
    return validPhoneNumbers.map(phoneNumber => `${contactName}:${phoneNumber}`);
  };

  // Upload a single batch with retry logic
  const uploadBatchWithRetry = async (
    userId: string | number,
    batch: string[],
    batchNumber: number,
    totalBatches: number,
    maxRetries: number = 3
  ): Promise<{ success: boolean; imported?: number; batchNumber: number; totalBatches: number; error?: string }> => {
    const payload = {
      gofor: "insertcontact",
      user_id: userId.toString(),
      contact_list: batch
    };

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Uploading batch ${batchNumber}/${totalBatches} (${batch.length} contacts) - Attempt ${attempt}`);

        const response = await fetch('https://suggesto.xyz/App/api.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();

        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response from server');
        }

        let result: any;
        try {
          result = JSON.parse(responseText);
        } catch (jsonError) {
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
        }

        if (result.status === 'success') {
          const importedCount = result.message.match(/(\d+) contact\(s\) imported/);
          const actualImported = importedCount ? parseInt(importedCount[1]) : 0;

          console.log(`Batch ${batchNumber} completed: ${actualImported} contacts imported`);

          return {
            success: true,
            imported: actualImported,
            batchNumber,
            totalBatches
          };
        } else {
          throw new Error(result.message || 'API returned error status');
        }

      } catch (error) {
        console.error(`Batch ${batchNumber} attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          // Exponential backoff: wait 2s, 4s, 8s...
          const delay = 2000 * Math.pow(2, attempt - 1);
          console.log(`Retrying batch ${batchNumber} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          return {
            success: false,
            error: error.message,
            batchNumber,
            totalBatches
          };
        }
      }
    }
  };

  // Upload all contacts in optimized batches with concurrency control
  const uploadAllContacts = async (
    userId: string | number,
    contactDataList: string[]
  ): Promise<{ success: boolean; message: string; uploadedCount: number; totalContacts: number; failedBatches: number; successRate?: number }> => {
    const batchSize = 500; // Increased batch size as requested
    const maxConcurrentBatches = 3; // Process up to 3 batches simultaneously
    const totalBatches = Math.ceil(contactDataList.length / batchSize);
    let uploadedCount = 0;
    let failedBatches = 0;

    console.log(`Starting optimized upload: ${contactDataList.length} contacts in ${totalBatches} batches of ${batchSize}`);

    // Initialize upload stats
    setUploadStats({
      totalContacts: contactDataList.length,
      processedBatches: 0,
      totalBatches,
      uploadedCount: 0,
      failedBatches: 0
    });

    // Process batches in groups with controlled concurrency
    for (let i = 0; i < totalBatches; i += maxConcurrentBatches) {
      const batchPromises = [];

      // Create promises for concurrent batch uploads
      for (let j = 0; j < maxConcurrentBatches && (i + j) < totalBatches; j++) {
        const batchIndex = i + j;
        const startIndex = batchIndex * batchSize;
        const endIndex = Math.min(startIndex + batchSize, contactDataList.length);
        const batch = contactDataList.slice(startIndex, endIndex);

        batchPromises.push(
          uploadBatchWithRetry(userId, batch, batchIndex + 1, totalBatches)
        );
      }

      // Wait for all batches in this group to complete
      const results = await Promise.allSettled(batchPromises);

      // Process results and update counters
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const batchResult = result.value;
          if (batchResult.success) {
            uploadedCount += batchResult.imported || 0;
          } else {
            failedBatches++;
            console.error(`Batch ${batchResult.batchNumber} failed:`, batchResult.error);
          }
        } else {
          failedBatches++;
          console.error(`Batch promise rejected:`, result.reason);
        }
      });

      // Update progress and stats
      const processedBatches = Math.min(i + maxConcurrentBatches, totalBatches);
      const progress = Math.round((processedBatches / totalBatches) * 100);

      setUploadProgress(progress);
      setUploadStats(prev => ({
        ...prev,
        processedBatches,
        uploadedCount,
        failedBatches
      }));

      // Add delay between batch groups to avoid overwhelming the server
      if (i + maxConcurrentBatches < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Upload completed: ${uploadedCount} uploaded, ${failedBatches} failed batches`);

    // Return results without showing toast here
    return {
      success: uploadedCount > 0,
      message: uploadedCount > 0 ? `Uploaded ${uploadedCount} contacts` : 'Upload failed - no contacts were uploaded',
      uploadedCount,
      totalContacts: contactDataList.length,
      failedBatches,
      successRate: uploadedCount > 0 ? Math.round((uploadedCount / contactDataList.length) * 100) : 0
    };
  };

  // Upload contacts to API with improved flow
  const uploadContactsToAPI = async (
    userId: string | number,
    contactsList: ContactPayload[]
  ): Promise<{ success: boolean; message: string; uploadedCount?: number; totalContacts?: number; failedBatches?: number; successRate?: number }> => {
    if (!userId || !contactsList || contactsList.length === 0) {
      console.log('No contacts to upload or missing user ID');
      return { success: false, message: 'No contacts to upload' };
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Extract all contact data (name:phone format)
      const allContactData: string[] = [];

      contactsList.forEach(contact => {
        const contactDataList = extractContactData(contact);
        allContactData.push(...contactDataList);
      });

      // Remove duplicates based on the full string (name:phone)
      const uniqueContactData = [...new Set(allContactData)];

      console.log(`Total unique contacts: ${uniqueContactData.length}`);
      console.log('Sample contact data:', uniqueContactData.slice(0, 5));

      if (uniqueContactData.length === 0) {
        toast.error('No valid contacts found');
        return { success: false, message: 'No valid contacts found' };
      }

      // Remove the initial toast here - don't show "Starting upload" toast
      // toast.success(`Starting upload of ${uniqueContactData.length} contacts...`);

      return await uploadAllContacts(userId, uniqueContactData);

    } catch (error) {
      console.error('Error uploading contacts:', error);
      toast.error(`Failed to upload contacts: ${error.message}`);
      return { success: false, message: error.message };
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStats({
          totalContacts: 0,
          processedBatches: 0,
          totalBatches: 0,
          uploadedCount: 0,
          failedBatches: 0
        });
      }, 3000);
    }
  };

  // Get all contacts and optionally upload them
  const getContacts = async (
    userId: string | number | null = null,
    uploadToAPI: boolean = false
  ): Promise<{ contacts: ContactPayload[]; uploadResult?: any; error?: string }> => {
    setLoading(true);

    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Contacts API is only available on mobile devices');
      }

      // Check permission first
      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Permission denied to access contacts');
        }
      }

      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true,
          emails: true,
          image: true,
          organization: true,
        }
      });

      const contactsList = result.contacts || [];
      setContacts(contactsList);

      // Upload to API if requested
      if (uploadToAPI && userId) {
        console.log('Starting optimized contacts upload to API...');
        const uploadResult = await uploadContactsToAPI(userId, contactsList);
        return { contacts: contactsList, uploadResult };
      }

      return { contacts: contactsList };
    } catch (error) {
      console.error('Error fetching contacts:', error);
      const errorMessage = (error instanceof Error && error.message) ? error.message : 'Failed to fetch contacts';
      toast.error(errorMessage);
      return { contacts: [], error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Search contacts
  const searchContacts = async (searchTerm: string): Promise<ContactPayload[]> => {
    if (!searchTerm.trim()) {
      return getContacts();
    }

    setLoading(true);

    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Contacts API is only available on mobile devices');
      }

      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Permission denied to access contacts');
        }
      }

      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true,
          emails: true,
        }
      });

      // Filter contacts by search term
      const filteredContacts = (result.contacts || []).filter(contact =>
        contact.name?.display?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phones?.some(phone => phone.number?.includes(searchTerm)) ||
        contact.emails?.some(email => email.address?.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      setContacts(filteredContacts);
      return filteredContacts;
    } catch (error) {
      console.error('Error searching contacts:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to search contacts');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create contact
  const createContact = async (contactData: {
    firstName: string;
    lastName: string;
    phone?: string;
    email?: string;
  }): Promise<any> => {
    try {
      if (!Capacitor.isNativePlatform()) {
        throw new Error('Contacts API is only available on mobile devices');
      }

      if (permissionStatus !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Permission denied to access contacts');
        }
      }

      const result = await Contacts.createContact({
        contact: {
          name: {
            given: contactData.firstName,
            family: contactData.lastName,
            display: `${contactData.firstName} ${contactData.lastName}`
          },
          phones: contactData.phone ? [{
            type: 'mobile',
            number: contactData.phone
          }] : [],
          emails: contactData.email ? [{
            type: 'work',
            address: contactData.email
          }] : []
        }
      });

      toast.success('Contact created successfully!');

      // Refresh contacts list
      await getContacts();

      return result;
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create contact');
      return null;
    }
  };

  // Initialize permission check
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  return {
    contacts,
    loading,
    uploading,
    uploadProgress,
    uploadStats,
    permissionStatus,
    permissionRequested,
    requestPermission,
    getContacts,
    searchContacts,
    createContact,
    checkPermissionStatus,
    uploadContactsToAPI
  };
};