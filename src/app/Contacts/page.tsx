"use client"

import { useState, useEffect } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Phone, Mail, User, Plus, RefreshCw } from 'lucide-react';

const ContactsPage = () => {
  const { 
    contacts, 
    loading, 
    permissionStatus, 
    getContacts, 
    searchContacts,
    requestPermission 
  } = useContacts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Auto-load contacts when permission is granted
  useEffect(() => {
    if (permissionStatus === 'granted') {
      getContacts();
    }
  }, [permissionStatus]);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (searchTerm.trim()) {
        searchContacts(searchTerm);
      } else {
        getContacts();
      }
    }, 300);

    setSearchTimeout(timeout);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleRefresh = () => {
    getContacts();
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX if 10 digits
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  if (permissionStatus === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121214] p-6">
        <div className="bg-[#2b2b2b] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-900 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Contacts Permission Required
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            To access your contacts, please enable contacts permission in your device settings.
          </p>
          <Button
            onClick={requestPermission}
            className="w-full bg-[#b56bbc] hover:bg-[#a055a3] text-white"
          >
            Request Permission
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#121214] min-h-screen">
      {/* Header */}
      <div className="bg-[#2b2b2b] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white">Contacts</h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              size="sm"
              variant="outline"
              className="bg-transparent border-gray-600 text-white hover:bg-gray-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#121214] border-gray-700 border h-10 rounded-xl w-full pl-10 pr-4 text-white placeholder-gray-400"
          />
        </div>

        {/* Stats */}
        <div className="mt-3 text-sm text-gray-400">
          {loading ? 'Loading...' : `${contacts.length} contacts found`}
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {loading && contacts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b56bbc]"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <User className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-center">
              {searchTerm ? 'No contacts found matching your search' : 'No contacts available'}
            </p>
            {!searchTerm && (
              <Button
                onClick={getContacts}
                className="mt-4 bg-[#b56bbc] hover:bg-[#a055a3] text-white"
              >
                Load Contacts
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {contacts.map((contact, index) => (
              <div
                key={contact.contactId || index}
                className="bg-[#2b2b2b] rounded-xl p-4 hover:bg-[#3b3b3b] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[#b56bbc] rounded-full flex items-center justify-center flex-shrink-0">
                    {contact.image ? (
                      <img
                        src={contact.image}
                        alt={contact.name?.display}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium text-lg">
                        {contact.name?.display?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {contact.name?.display || 'Unknown Contact'}
                    </h3>
                    
                    {/* Phone Numbers */}
                    {contact.phones && contact.phones.length > 0 && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-400 truncate">
                          {formatPhoneNumber(contact.phones[0].number)}
                        </span>
                      </div>
                    )}

                    {/* Email */}
                    {contact.emails && contact.emails.length > 0 && (
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-400 truncate">
                          {contact.emails[0].address}
                        </span>
                      </div>
                    )}

                    {/* Organization */}
                    {contact.organizations && contact.organizations.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {contact.organizations[0].name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;