import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Layers,
  Lightbulb,
  Package,
  Sprout,
  LineChart,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useInvestors } from '../../../hooks/useInvestors';
import { useAlerts } from '../../../context/AlertsContext';
import { useAuth } from '../../../context/AuthContext';
import { startupsApi } from '../../../services/startupsApi';
import { investorsApi } from '../../../services/investorsApi';
import { profileApi } from '../../../services/profileApi';

const PHASE_STEPS: { key: string; label: string }[] = [
  { key: 'idea', label: 'Idea' },
  { key: 'mvp', label: 'MVP' },
  { key: 'seed', label: 'Seed' },
  { key: 'series-a', label: 'Series A' },
  { key: 'growth', label: 'Growth' },
  { key: 'scale', label: 'Scale' },
];

const PHASE_ICONS: Record<string, LucideIcon> = {
  idea: Lightbulb,
  mvp: Package,
  seed: Sprout,
  'series-a': TrendingUp,
  growth: LineChart,
  scale: Zap,
};

const PHASE_HINTS: Record<string, string> = {
  idea: 'Shape the vision, validate the problem, and talk to early users.',
  mvp: 'Ship a minimal product and learn from real usage.',
  seed: 'Prove traction and prepare for your first institutional round.',
  'series-a': 'Scale what works and sharpen unit economics.',
  growth: 'Expand markets, teams, and repeatable go-to-market.',
  scale: 'Optimize operations and capture dominant share.',
};

const formatPhaseLabel = (phase: string) => {
  const phaseMap: Record<string, string> = {
    idea: 'Idea',
    mvp: 'MVP',
    seed: 'Seed',
    'series-a': 'Series A',
    growth: 'Growth',
    scale: 'Scale',
  };
  return phaseMap[phase] || phase;
};

const StartupStageCard: React.FC<{ phase: string }> = ({ phase }) => {
  const stepIdx = PHASE_STEPS.findIndex((s) => s.key === phase);
  const PhaseIcon = PHASE_ICONS[phase] ?? Layers;
  const phaseHint = PHASE_HINTS[phase] ?? '';

  return (
    <Card className="flex h-full min-h-0 flex-col p-4 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--accent)]/[0.12] blur-2xl"
        aria-hidden
      />
      <div className="relative flex min-h-0 flex-1 flex-col">
        <h2 className="mb-4 shrink-0 text-lg font-semibold text-[var(--text)]">Startup Stage</h2>

        <div className="mb-2.5 flex flex-wrap items-center gap-1" role="list" aria-label="Stage roadmap">
          {PHASE_STEPS.map((step, i) => {
            const isCurrent = stepIdx === i;
            const isPast = stepIdx > i;
            return (
              <span key={step.key} role="listitem" className="contents">
                {i > 0 && (
                  <span
                    className={`mx-0.5 h-px w-3 shrink-0 rounded-full sm:w-4 ${
                      isPast ? 'bg-emerald-500/50' : isCurrent ? 'bg-[var(--accent)]/45' : 'bg-[var(--border)]'
                    }`}
                    aria-hidden
                  />
                )}
                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                    isCurrent
                      ? 'bg-[var(--accent)]/18 text-[var(--accent)] ring-1 ring-[var(--accent)]/35 shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset]'
                      : isPast
                        ? 'bg-emerald-500/10 text-emerald-700/90'
                        : 'bg-[var(--bg-muted)] text-[var(--text-subtle)]'
                  }`}
                >
                  {step.label}
                </span>
              </span>
            );
          })}
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/[0.08] via-transparent to-violet-500/[0.06] p-3 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]">
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] ring-1 ring-[var(--accent)]/25">
              <PhaseIcon className="h-4 w-4" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">Current Stage</p>
              <p className="mt-0.5 text-lg font-bold tracking-tight text-[var(--text)]">{formatPhaseLabel(phase)}</p>
              {phaseHint && (
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-muted)]">{phaseHint}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Overview: React.FC = () => {
  const { user } = useAuth();
  const { investors, loading: investorsLoading, error: investorsError } = useInvestors();
  const { getUpcomingAlerts, markAsCompleted, deleteAlert } = useAlerts();
  const [startupPhase, setStartupPhase] = useState<string | null>(null);
  const [startupName, setStartupName] = useState<string>('');
  const [requestingIntro, setRequestingIntro] = useState<string | null>(null);
  const [introSuccess, setIntroSuccess] = useState<string | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
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
          /* noop */
        }
      }
    };
    fetchData();
  }, [user?.id]);

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

      {/* Startup Stage and Available Investors — equal height on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-stretch gap-6">
        <div className="flex h-full min-h-0 flex-col">
          {startupPhase && <StartupStageCard phase={startupPhase} />}
        </div>

        {/* Investor Suggestions */}
        <Card className="flex h-full min-h-0 flex-col p-4">
          <h2 className="text-lg font-semibold text-[var(--text)] mb-4 shrink-0">Available Investors</h2>

          <div className="flex min-h-0 flex-1 flex-col">
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
            <div className="flex flex-1 items-center justify-center py-6">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--accent)]" />
                <span className="text-[var(--text-muted)]">Loading investors...</span>
              </div>
            </div>
          ) : investors.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
              <Users className="h-10 w-10 text-[var(--text-subtle)] mx-auto mb-2" />
              <h3 className="text-lg font-medium text-[var(--text-muted)] mb-2">No investors available</h3>
              <p className="text-[var(--text-muted)]">Investors will appear here once they are added by administrators</p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-wrap content-start gap-3 justify-center">
              {investors.slice(0, 3).map((investor) => (
                <div key={investor.id} className="bg-[var(--bg-muted)] rounded-xl p-3 border border-[var(--border-muted)] flex flex-col items-center text-center w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]">
                  <div className="mb-2">
                    <div className="h-10 w-10 bg-[var(--accent-muted)] rounded-full flex items-center justify-center text-[var(--accent)] text-sm font-medium mx-auto mb-1.5">
                      {investor.profilePicture}
                    </div>
                    <h3 className="text-[var(--text)] font-medium text-sm mb-0.5">{investor.name}</h3>
                    <p className="text-[11px] text-[var(--text-muted)]">{investor.firm}</p>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mb-1.5 line-clamp-2">{investor.backgroundSummary}</p>
                  <p className="text-[10px] text-[var(--text-subtle)] mb-2">Investment Range: {investor.investmentRange}</p>
                  <button 
                    onClick={() => handleRequestIntro(investor)}
                    disabled={requestingIntro === investor.id}
                    className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--text-subtle)] disabled:cursor-not-allowed text-white py-1.5 px-3 rounded-full text-[11px] font-medium transition-all flex items-center justify-center hover:shadow-lg hover:shadow-[var(--accent)]/20"
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
                <div className="w-full text-center mt-3">
                  <button className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-medium">
                    View All Investors ({investors.length - 3} more)
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Overview;