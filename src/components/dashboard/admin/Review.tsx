import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Search, Filter, Eye, Check, X, Calendar, Building2, AlertCircle, CheckCircle, Loader2, RefreshCw, FileText } from 'lucide-react';
import { Startup, Profile } from '../../../types';
import { useNotifications } from '../../../context/NotificationsContext';
import { useApplications } from '../../../context/ApplicationsContext';
import { profileApi } from '../../../services/profileApi';
import { startupsApi } from '../../../services/startupsApi';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function resolveAssetUrl(ref: string): string {
  if (!ref || typeof ref !== 'string') return '';
  const t = ref.trim();
  if (!t) return '';
  if (t.startsWith('http://') || t.startsWith('https://') || t.startsWith('data:')) return t;
  return t.startsWith('/') ? `${API_BASE}${t}` : `${API_BASE}/${t}`;
}

function fileLabel(ref: string): string {
  if (!ref) return '';
  const parts = ref.split(/[/\\]/);
  return parts[parts.length - 1] || ref;
}

const ProfileField: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="py-2.5 border-b border-gray-100 last:border-b-0">
    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
    <dd className="text-sm text-gray-900 mt-1 break-words">
      {children != null && children !== '' ? children : '—'}
    </dd>
  </div>
);

const DocumentLink: React.FC<{ href?: string; label: string }> = ({ href, label }) => {
  if (!href) return <span className="text-gray-400">—</span>;
  const url = resolveAssetUrl(href);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all inline-flex items-center gap-1">
      <FileText className="h-3.5 w-3.5 shrink-0" />
      {label || fileLabel(href)}
    </a>
  );
};

type ProfileTabId = 'personal' | 'enterprise' | 'incubation' | 'documents' | 'pitch' | 'funding';

const STARTUP_PHASE_LABELS: Record<string, string> = {
  idea: 'Idea',
  mvp: 'MVP',
  seed: 'Seed',
  'series-a': 'Series A',
  growth: 'Growth',
  scale: 'Scale',
};

const PROFILE_TABS: { id: ProfileTabId; label: string }[] = [
  { id: 'personal', label: 'Personal' },
  { id: 'enterprise', label: 'Enterprise' },
  { id: 'incubation', label: 'Incubation' },
  { id: 'documents', label: 'Documents' },
  { id: 'pitch', label: 'Pitch & traction' },
  { id: 'funding', label: 'Funding' },
];

const ProfileSubmissionTabs: React.FC<{ profile: Profile }> = ({ profile }) => {
  const [tab, setTab] = useState<ProfileTabId>('personal');

  useEffect(() => {
    setTab('personal');
  }, [profile.id]);

  return (
    <Card className="border border-gray-200 overflow-hidden shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50/90">
        <nav className="flex overflow-x-auto gap-1 px-2 py-2 sm:px-3" aria-label="Profile sections">
          {PROFILE_TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                id={`profile-tab-${t.id}`}
                aria-controls={`profile-panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-white text-[var(--accent)] shadow-sm ring-1 ring-gray-200/80'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6 sm:p-8">
        {tab === 'personal' && (
          <div role="tabpanel" id="profile-panel-personal" aria-labelledby="profile-tab-personal">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal information</h3>
            <dl className="max-w-2xl">
              <ProfileField label="Full name">{profile.fullName}</ProfileField>
              <ProfileField label="Email">{profile.email}</ProfileField>
              <ProfileField label="Phone">{profile.phoneNumber}</ProfileField>
              <ProfileField label="Location">{profile.location}</ProfileField>
            </dl>
          </div>
        )}

        {tab === 'enterprise' && (
          <div role="tabpanel" id="profile-panel-enterprise" aria-labelledby="profile-tab-enterprise">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enterprise information</h3>
            <dl className="max-w-2xl">
              <ProfileField label="Startup name">{profile.startupName}</ProfileField>
              <ProfileField label="Entity type">{profile.entityType}</ProfileField>
              <ProfileField label="Application type">{profile.applicationType}</ProfileField>
              <ProfileField label="Founder name">{profile.founderName}</ProfileField>
              <ProfileField label="Co-founders">
                {profile.coFounderNames && profile.coFounderNames.length > 0
                  ? profile.coFounderNames.join(', ')
                  : undefined}
              </ProfileField>
              <ProfileField label="Sector">{profile.sector}</ProfileField>
              <ProfileField label="LinkedIn">{profile.linkedinProfile || undefined}</ProfileField>
            </dl>
          </div>
        )}

        {tab === 'incubation' && (
          <div role="tabpanel" id="profile-panel-incubation" aria-labelledby="profile-tab-incubation">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Incubation details</h3>
            <dl className="max-w-2xl">
              <ProfileField label="Previously incubated">{profile.previouslyIncubated ? 'Yes' : 'No'}</ProfileField>
              <ProfileField label="Incubator name">{profile.incubatorName}</ProfileField>
              <ProfileField label="Incubator location">{profile.incubatorLocation}</ProfileField>
              <ProfileField label="Duration">{profile.incubationDuration}</ProfileField>
              <ProfileField label="Incubator type">{profile.incubatorType}</ProfileField>
              <ProfileField label="Mode">{profile.incubationMode}</ProfileField>
              <ProfileField label="Supports received">
                {profile.supportsReceived && profile.supportsReceived.length > 0
                  ? profile.supportsReceived.join(', ')
                  : undefined}
              </ProfileField>
            </dl>
          </div>
        )}

        {tab === 'documents' && (
          <div role="tabpanel" id="profile-panel-documents" aria-labelledby="profile-tab-documents">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h3>
            <dl className="max-w-2xl">
              <ProfileField label="Aadhaar">
                <DocumentLink href={profile.aadhaarDoc} label={fileLabel(profile.aadhaarDoc)} />
              </ProfileField>
              <ProfileField label="Incorporation certificate">
                <DocumentLink href={profile.incorporationCert} label={fileLabel(profile.incorporationCert || '')} />
              </ProfileField>
              <ProfileField label="MSME">
                <DocumentLink href={profile.msmeCert} label={fileLabel(profile.msmeCert || '')} />
              </ProfileField>
              <ProfileField label="DPIIT">
                <DocumentLink href={profile.dpiitCert} label={fileLabel(profile.dpiitCert || '')} />
              </ProfileField>
              <ProfileField label="MoU / partnership">
                <DocumentLink href={profile.mouPartnership} label={fileLabel(profile.mouPartnership || '')} />
              </ProfileField>
            </dl>
          </div>
        )}

        {tab === 'pitch' && (
          <div role="tabpanel" id="profile-panel-pitch" aria-labelledby="profile-tab-pitch">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pitch deck & traction</h3>
            <dl className="max-w-2xl">
              <ProfileField label="Business documents / pitch">
                {profile.businessDocuments && profile.businessDocuments.length > 0 ? (
                  <ul className="space-y-2 mt-1 list-none pl-0">
                    {profile.businessDocuments.map((doc, i) => (
                      <li key={i}>
                        <DocumentLink href={doc} label={fileLabel(doc)} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  '—'
                )}
              </ProfileField>
              <ProfileField label="Traction documents">
                {profile.tractionDetails && profile.tractionDetails.length > 0 ? (
                  <ul className="space-y-2 mt-1 list-none pl-0">
                    {profile.tractionDetails.map((doc, i) => (
                      <li key={i}>
                        <DocumentLink href={doc} label={fileLabel(doc)} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  '—'
                )}
              </ProfileField>
              <ProfileField label="Balance sheet">
                <DocumentLink href={profile.balanceSheet} label={fileLabel(profile.balanceSheet || '')} />
              </ProfileField>
            </dl>
          </div>
        )}

        {tab === 'funding' && (
          <div role="tabpanel" id="profile-panel-funding" aria-labelledby="profile-tab-funding">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding information</h3>
            <dl className="max-w-2xl">
              <ProfileField label="Funding stage">{profile.fundingStage}</ProfileField>
              <ProfileField label="Already funded">{profile.alreadyFunded ? 'Yes' : 'No'}</ProfileField>
              <ProfileField label="Funding amount">
                {profile.fundingAmount != null ? String(profile.fundingAmount) : undefined}
              </ProfileField>
              <ProfileField label="Funding source">{profile.fundingSource}</ProfileField>
              <ProfileField label="Funding date">{profile.fundingDate}</ProfileField>
            </dl>
          </div>
        )}
      </div>
    </Card>
  );
};

const Review: React.FC = () => {
  const { startupId: routeStartupId } = useParams<{ startupId: string }>();
  const navigate = useNavigate();
  const { createApplicationNotification } = useNotifications();
  const {
    applications,
    isLoading,
    refreshApplications,
    approveApplication,
    rejectApplication,
  } = useApplications();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [detailStartup, setDetailStartup] = useState<Startup | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [profileLoadNote, setProfileLoadNote] = useState<string | null>(null);
  const [processingStartupId, setProcessingStartupId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [message, setMessage] = useState('');

  const startups = applications;

  const refetchApplicationDetailSilently = useCallback(async () => {
    const id = routeStartupId;
    if (!id) return;
    try {
      const s = await startupsApi.getStartupById(id);
      setDetailStartup(s);
      setDetailError(null);
      if (!s.userId) {
        setProfile(null);
        setProfileLoadNote('This application has no linked user ID, so profile wizard data cannot be loaded.');
        return;
      }
      try {
        const p = await profileApi.getProfileByUserId(s.userId);
        setProfile(p);
        setProfileLoadNote(null);
      } catch {
        setProfile(null);
        setProfileLoadNote('No profile record found for this founder (they may not have completed the profile wizard).');
      }
    } catch (e: unknown) {
      console.error('Review detail refresh failed:', e);
    }
  }, [routeStartupId]);

  useEffect(() => {
    const tick = async () => {
      await refreshApplications(false);
      await refetchApplicationDetailSilently();
    };
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [refreshApplications, refetchApplicationDetailSilently]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshApplications(false);
        void refetchApplicationDetailSilently();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshApplications, refetchApplicationDetailSilently]);

  useEffect(() => {
    if (!routeStartupId) {
      setDetailStartup(null);
      setProfile(null);
      setDetailError(null);
      setProfileLoadNote(null);
      return;
    }

    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      setDetailError(null);
      setProfileLoadNote(null);
      setProfile(null);
      try {
        const s = await startupsApi.getStartupById(routeStartupId);
        if (cancelled) return;
        setDetailStartup(s);
        if (!s.userId) {
          setProfileLoadNote('This application has no linked user ID, so profile wizard data cannot be loaded.');
          return;
        }
        try {
          const p = await profileApi.getProfileByUserId(s.userId);
          if (!cancelled) setProfile(p);
        } catch {
          if (!cancelled) {
            setProfileLoadNote('No profile record found for this founder (they may not have completed the profile wizard).');
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setDetailStartup(null);
          setDetailError(e instanceof Error ? e.message : 'Application not found.');
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [routeStartupId]);

  const normalizeStatusForReview = (status: string): 'approved' | 'rejected' | 'pending' => {
    if (status === 'approved' || status === 'active') return 'approved';
    if (status === 'rejected' || status === 'dropout') return 'rejected';
    return 'pending';
  };

  const filteredStartups = startups.filter((startup) => {
    const matchesSearch =
      startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.founder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      startup.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const normalizedStatus = normalizeStatusForReview(startup.status);
    const matchesFilter = filterStatus === 'all' || normalizedStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const goBackToList = () => navigate('/admin/review');

  const handleApprove = async (id: string) => {
    setProcessingStartupId(id);
    setProcessingAction('approve');
    try {
      const startup = startups.find((s) => s.id === id);
      await approveApplication(id);
      if (startup) {
        createApplicationNotification(startup.name, startup.founder, startup.sector);
      }
      setMessage('Startup application approved successfully!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      if (routeStartupId === id) goBackToList();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Failed to approve application. Please try again.');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    } finally {
      setProcessingStartupId(null);
      setProcessingAction(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this application?')) return;

    setProcessingStartupId(id);
    setProcessingAction('reject');
    try {
      await rejectApplication(id);
      setMessage('Startup application rejected.');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      if (routeStartupId === id) goBackToList();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Failed to reject application. Please try again.');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 3000);
    } finally {
      setProcessingStartupId(null);
      setProcessingAction(null);
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'incubation' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
  };

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

  /* ——— Detail view (routed: /admin/review/:startupId) ——— */
  if (routeStartupId) {
    if (detailLoading && !detailStartup) {
      return (
        <Card className="p-12 text-center max-w-lg mx-auto">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--accent)] mx-auto mb-4" />
          <p className="text-gray-600">Loading application…</p>
        </Card>
      );
    }

    if (detailError || !detailStartup) {
      return (
        <div className="space-y-6">
          <Button variant="ghost" onClick={goBackToList}>
            ← Back to Review List
          </Button>
          <Card className="p-8 text-center border-red-100">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-800 font-medium">{detailError || 'Application not found.'}</p>
          </Card>
        </div>
      );
    }

    const s = detailStartup;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={goBackToList}>
              ← Back to Review List
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Startup application</h1>
              <p className="text-gray-600 mt-1">{s.name}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(s.status)}`}>
              {normalizeStatusForReview(s.status)}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getTypeColor(s.type)}`}>{s.type}</span>
          </div>
        </div>

        {profileLoadNote && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">{profileLoadNote}</p>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
          <div className="space-y-6 min-w-0">
            <Card className="p-6 border border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Application summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Startup</span>
                  <p className="font-medium text-gray-900">{s.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Founder</span>
                  <p className="font-medium text-gray-900">{s.founder}</p>
                </div>
                <div>
                  <span className="text-gray-500">Sector</span>
                  <p className="font-medium text-gray-900">{s.sector}</p>
                </div>
                <div>
                  <span className="text-gray-500">Startup stage</span>
                  <p className="font-medium text-gray-900 capitalize">
                    {s.startupPhase ? STARTUP_PHASE_LABELS[s.startupPhase] ?? s.startupPhase.replace(/-/g, ' ') : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Contact email</span>
                  <p className="font-medium text-gray-900 break-all">{s.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Submitted</span>
                  <p className="font-medium text-gray-900 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {s.submissionDate}
                  </p>
                </div>
                {s.userId && (
                  <div>
                    <span className="text-gray-500">User ID</span>
                    <p className="font-mono text-xs text-gray-800 break-all">{s.userId}</p>
                  </div>
                )}
              </div>
            </Card>

            {profile && (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">Founder profile submission</h2>
                <ProfileSubmissionTabs profile={profile} />
              </div>
            )}
          </div>

          {normalizeStatusForReview(s.status) === 'pending' && (
            <Card className="p-6 border border-gray-200 xl:sticky xl:top-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
              <Button
                variant="primary"
                className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
                onClick={() => handleApprove(s.id)}
                disabled={processingStartupId === s.id}
              >
                {processingStartupId === s.id && processingAction === 'approve' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                <span>Approve</span>
              </Button>
              <Button
                variant="danger"
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700"
                onClick={() => handleReject(s.id)}
                disabled={processingStartupId === s.id}
              >
                {processingStartupId === s.id && processingAction === 'reject' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                <span>Reject</span>
              </Button>
            </Card>
          )}
        </div>

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
  }

  /* ——— List view ——— */
  return (
    <div className="space-y-6">
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

      {isLoading && applications.length > 0 && (
        <div className="fixed top-20 right-4 z-50">
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-lg">
            <RefreshCw className="h-4 w-4 text-[var(--accent)] animate-spin" />
            <span className="text-sm text-gray-700">Refreshing...</span>
          </div>
        </div>
      )}

      {!isLoading && applications.length > 0 && filteredStartups.length === 0 && (
        <Card className="p-10 text-center">
          <Filter className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-800 mb-1">No applications match</h3>
          <p className="text-gray-600 text-sm">Try a different search term or status filter.</p>
        </Card>
      )}

      {filteredStartups.length > 0 && (
        <Card className="overflow-hidden p-0 border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                    Startup
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-gray-900 hidden sm:table-cell">
                    Founder
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                    Submitted
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold text-gray-900 text-right w-[1%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStartups.map((startup) => (
                  <tr
                    key={startup.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/90 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/review/${startup.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/admin/review/${startup.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    aria-label={`Open application: ${startup.name}`}
                  >
                    <td className="px-4 py-3 align-middle">
                      <span className="font-medium text-gray-900">{startup.name}</span>
                      <span className="sm:hidden block text-xs text-gray-500 mt-0.5">{startup.founder}</span>
                    </td>
                    <td className="px-4 py-3 align-middle text-gray-700 hidden sm:table-cell">{startup.founder}</td>
                    <td className="px-4 py-3 align-middle text-gray-700 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden />
                        {startup.submissionDate}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${getStatusColor(startup.status)}`}>
                        {normalizeStatusForReview(startup.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => navigate(`/admin/review/${startup.id}`)}
                          title="Open full application"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Review</span>
                        </Button>
                        {normalizeStatusForReview(startup.status) === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-green-600 hover:bg-green-50 border-green-200"
                              onClick={() => handleApprove(startup.id)}
                              disabled={processingStartupId === startup.id}
                              title="Approve"
                            >
                              {processingStartupId === startup.id && processingAction === 'approve' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span className="sr-only">Approve</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-600 hover:bg-red-50 border-red-200"
                              onClick={() => handleReject(startup.id)}
                              disabled={processingStartupId === startup.id}
                              title="Reject"
                            >
                              {processingStartupId === startup.id && processingAction === 'reject' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                              <span className="sr-only">Reject</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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
              ? 'No startup applications yet. Applications will appear here when enterprise users sign up.'
              : 'Try adjusting your search or filter criteria'}
          </p>
        </Card>
      )}

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
