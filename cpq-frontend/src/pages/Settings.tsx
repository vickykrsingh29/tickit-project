import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FaBell, FaEnvelope } from 'react-icons/fa';

interface SettingsState {
  notifications: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    productUpdates: boolean;
  };
  emails: {
    marketing: boolean;
    digest: boolean;
    security: boolean;
  };
}

const Settings: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      pushNotifications: true,
      emailNotifications: true,
      productUpdates: false,
    },
    emails: {
      marketing: false,
      digest: true,
      security: true,
    }
  });

  const handleNotificationChange = (key: keyof typeof settings.notifications) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      }
    }));
  };

  const handleEmailChange = (key: keyof typeof settings.emails) => {
    setSettings(prev => ({
      ...prev,
      emails: {
        ...prev.emails,
        [key]: !prev.emails[key],
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="h-4 w-4 bg-[#057dcd] rounded-full animate-bounce"></div>
          <div className="text-[#00060a] font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-[#00060a] bg-[#e8eef1] px-6 py-4 rounded-lg shadow-sm border border-[#057dcd]">
          Please log in to view settings
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
    

      {/* Main Content */}
      <div className="pl-8 pr-4 pt-8 w-full">
        <div className="w-full space-y-6">
          {/* Notifications */}
          <div className="bg-[#e8eef1] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FaBell className="text-[#057dcd] text-xl" />
              <h2 className="text-xl font-bold text-[#00060a]">Notifications</h2>
            </div>
            <div className="space-y-4">
              <ToggleItem
                label="Push Notifications"
                description="Receive push notifications for important updates"
                checked={settings.notifications.pushNotifications}
                onChange={() => handleNotificationChange('pushNotifications')}
              />
              <ToggleItem
                label="Email Notifications"
                description="Receive email notifications for important updates"
                checked={settings.notifications.emailNotifications}
                onChange={() => handleNotificationChange('emailNotifications')}
              />
              <ToggleItem
                label="Product Updates"
                description="Receive notifications about product updates"
                checked={settings.notifications.productUpdates}
                onChange={() => handleNotificationChange('productUpdates')}
              />
            </div>
          </div>

          {/* Email Preferences */}
          <div className="bg-[#e8eef1] rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FaEnvelope className="text-[#057dcd] text-xl" />
              <h2 className="text-xl font-bold text-[#00060a]">Email Preferences</h2>
            </div>
            <div className="space-y-4">
              <ToggleItem
                label="Marketing Emails"
                description="Receive marketing and promotional emails"
                checked={settings.emails.marketing}
                onChange={() => handleEmailChange('marketing')}
              />
              <ToggleItem
                label="Weekly Digest"
                description="Receive weekly summary of activities"
                checked={settings.emails.digest}
                onChange={() => handleEmailChange('digest')}
              />
              <ToggleItem
                label="Security Updates"
                description="Receive security-related notifications"
                checked={settings.emails.security}
                onChange={() => handleEmailChange('security')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string; 
  description: string; 
  checked: boolean; 
  onChange: () => void;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-base font-semibold text-[#00060a]">{label}</h3>
      <p className="text-sm text-[#00060a]/60">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors duration-200 
        ${checked ? 'bg-[#057dcd]' : 'bg-[#00060a]/20'} 
        relative`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 
        transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0.5'}`} 
      />
    </button>
  </div>
);

export default Settings;
