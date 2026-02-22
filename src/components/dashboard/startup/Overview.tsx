import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  FileText, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { useInvestors } from '../../../hooks/useInvestors';
import { useFunding } from '../../../context/FundingContext';
import { useAlerts } from '../../../context/AlertsContext';
import { useAuth } from '../../../context/AuthContext';
import { startupsApi } from '../../../services/startupsApi';
import { investorsApi } from '../../../services/investorsApi';
import { profileApi } from '../../../services/profileApi';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const { investors, loading: investorsLoading, error: investorsError } = useInvestors();
  const { fundingStages } = useFunding();
  const { getUpcomingAlerts, markAsCompleted, deleteAlert } = useAlerts();
  const [startupPhase, setStartupPhase] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(true);
  const [startupName, setStartupName] = useState<string>('');
  const [requestingIntro, setRequestingIntro] = useState<string | null>(null);
  const [introSuccess, setIntroSuccess] = useState<string | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          setLoadingPhase(true);
          
          // Fetch startup phase and name
          let foundStartupName = false;
          try {
            const startups = await startupsApi.getStartups(user.id);
            if (startups.length > 0) {
              if (startups[0].startupPhase) {
                setStartupPhase(startups[0].startupPhase);
              }
              if (startups[0].name) {
                setStartupName(startups[0].name);
                foundStartupName = true;
              }
            }
          } catch (error) {
            console.error('Error fetching startup phase:', error);
          }

          // Fetch profile to get startup name if not available from startup
          if (!foundStartupName) {
            try {
              const profile = await profileApi.getProfileByUserId(user.id);
              if (profile.startupName) {
                setStartupName(profile.startupName);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }
        } finally {
          setLoadingPhase(false);
        }
      } else {
        setLoadingPhase(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const getPhaseLabel = (phase: string | null) => {
    if (!phase) return 'Not Set';
    const phaseMap: { [key: string]: string } = {
      'idea': 'Idea',
      'mvp': 'MVP',
      'seed': 'Seed',
      'series-a': 'Series A',
      'growth': 'Growth',
      'scale': 'Scale'
    };
    return phaseMap[phase] || phase;
  };

  const alerts = getUpcomingAlerts(30); // Get alerts for next 30 days

  const handleMarkComplete = (alertId: string) => {
    markAsCompleted(alertId);
  };

  const handleDeleteAlert = (alertId: string) => {
    deleteAlert(alertId);
  };

  const handleRequestIntro = async (investor: { id: string; email: string; name: string }) => {
    if (!user?.id || !user?.email || !user?.fullName) {
      setIntroError('User information not available. Please log in again.');
      setTimeout(() => setIntroError(null), 5000);
      return;
    }

    if (!startupName) {
      setIntroError('Startup name not found. Please complete your profile.');
      setTimeout(() => setIntroError(null), 5000);
      return;
    }

    setRequestingIntro(investor.id);
    setIntroError(null);
    setIntroSuccess(null);

    try {
      await investorsApi.requestIntro(
        investor.email,
        startupName,
        user.email,
        user.fullName
      );
      
      setIntroSuccess(`Introduction request sent to ${investor.name} successfully!`);
      setTimeout(() => setIntroSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error sending intro request:', error);
      setIntroError(error.message || 'Failed to send introduction request. Please try again.');
      setTimeout(() => setIntroError(null), 5000);
    } finally {
      setRequestingIntro(null);
    }
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-600 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'low':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      default:
        return 'bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border)]';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'deadline':
        return <AlertCircle className="h-4 w-4" />;
      case 'session':
        return <Users className="h-4 w-4" />;
      case 'milestone':
        return <TrendingUp className="h-4 w-4" />;
      case 'funding':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Use funding stages from context instead of hardcoded milestones
  const milestones = fundingStages.map(stage => ({
    stage: stage.name,
    status: stage.status,
    date: stage.date || null,
    progress: stage.progress
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'current':
        return <Clock className="h-5 w-5 text-[var(--accent)]" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-[var(--border)]"></div>;
    }
  };


  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'current':
        return 'bg-[var(--accent)]';
      default:
        return 'bg-[var(--border)]';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text)] mb-2">Startup Dashboard</h1>
        <p className="text-[var(--text-muted)]">Track your progress and manage your startup journey</p>
      </div>

      {/* Upcoming Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">
            Upcoming Alerts
          </h2>
          <div className="text-sm text-[var(--text-muted)]">
            {alerts.length} upcoming alerts
          </div>
        </div>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-[var(--text-subtle)] mx-auto mb-3" />
            <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No upcoming alerts</h3>
            <p className="text-[var(--text-muted)]">Alerts will appear here when admin actions occur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-[var(--bg-muted)] rounded-xl p-4 border border-[var(--border-muted)] hover:border-[var(--border)] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(alert.type)}
                    <h3 className="text-[var(--text)] font-medium">{alert.title}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMarkComplete(alert.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                      title="Delete alert"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {alert.description && (
                  <p className="text-sm text-[var(--text-muted)] mb-2">{alert.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(alert.priority)}`}>
                    {alert.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.type === 'meeting' ? 'bg-blue-50 text-blue-600' :
                    alert.type === 'deadline' ? 'bg-red-50 text-red-600' :
                    alert.type === 'session' ? 'bg-emerald-50 text-emerald-600' :
                    alert.type === 'milestone' ? 'bg-purple-50 text-purple-600' :
                    alert.type === 'funding' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                  }`}>
                    {alert.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Fundraising Progress and Investor Suggestions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Fundraising and Startup Stage */}
        <div className="space-y-6">
          {/* Fundraising Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text)] flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[var(--accent)]" />
                Fundraising
              </h2>
              <div className="text-sm text-[var(--text-muted)]">
                {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
              </div>
            </div>
            
            {/* Horizontal Progress Bar */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-[var(--bg-muted)] rounded-full">
                <div 
                  className="h-1 bg-gradient-to-r from-emerald-500 to-[var(--accent)] rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(milestones.filter(m => m.status === 'completed').length / milestones.length) * 100}%` 
                  }}
                ></div>
              </div>
              
              {/* Steps */}
              <div className="relative flex items-center justify-between">
                {milestones.map((milestone, index) => {
                  const isCompleted = milestone.status === 'completed';
                  const isCurrent = milestone.status === 'current';
                  
                  return (
                    <div 
                      key={index} 
                      className="relative flex flex-col items-center"
                    >
                      {/* Step Circle */}
                      <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30' 
                          : isCurrent
                          ? 'bg-[var(--accent)] border-[var(--accent)] shadow-lg shadow-[var(--accent)]/30'
                          : 'bg-[var(--bg-muted)] border-[var(--border)]'
                      }`}>
                        {getStatusIcon(milestone.status)}
                      </div>
                      
                      {/* Step Label */}
                      <div className="mt-3 text-center">
                        <p className={`text-xs font-medium ${
                          isCompleted ? 'text-emerald-600' :
                          isCurrent ? 'text-[var(--accent)]' :
                          'text-[var(--text-muted)]'
                        }`}>
                          {milestone.stage}
                        </p>
                        <p className="text-xs text-[var(--text-subtle)] mt-1">
                          {milestone.progress}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Startup Stage */}
          {startupPhase && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text)]">Startup Stage</h2>
              </div>
              <div className="mb-4">
                <p className="text-xs text-[var(--text-muted)] mb-1">Current Stage</p>
                <p className="text-xl font-bold text-[var(--text)]">{getPhaseLabel(startupPhase)}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Investor Suggestions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-6">Available Investors</h2>
          
          {introSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700 text-sm">{introSuccess}</span>
              </div>
            </div>
          )}

          {introError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700 text-sm">{introError}</span>
              </div>
            </div>
          )}
          
          {investorsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700 text-sm">{investorsError}</span>
              </div>
            </div>
          )}

          {investorsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
                <span className="text-[var(--text-muted)]">Loading investors...</span>
              </div>
            </div>
          ) : investors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-[var(--text-subtle)] mx-auto mb-3" />
              <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No investors available</h3>
              <p className="text-[var(--text-muted)]">Investors will appear here once they are added by administrators</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              {investors.slice(0, 3).map((investor) => (
                <div key={investor.id} className="bg-[var(--bg-muted)] rounded-xl p-4 border border-[var(--border-muted)] flex flex-col items-center text-center w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)]">
                  <div className="mb-3">
                    <div className="h-12 w-12 bg-[var(--accent-muted)] rounded-full flex items-center justify-center text-[var(--accent)] font-medium mx-auto mb-2">
                      {investor.profilePicture}
                    </div>
                    <h3 className="text-[var(--text)] font-medium text-base mb-1">{investor.name}</h3>
                    <p className="text-xs text-[var(--text-muted)]">{investor.firm}</p>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-3">{investor.backgroundSummary}</p>
                  <p className="text-xs text-[var(--text-subtle)] mb-3">Investment Range: {investor.investmentRange}</p>
                  <button 
                    onClick={() => handleRequestIntro(investor)}
                    disabled={requestingIntro === investor.id}
                    className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--text-subtle)] disabled:cursor-not-allowed text-white py-2 px-4 rounded-full text-xs font-medium transition-all flex items-center justify-center hover:shadow-lg hover:shadow-[var(--accent)]/20"
                  >
                    {requestingIntro === investor.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Request Intro'
                    )}
                  </button>
                </div>
              ))}
              {investors.length > 3 && (
                <div className="w-full text-center mt-4">
                  <button className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-medium">
                    View All Investors ({investors.length - 3} more)
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
};

export default Overview;