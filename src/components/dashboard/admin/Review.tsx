import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Search, Filter, Eye, Check, X, Calendar, Building2, User, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Startup } from '../../../types';
import { useAlerts } from '../../../context/AlertsContext';
import { useNotifications } from '../../../context/NotificationsContext';
import { useApplications } from '../../../context/ApplicationsContext';

const Review: React.FC = () => {
  const { createApplicationApprovalAlert, createReminderAlert } = useAlerts();
  const { createApplicationNotification, createReviewNotification } = useNotifications();
  const { 
    applications, 
    isLoading,
    refreshApplications,
    updateApplication, 
    approveApplication, 
    rejectApplication 
  } = useApplications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  // Auto-refresh applications every 60 seconds (silent refresh - no loading indicator)
  useEffect(() => {
    const interval = setInterval(() => {
      // Silent refresh - don't show loading state
      refreshApplications(false);
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [refreshApplications]);

  // Refresh when page becomes visible (user switches tabs back) - silent refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Silent refresh - don't show loading state
        refreshApplications(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshApplications]);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [processingStartupId, setProcessingStartupId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [message, setMessage] = useState('');

  // Use dynamic applications from context
  const startups = applications;

  // Normalize status for Review page display: map 'active' -> 'approved', 'dropout' -> 'rejected'
  // Review page only shows: 'approved', 'rejected', or 'pending'
  const normalizeStatusForReview = (status: string): 'approved' | 'rejected' | 'pending' => {
    if (status === 'approved' || status === 'active') {
      return 'approved';
    }
    if (status === 'rejected' || status === 'dropout') {
      return 'rejected';
    }
    return 'pending';
  };

  const filteredStartups = startups.filter(startup => {
    const matchesSearch = startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         startup.sector.toLowerCase().includes(searchTerm.toLowerCase());
    // Normalize status for filtering - compare normalized statuses
    const normalizedStatus = normalizeStatusForReview(startup.status);
    const matchesFilter = filterStatus === 'all' || normalizedStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleApprove = async (startupId: string) => {
    setProcessingStartupId(startupId);
    setProcessingAction('approve');
    try {
      // Find the startup to get its details before approval
      const startup = startups.find(s => s.id === startupId);
      
      // Update application status using context (this calls the backend API)
      await approveApplication(startupId);
      
      // Create automatic alert for the approved startup
      if (startup) {
        createApplicationApprovalAlert(startup.name, 'Admin');
        
        // Create admin notification for application approval
        createApplicationNotification(
          startup.name,
          startup.founder,
          startup.sector
        );
      }
      
      setMessage('Startup application approved successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Close detail view if open
      if (selectedStartup?.id === startupId) {
        setSelectedStartup(null);
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to approve application. Please try again.');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    } finally {
      setProcessingStartupId(null);
      setProcessingAction(null);
    }
  };

  const handleReject = async (startupId: string) => {
    if (!window.confirm('Are you sure you want to reject this application?')) {
      return;
    }
    
    setProcessingStartupId(startupId);
    setProcessingAction('reject');
    try {
      // Update application status using context (this calls the backend API)
      await rejectApplication(startupId);
      
      setMessage('Startup application rejected.');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Close detail view if open
      if (selectedStartup?.id === startupId) {
        setSelectedStartup(null);
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to reject application. Please try again.');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    } finally {
      setProcessingStartupId(null);
      setProcessingAction(null);
    }
  };



  const handleViewDocument = (docName: string) => {
    // Simulate document viewing
    setMessage(`Opening ${docName}...`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 2000);
  };

  const getTypeColor = (type: string) => {
    return type === 'incubation' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
  };

  // Review page shows actual status from database: 'approved', 'rejected', or 'pending'
  // This is different from other pages which normalize to 'active' or 'dropout'
  const getStatusColor = (status: string) => {
    const normalizedStatus = normalizeStatusForReview(status);
    switch (normalizedStatus) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = normalizeStatusForReview(status);
    switch (normalizedStatus) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (selectedStartup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => setSelectedStartup(null)}>
            ← Back to Review List
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Startup Profile Review</h1>
            <p className="text-gray-600 mt-1">{selectedStartup.name}</p>
          </div>
        </div>

        <Card className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Startup Name</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Founder</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.founder}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Sector</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.sector}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Type</label>
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(selectedStartup.type)}`}>
                      {selectedStartup.type}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Status</label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedStartup.status)}
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(selectedStartup.status)}`}>
                        {normalizeStatusForReview(selectedStartup.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <p className="text-gray-900 font-medium">{selectedStartup.email}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions Sidebar */}
            {normalizeStatusForReview(selectedStartup.status) === 'pending' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="primary" 
                      className="w-full flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedStartup.id)}
                      disabled={processingStartupId === selectedStartup.id}
                    >
                      {processingStartupId === selectedStartup.id && processingAction === 'approve' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>Approve Application</span>
                    </Button>
                    
                    <Button 
                      variant="danger" 
                      className="w-full flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                      onClick={() => handleReject(selectedStartup.id)}
                      disabled={processingStartupId === selectedStartup.id}
                    >
                      {processingStartupId === selectedStartup.id && processingAction === 'reject' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      <span>Reject Application</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-600 mt-1">Review and approve startup applications</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshApplications(true)}
          disabled={isLoading && applications.length === 0}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading && applications.length === 0 ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>
      
      {/* Status Counters */}
      <div>
        <div className="flex space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm text-gray-600">
              Pending: {startups.filter(s => normalizeStatusForReview(s.status) === 'pending').length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-gray-600">
              Approved: {startups.filter(s => normalizeStatusForReview(s.status) === 'approved').length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-gray-600">
              Rejected: {startups.filter(s => normalizeStatusForReview(s.status) === 'rejected').length}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              <Input
                type="text"
                placeholder="Search startups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Applications</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Background refresh indicator */}
      {isLoading && applications.length > 0 && (
        <div className="fixed top-20 right-4 z-50">
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-lg">
            <RefreshCw className="h-4 w-4 text-[var(--accent)] animate-spin" />
            <span className="text-sm text-gray-700">Refreshing...</span>
          </div>
        </div>
      )}

      {/* Applications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredStartups.map((startup) => (
          <Card key={startup.id} className="p-6" hover>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{startup.name}</h3>
                  <p className="text-gray-600 text-sm flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {startup.founder}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sector:</span>
                  <span className="text-sm text-gray-900">{startup.sector}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(startup.type)}`}>
                    {startup.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(startup.status)}
                    <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(startup.status)}`}>
                      {normalizeStatusForReview(startup.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="text-sm text-gray-900 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {startup.submissionDate}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-300">
                <Button 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => setSelectedStartup(startup)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Review
                </Button>
                {normalizeStatusForReview(startup.status) === 'pending' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleApprove(startup.id)}
                      className="text-green-600 hover:bg-green-50"
                      disabled={processingStartupId === startup.id}
                    >
                      {processingStartupId === startup.id && processingAction === 'approve' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleReject(startup.id)}
                      className="text-red-600 hover:bg-red-50"
                      disabled={processingStartupId === startup.id}
                    >
                      {processingStartupId === startup.id && processingAction === 'reject' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {isLoading && applications.length === 0 && (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </Card>
      )}

      {!isLoading && filteredStartups.length === 0 && applications.length === 0 && (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No applications found</h3>
          <p className="text-gray-600">
            {startups.length === 0 
              ? "No startup applications yet. Applications will appear here when enterprise users sign up."
              : "Try adjusting your search or filter criteria"
            }
          </p>
        </Card>
      )}

      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-700">{message}</span>
            </div>
          </Card>
        </div>
      )}

      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-600">{message}</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Review;