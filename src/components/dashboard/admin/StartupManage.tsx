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
  const [filterStatus, setFilterStatus] = useState('all');
  const [showProfileModal, setShowProfileModal] = useState(false);
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
    const matchesSearch = 
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = filterSector === 'all' || startup.sector === filterSector;
    const matchesType = filterType === 'all' || startup.type === filterType;
    const matchesStatus = filterStatus === 'all' || startup.status === filterStatus;

    return matchesSearch && matchesSector && matchesType && matchesStatus;
  });

  const getMetrics = () => {
    return {
      total: startups.length,
      active: startups.filter(s => s.status === 'active').length,
      innovation: startups.filter(s => s.type === 'innovation').length,
      incubation: startups.filter(s => s.type === 'incubation').length
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/30 text-green-400';
      case 'completed': return 'bg-blue-900/30 text-blue-400';
      case 'dropout': return 'bg-red-900/30 text-red-400';
      case 'pending': return 'bg-yellow-900/30 text-yellow-400';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'incubation' ? 'bg-purple-900/30 text-purple-400' : 'bg-cyan-900/30 text-cyan-400';
  };

  const handleStartupNameClick = async (startup: Startup) => {
    // Check if userId exists and is valid
    if (!startup.userId || startup.userId === 'null' || startup.userId === 'undefined' || startup.userId.trim() === '') {
      setShowProfileModal(true);
      setLoadingProfile(false);
      setProfileError('No user ID found for this startup. Profile may not be completed yet.');
      setSelectedProfile(null);
      return;
    }

    setShowProfileModal(true);
    setLoadingProfile(true);
    setProfileError(null);
    setSelectedProfile(null);

    try {
      console.log('Fetching profile for userId:', startup.userId, 'Type:', typeof startup.userId);
      const profile = await profileApi.getProfileByUserId(startup.userId);
      console.log('Profile fetched successfully:', profile);
      setSelectedProfile(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile details';
      setProfileError(errorMessage);
      // Don't close modal on error, let user see the error message
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
    setProfileError(null);
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Startup Management</h1>
          <p className="text-gray-400 mt-1">Manage all startups in the platform</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-gray-400">Loading startups...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Startup Management</h1>
        <p className="text-gray-400 mt-1">Manage all startups in the platform</p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-900/20 border-red-500/50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="text-red-400 font-medium">Error</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={refreshStartups}
                className="mt-2 text-red-400 hover:text-red-300"
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
              <p className="text-sm text-gray-400 mb-1">Total Startups</p>
              <p className="text-2xl font-bold text-white">{metrics.total}</p>
            </div>
            <Building2 className="h-8 w-8 text-cyan-400" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Startups</p>
              <p className="text-2xl font-bold text-white">{metrics.active}</p>
            </div>
            <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Innovation Startups</p>
              <p className="text-2xl font-bold text-white">{metrics.innovation}</p>
            </div>
            <div className="h-8 w-8 bg-cyan-500 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Incubation Startups</p>
              <p className="text-2xl font-bold text-white">{metrics.incubation}</p>
            </div>
            <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Filters:</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Sectors</option>
              {sectors.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Types</option>
              <option value="innovation">Innovation</option>
              <option value="incubation">Incubation</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="dropout">Dropout</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Startups Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Startup Name</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Founder</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Sector</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredStartups.map((startup) => (
                <tr key={startup.id} className="border-b border-gray-800 hover:bg-gray-700/20">
                  <td className="py-3 px-4">
                    <div 
                      className="flex items-center space-x-3 cursor-pointer hover:text-cyan-400 transition-colors"
                      onClick={() => handleStartupNameClick(startup)}
                      title="Click to view profile details"
                    >
                      <Building2 className="h-5 w-5 text-cyan-400" />
                      <span className="text-white font-medium">{startup.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300">{startup.founder}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{startup.sector}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(startup.type)}`}>
                      {startup.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(startup.status)}`}>
                      {startup.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{startup.email}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStartups.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No startups found</h3>
            <p className="text-gray-400">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </Card>

      {/* Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Startup Profile Details</h2>
                <Button variant="ghost" size="sm" onClick={closeProfileModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {loadingProfile ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                    <span className="text-gray-400">Loading profile...</span>
                  </div>
                </div>
              ) : profileError ? (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <p className="text-red-300">{profileError}</p>
                  </div>
                </div>
              ) : selectedProfile ? (
                <div className="space-y-6">
                  {/* Step 1: Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-cyan-400" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Full Name</label>
                        <p className="text-white mt-1">{selectedProfile.fullName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </label>
                        <p className="text-white mt-1">{selectedProfile.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          Phone Number
                        </label>
                        <p className="text-white mt-1">{selectedProfile.phoneNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Location
                        </label>
                        <p className="text-white mt-1">{selectedProfile.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Enterprise Information */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-cyan-400" />
                      Enterprise Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Startup Name</label>
                        <p className="text-white mt-1">{selectedProfile.startupName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Entity Type</label>
                        <p className="text-white mt-1">{selectedProfile.entityType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Application Type</label>
                        <p className="text-white mt-1 capitalize">{selectedProfile.applicationType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Sector</label>
                        <p className="text-white mt-1">{selectedProfile.sector}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Founder Name</label>
                        <p className="text-white mt-1">{selectedProfile.founderName}</p>
                      </div>
                      {selectedProfile.coFounderNames && selectedProfile.coFounderNames.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-400 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Co-Founders
                          </label>
                          <p className="text-white mt-1">{selectedProfile.coFounderNames.join(', ')}</p>
                        </div>
                      )}
                      {selectedProfile.linkedinProfile && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-400 flex items-center">
                            <LinkIcon className="h-4 w-4 mr-1" />
                            LinkedIn Profile
                          </label>
                          <a href={selectedProfile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300 mt-1 block">
                            {selectedProfile.linkedinProfile}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Incubation Details */}
                  {selectedProfile.previouslyIncubated && (
                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-cyan-400" />
                        Incubation Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProfile.incubatorName && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">Incubator Name</label>
                            <p className="text-white mt-1">{selectedProfile.incubatorName}</p>
                          </div>
                        )}
                        {selectedProfile.incubatorLocation && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">Incubator Location</label>
                            <p className="text-white mt-1">{selectedProfile.incubatorLocation}</p>
                          </div>
                        )}
                        {selectedProfile.incubationDuration && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">Duration</label>
                            <p className="text-white mt-1">{selectedProfile.incubationDuration}</p>
                          </div>
                        )}
                        {selectedProfile.incubatorType && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">Incubator Type</label>
                            <p className="text-white mt-1">{selectedProfile.incubatorType}</p>
                          </div>
                        )}
                        {selectedProfile.incubationMode && (
                          <div>
                            <label className="text-sm font-medium text-gray-400">Incubation Mode</label>
                            <p className="text-white mt-1 capitalize">{selectedProfile.incubationMode}</p>
                          </div>
                        )}
                        {selectedProfile.supportsReceived && selectedProfile.supportsReceived.length > 0 && (
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium text-gray-400">Supports Received</label>
                            <p className="text-white mt-1">{selectedProfile.supportsReceived.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Documentation */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-cyan-400" />
                      Documentation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Aadhaar Document</label>
                        <p className="text-white mt-1 text-sm">{selectedProfile.aadhaarDoc ? 'Uploaded' : 'Not provided'}</p>
                      </div>
                      {selectedProfile.incorporationCert && (
                        <div>
                          <label className="text-sm font-medium text-gray-400">Incorporation Certificate</label>
                          <p className="text-white mt-1 text-sm">Uploaded</p>
                        </div>
                      )}
                      {selectedProfile.msmeCert && (
                        <div>
                          <label className="text-sm font-medium text-gray-400">MSME Certificate</label>
                          <p className="text-white mt-1 text-sm">Uploaded</p>
                        </div>
                      )}
                      {selectedProfile.dpiitCert && (
                        <div>
                          <label className="text-sm font-medium text-gray-400">DPIIT Certificate</label>
                          <p className="text-white mt-1 text-sm">Uploaded</p>
                        </div>
                      )}
                      {selectedProfile.mouPartnership && (
                        <div>
                          <label className="text-sm font-medium text-gray-400">MOU/Partnership</label>
                          <p className="text-white mt-1 text-sm">Uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 5: Pitch Deck & Traction */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-cyan-400" />
                      Pitch Deck & Traction
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Business Documents</label>
                        {selectedProfile.businessDocuments && selectedProfile.businessDocuments.length > 0 ? (
                          <p className="text-white mt-1 text-sm">{selectedProfile.businessDocuments.length} document(s) uploaded</p>
                        ) : (
                          <p className="text-gray-500 mt-1 text-sm">No documents uploaded</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Traction Details</label>
                        {selectedProfile.tractionDetails && selectedProfile.tractionDetails.length > 0 ? (
                          <ul className="list-disc list-inside text-white mt-1 text-sm space-y-1">
                            {selectedProfile.tractionDetails.map((detail, index) => (
                              <li key={index}>{detail}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 mt-1 text-sm">No traction details provided</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Balance Sheet</label>
                        <p className="text-white mt-1 text-sm">{selectedProfile.balanceSheet ? 'Uploaded' : 'Not uploaded'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 6: Funding Information */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-cyan-400" />
                      Funding Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Funding Stage</label>
                        <p className="text-white mt-1">{selectedProfile.fundingStage}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Already Funded</label>
                        <p className="text-white mt-1">{selectedProfile.alreadyFunded ? 'Yes' : 'No'}</p>
                      </div>
                      {selectedProfile.fundingAmount && (
                        <div>
                          <label className="text-sm font-medium text-gray-400">Funding Amount</label>
                          <p className="text-white mt-1">₹{selectedProfile.fundingAmount.toLocaleString()}</p>
                        </div>
                      )}
                      {selectedProfile.fundingSource && (
                        <div>
                          <label className="text-sm font-medium text-gray-400">Funding Source</label>
                          <p className="text-white mt-1">{selectedProfile.fundingSource}</p>
                        </div>
                      )}
                      {selectedProfile.fundingDate && (
                        <div>
                          <label className="text-sm font-medium text-gray-400 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Funding Date
                          </label>
                          <p className="text-white mt-1">{selectedProfile.fundingDate}</p>
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