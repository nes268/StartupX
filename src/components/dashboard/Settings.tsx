import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Settings as SettingsIcon, Save, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { profileApi } from '../../services/profileApi';
import { useStartups } from '../../hooks/useStartups';
import { startupsApi } from '../../services/startupsApi';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { updateStartupPhase, updateStartup } = useStartups();
  const [isSaving, setIsSaving] = useState(false);
  const [savingPhase, setSavingPhase] = useState(false);
  const [phaseSaved, setPhaseSaved] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'active' | 'dropout'>('active');
  const [startupId, setStartupId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    autoApproveApplications: false,
    allowUserRegistration: true,
  });
  const [personalDetails, setPersonalDetails] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
  });
  const [startupPhase, setStartupPhase] = useState<'idea' | 'mvp' | 'seed' | 'series-a' | 'growth' | 'scale'>('idea');
  const [loading, setLoading] = useState(true);

  const phaseOptions = [
    { value: 'idea', label: 'Idea' },
    { value: 'mvp', label: 'MVP' },
    { value: 'seed', label: 'Seed' },
    { value: 'series-a', label: 'Series A' },
    { value: 'growth', label: 'Growth' },
    { value: 'scale', label: 'Scale' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id && user?.role === 'user') {
        try {
          setLoading(true);
          // Fetch profile
          try {
            const profile = await profileApi.getProfileByUserId(user.id);
            setPersonalDetails({
              fullName: profile.fullName || '',
              email: profile.email || '',
              phoneNumber: profile.phoneNumber || '',
              location: profile.location || '',
            });
          } catch (error) {
            console.error('Error fetching profile:', error);
            // Set defaults from user object
            setPersonalDetails({
              fullName: user.fullName || '',
              email: user.email || '',
              phoneNumber: '',
              location: '',
            });
          }

          // Fetch startup phase and status
          try {
            const startups = await startupsApi.getStartups(user.id);
            if (startups.length > 0) {
              const startup = startups[0];
              if (startup.startupPhase) {
                setStartupPhase(startup.startupPhase);
              }
              if (startup.id) {
                setStartupId(startup.id);
              }
              // Set current status - normalize to 'active' or 'dropout'
              const status = startup.status === 'dropout' ? 'dropout' : 'active';
              setCurrentStatus(status);
            }
          } catch (error) {
            console.error('Error fetching startup phase:', error);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id, user?.role]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      // Save to backend here
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonalDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePersonalDetails = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      // Try to update existing profile or create new one
      try {
        const profile = await profileApi.getProfileByUserId(user.id);
        await profileApi.updateProfile(profile.id, personalDetails);
      } catch (error) {
        // Profile doesn't exist, create new one
        await profileApi.saveProfile({
          ...personalDetails,
          userId: user.id,
          startupName: '',
          entityType: '',
          applicationType: 'innovation',
          founderName: '',
          coFounderNames: [],
          sector: '',
          linkedinProfile: '',
          previouslyIncubated: false,
          aadhaarDoc: '',
          fundingStage: '',
          alreadyFunded: false,
        });
      }
    } catch (error) {
      console.error('Error saving personal details:', error);
      alert('Failed to save personal details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhaseChange = async () => {
    if (!user?.id) {
      alert('Please log in to update your startup phase');
      return;
    }

    setSavingPhase(true);
    setPhaseSaved(false);
    try {
      await updateStartupPhase(user.id, startupPhase);
      setPhaseSaved(true);
      setTimeout(() => setPhaseSaved(false), 3000);
    } catch (error) {
      console.error('Error updating startup phase:', error);
      alert('Failed to update startup phase. Please try again.');
    } finally {
      setSavingPhase(false);
    }
  };

  const handleDropout = async () => {
    if (!startupId) {
      alert('Startup information not found. Please refresh the page.');
      return;
    }

    const confirmMessage = currentStatus === 'dropout' 
      ? 'Are you sure you want to reactivate your startup? This will change your status back to active.'
      : 'Are you sure you want to mark your startup as dropout? This action will change your status to dropout.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const newStatus = currentStatus === 'dropout' ? 'active' : 'dropout';
      await updateStartup(startupId, { status: newStatus });
      setCurrentStatus(newStatus);
      alert(`Your startup status has been updated to ${newStatus}.`);
    } catch (error) {
      console.error('Error updating startup status:', error);
      alert('Failed to update startup status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Admin Settings Page
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)] flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-[var(--accent)]" />
            Admin Settings
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Manage platform settings</p>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-[var(--text)] font-medium">Maintenance Mode</h3>
                <p className="text-sm text-[var(--text-muted)]">Disable access for all users except admins</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={() => toggleSetting('maintenanceMode')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-[var(--text)] font-medium">Auto-approve Applications</h3>
                <p className="text-sm text-[var(--text-muted)]">Automatically approve new applications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoApproveApplications}
                  onChange={() => toggleSetting('autoApproveApplications')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="text-[var(--text)] font-medium">Allow User Registration</h3>
                <p className="text-sm text-[var(--text-muted)]">Enable new user signups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowUserRegistration}
                  onChange={() => toggleSetting('allowUserRegistration')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--border)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--border-muted)]">
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="w-full md:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Regular user settings
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text)]">Settings</h1>
          <p className="text-[var(--text-muted)] mt-1">Manage your account and preferences</p>
        </div>
        <Card className="p-6">
          <div className="text-center py-12">
            <Clock className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-3 animate-spin" />
            <p className="text-[var(--text-muted)]">Loading settings...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text)]">Settings</h1>
        <p className="text-[var(--text-muted)] mt-1">Manage your account and preferences</p>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <Card className="p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-xl font-semibold text-[var(--text)]">Personal Details</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={personalDetails.fullName}
                onChange={handlePersonalDetailsChange}
                className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={personalDetails.email}
                onChange={handlePersonalDetailsChange}
                className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={personalDetails.phoneNumber}
                onChange={handlePersonalDetailsChange}
                className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={personalDetails.location}
                onChange={handlePersonalDetailsChange}
                className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Enter your location"
                required
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[var(--border-muted)]">
            <Button
              onClick={handleSavePersonalDetails}
              isLoading={isSaving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Personal Details
            </Button>
          </div>
        </Card>

        {/* Right Column - Startup Phase and Status */}
        <div className="flex flex-col h-full gap-6">
          {/* Startup Stage */}
          <Card className="p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--text)]">Startup Stage</h2>
              {phaseSaved && (
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Saved!</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Current Stage *</label>
                <select
                  value={startupPhase}
                  onChange={(e) => setStartupPhase(e.target.value as typeof startupPhase)}
                  className="w-full px-3 py-2 bg-white border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  {phaseOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border-muted)]">
              <Button
                onClick={handlePhaseChange}
                disabled={savingPhase}
                className="w-full"
              >
                {savingPhase ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Stage
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Startup Status */}
          <Card className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="text-xl font-semibold text-[var(--text)]">Startup Status</h2>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                currentStatus === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {currentStatus}
              </span>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-4">
                  {currentStatus === 'active' 
                    ? 'Your startup is currently active. You can mark it as dropout if you wish to discontinue.'
                    : 'Your startup is marked as dropout. You can reactivate it if needed.'}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border-muted)]">
                <Button
                  onClick={handleDropout}
                  disabled={updatingStatus || !startupId}
                  className={`w-full ${
                    currentStatus === 'dropout' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {updatingStatus ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {currentStatus === 'dropout' ? 'Reactivate Startup' : 'Mark as Dropout'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;