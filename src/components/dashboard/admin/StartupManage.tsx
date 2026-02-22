import React, { useState } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Search, Filter, Building2, User, Mail, AlertCircle, Loader2, X, Phone, MapPin, Briefcase, FileText, DollarSign, Calendar, Users, Link as LinkIcon } from 'lucide-react';
import { Startup, Profile } from '../../../types';
import { useStartups } from '../../../hooks/useStartups';
import { profileApi } from '../../../services/profileApi';

const StartupManage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const {
    startups,
    loading,
    error,
    refreshStartups,
    updateStartup,
    deleteStartup
  } = useStartups();

  // Extract unique sectors from startups, with fallback to common sectors
  const defaultSectors = ['CleanTech', 'HealthTech', 'EdTech', 'FinTech', 'AgriTech', 'FoodTech', 'RetailTech', 'PropTech'];
  const sectors = startups.length > 0 
    ? Array.from(new Set(startups.map(s => s.sector))).sort()
    : defaultSectors;

  const filteredStartups = startups.filter(startup => {
    // Only show approved/active startups - exclude pending and rejected
    // Approved startups should appear in startups page after approval
    if (startup.status === 'pending' || startup.status === 'rejected') {
      return false;
    }
    // Include: 'approved', 'active', 'completed', 'dropout' (dropout will be normalized to show as dropout)
    
    const matchesSearch = 
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = filterSector === 'all' || startup.sector === filterSector;
    const matchesType = filterType === 'all' || startup.type === filterType;

    return matchesSearch && matchesSector && matchesType;
  });

  const normalizeStatus = (status: string): 'active' | 'dropout' => {
    // Normalize status for display: approved/active/completed -> active, dropout -> dropout
    // This is for startups page, dataroom, and overview pages
    return status === 'dropout' ? 'dropout' : 'active';
  };

  const getMetrics = () => {
    // Only count approved/active startups - exclude pending and rejected
    // Include: 'approved', 'active', 'completed', 'dropout'
    const approvedStartups = startups.filter(s => s.status !== 'pending' && s.status !== 'rejected');
    const activeCount = approvedStartups.filter(s => normalizeStatus(s.status) === 'active').length;
    
    return {
      total: approvedStartups.length,
      active: activeCount,
      innovation: approvedStartups.filter(s => s.type === 'innovation').length,
      incubation: approvedStartups.filter(s => s.type === 'incubation').length
    };
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = normalizeStatus(status);
    switch (normalizedStatus) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'dropout': return 'bg-red-100 text-red-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'incubation' ? 'bg-purple-100 text-purple-700' : 'bg-[var(--accent-muted)] text-[var(--accent)]';
  };

  const handleStartupNameClick = async (startup: Startup) => {
    // Set the selected startup immediately to show basic info
    setSelectedStartup(startup);
    setShowProfileModal(true);
    setProfileError(null);
    setSelectedProfile(null);

    // Extract userId - handle both string and populated object cases
    let userId: string | null = null;
    
    if (startup.userId) {
      if (typeof startup.userId === 'string') {
        // If it's a string, check if it's valid
        const trimmed = startup.userId.trim();
        if (trimmed && trimmed !== 'null' && trimmed !== 'undefined') {
          userId = trimmed;
        }
      } else if (typeof startup.userId === 'object' && startup.userId !== null) {
        // If it's a populated object, extract the _id
        const userIdObj = startup.userId as any;
        if (userIdObj._id) {
          userId = typeof userIdObj._id === 'string' ? userIdObj._id : userIdObj._id.toString();
        } else if (userIdObj.id) {
          userId = typeof userIdObj.id === 'string' ? userIdObj.id : userIdObj.id.toString();
        }
      }
    }

    // Check if we have a valid userId
    if (!userId) {
      setLoadingProfile(false);
      setProfileError('No user ID found for this startup. Profile may not be completed yet.');
      return;
    }

    setLoadingProfile(true);

    try {
      console.log('Fetching profile for userId:', userId);
      const profile = await profileApi.getProfileByUserId(userId);
      console.log('Profile fetched successfully:', profile);
      setSelectedProfile(profile);
      setProfileError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't show the raw error message if it contains object details
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile details';
      // Clean up error message to avoid showing object structures
      const cleanErrorMessage = errorMessage.includes('Invalid user ID format') 
        ? 'Profile details are not available for this startup.'
        : errorMessage;
      setProfileError(cleanErrorMessage);
      // Don't close modal on error, let user see the error message
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedStartup(null);
    setSelectedProfile(null);
    setProfileError(null);
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Startup Management</h1>
          <p className="text-gray-600 mt-1">Manage all startups in the platform</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            <span className="text-gray-600">Loading startups...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Startup Management</h1>
        <p className="text-gray-600 mt-1">Manage all startups in the platform</p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="text-red-600 font-medium">Error</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshStartups}
                className="mt-2 text-red-600 hover:text-red-300"
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Startups</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-[var(--accent)]" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Startups</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.active}</p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-gray-900" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Innovation Startups</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.innovation}</p>
            </div>
            <div className="h-8 w-8 bg-[var(--accent)] rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-gray-900" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Incubation Startups</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.incubation}</p>
            </div>
            <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-gray-900" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
                <Input
                  type="text"
                  placeholder="Search by startup name, founder, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Filters:</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="all">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="all">All Types</option>
              <option value="innovation">Innovation</option>
              <option value="incubation">Incubation</option>
            </select>

          </div>
        </div>
      </Card>

      {/* Startups Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Startup Name</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Founder</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Sector</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-700 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredStartups.map((startup) => (
                <tr key={startup.id} className="border-b border-[var(--border-muted)] hover:bg-[var(--bg-muted)]">
                  <td className="py-3 px-4">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer hover:text-[var(--accent)] transition-colors"
                      onClick={() => handleStartupNameClick(startup)}
                      title="Click to view profile details"
                    >
                      <Building2 className="h-5 w-5 text-[var(--accent)]" />
                      <span className="text-gray-900 font-medium">{startup.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">{startup.founder}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{startup.sector}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(startup.type)}`}>
                      {startup.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(startup.status)}`}>
                      {normalizeStatus(startup.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700 text-sm">{startup.email}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStartups.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No startups found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </Card>

      {/* Startup Details Modal */}
      {showProfileModal && selectedStartup && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 p-4" style={{ paddingTop: '120px' }}>
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedStartup.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">Startup Details & Profile Information</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeProfileModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Basic Startup Information */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-[var(--accent)]" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Startup Name</label>
                    <p className="text-gray-900 mt-1 font-medium">{selectedStartup.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Founder
                    </label>
                    <p className="text-gray-900 mt-1">{selectedStartup.founder}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Sector</label>
                    <p className="text-gray-900 mt-1">{selectedStartup.sector}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize mt-1 inline-block ${getTypeColor(selectedStartup.type)}`}>
                      {selectedStartup.type}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize mt-1 inline-block ${getStatusColor(selectedStartup.status)}`}>
                      {normalizeStatus(selectedStartup.status)}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </label>
                    <p className="text-gray-900 mt-1">{selectedStartup.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Submission Date
                    </label>
                    <p className="text-gray-900 mt-1">{selectedStartup.submissionDate}</p>
                  </div>
                </div>
              </div>

              {/* Profile Wizard Details */}
              {loadingProfile ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
                    <span className="text-gray-600">Loading profile details...</span>
                  </div>
                </div>
              ) : profileError ? (
                null
              ) : selectedProfile ? (
                <div className="space-y-6">
                  {/* Step 1: Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-[var(--accent)]" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Full Name</label>
                        <p className="text-gray-900 mt-1">{selectedProfile.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </label>
                        <p className="text-gray-900 mt-1">{selectedProfile.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Phone Number
                        </label>
                        <p className="text-gray-900 mt-1">{selectedProfile.phoneNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Location
                        </label>
                        <p className="text-gray-900 mt-1">{selectedProfile.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Enterprise Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-[var(--accent)]" />
                      Enterprise Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Startup Name</label>
                        <p className="text-gray-900 mt-1">{selectedProfile.startupName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Entity Type</label>
                        <p className="text-gray-900 mt-1">{selectedProfile.entityType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Application Type</label>
                        <p className="text-gray-900 mt-1 capitalize">{selectedProfile.applicationType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Sector</label>
                        <p className="text-gray-900 mt-1">{selectedProfile.sector}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Founder Name</label>
                        <p className="text-gray-900 mt-1">{selectedProfile.founderName}</p>
                      </div>
                      {selectedProfile.coFounderNames && selectedProfile.coFounderNames.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Co-Founders
                          </label>
                          <p className="text-gray-900 mt-1">{selectedProfile.coFounderNames.join(', ')}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600 flex items-center">
                          <LinkIcon className="h-4 w-4 mr-1" />
                          LinkedIn Profile
                        </label>
                        {selectedProfile.linkedinProfile ? (
                          <a href={selectedProfile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:text-[var(--accent-hover)] mt-1 block">
                            {selectedProfile.linkedinProfile}
                          </a>
                        ) : (
                          <p className="text-gray-500 mt-1 text-sm">Not provided</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Incubation Details */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building2 className="h-5 w-5 mr-2 text-[var(--accent)]" />
                      Incubation Details
                    </h3>
                    {selectedProfile.previouslyIncubated ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Previously Incubated</label>
                          <p className="text-gray-900 mt-1">Yes</p>
                        </div>
                        {selectedProfile.incubatorName && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Incubator Name</label>
                            <p className="text-gray-900 mt-1">{selectedProfile.incubatorName}</p>
                          </div>
                        )}
                        {selectedProfile.incubatorLocation && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Incubator Location</label>
                            <p className="text-gray-900 mt-1">{selectedProfile.incubatorLocation}</p>
                          </div>
                        )}
                        {selectedProfile.incubationDuration && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Duration</label>
                            <p className="text-gray-900 mt-1">{selectedProfile.incubationDuration}</p>
                          </div>
                        )}
                        {selectedProfile.incubatorType && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Incubator Type</label>
                            <p className="text-gray-900 mt-1">{selectedProfile.incubatorType}</p>
                          </div>
                        )}
                        {selectedProfile.incubationMode && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Incubation Mode</label>
                            <p className="text-gray-900 mt-1 capitalize">{selectedProfile.incubationMode}</p>
                          </div>
                        )}
                        {selectedProfile.supportsReceived && selectedProfile.supportsReceived.length > 0 && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-600">Supports Received</label>
                            <p className="text-gray-900 mt-1">{selectedProfile.supportsReceived.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm">Not previously incubated</p>
                    )}
                  </div>

                  {/* Step 4: Documentation */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[var(--accent)]" />
                      Documentation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Aadhaar Document</label>
                        <p className="text-gray-900 mt-1 text-sm">{selectedProfile.aadhaarDoc ? 'Uploaded' : 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Incorporation Certificate</label>
                        <p className="text-gray-900 mt-1 text-sm">{selectedProfile.incorporationCert ? 'Uploaded' : 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">MSME Certificate</label>
                        <p className="text-gray-900 mt-1 text-sm">{selectedProfile.msmeCert ? 'Uploaded' : 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">DPIIT Certificate</label>
                        <p className="text-gray-900 mt-1 text-sm">{selectedProfile.dpiitCert ? 'Uploaded' : 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">MOU/Partnership</label>
                        <p className="text-gray-900 mt-1 text-sm">{selectedProfile.mouPartnership ? 'Uploaded' : 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 5: Pitch Deck & Traction */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-[var(--accent)]" />
                      Pitch Deck & Traction
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Business Documents</label>
                        {selectedProfile.businessDocuments && selectedProfile.businessDocuments.length > 0 ? (
                          <p className="text-gray-900 mt-1 text-sm">{selectedProfile.businessDocuments.length} document(s) uploaded</p>
                        ) : (
                          <p className="text-gray-500 mt-1 text-sm">No documents uploaded</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Traction Details</label>
                        {selectedProfile.tractionDetails && selectedProfile.tractionDetails.length > 0 ? (
                          <ul className="list-disc list-inside text-gray-900 mt-1 text-sm space-y-1">
                            {selectedProfile.tractionDetails.map((detail, index) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 mt-1 text-sm">No traction details provided</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Balance Sheet</label>
                        <p className="text-gray-900 mt-1 text-sm">{selectedProfile.balanceSheet ? 'Uploaded' : 'Not uploaded'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 6: Funding Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-[var(--accent)]" />
                      Funding Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Funding Stage</label>
                        <p className="text-gray-900 mt-1">{selectedProfile.fundingStage}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Already Funded</label>
                        <p className="text-gray-900 mt-1">{selectedProfile.alreadyFunded ? 'Yes' : 'No'}</p>
                      </div>
                      {selectedProfile.alreadyFunded && selectedProfile.fundingAmount !== undefined && selectedProfile.fundingAmount > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Funding Amount</label>
                          <p className="text-gray-900 mt-1">₹{selectedProfile.fundingAmount.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedProfile.alreadyFunded && selectedProfile.fundingSource && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Funding Source</label>
                          <p className="text-gray-900 mt-1">{selectedProfile.fundingSource}</p>
                        </div>
                      )}
                      {selectedProfile.alreadyFunded && selectedProfile.fundingDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-600 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Funding Date
                          </label>
                          <p className="text-gray-900 mt-1">{selectedProfile.fundingDate}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StartupManage;