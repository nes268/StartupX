import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../../ui/Card';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Layers,
  Lightbulb,
  Package,
  Sprout,
  LineChart,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useInvestors } from '../../../hooks/useInvestors';
import { useAuth } from '../../../context/AuthContext';
import { startupsApi } from '../../../services/startupsApi';
import { profileApi } from '../../../services/profileApi';
import { notificationsApi, UserNotification } from '../../../services/notificationsApi';

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

const journeyListVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const journeyPillVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 28 },
  },
};

const StartupStageCard: React.FC<{ phase: string }> = ({ phase }) => {
  const stepIdx = PHASE_STEPS.findIndex((s) => s.key === phase);
  const PhaseIcon = PHASE_ICONS[phase] ?? Layers;
  const phaseHint = PHASE_HINTS[phase] ?? '';

  return (
    <Card className="relative flex h-full min-h-0 flex-col overflow-hidden p-4">
      <motion.div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[var(--accent)]/[0.12] blur-2xl"
        aria-hidden
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.55, 0.85, 0.55],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="relative flex min-h-0 flex-1 flex-col"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="mb-3 flex shrink-0 items-start gap-2"
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <h2 className="text-lg font-semibold text-[var(--text)]">Startup Stage</h2>
        </motion.div>

        <div
          className="mb-3 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-muted)]/45 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          role="list"
          aria-label="Stage roadmap"
        >
          <p className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
            Journey
          </p>
          <motion.div
            className="flex flex-wrap items-center gap-1.5"
            variants={journeyListVariants}
            initial="hidden"
            animate="show"
          >
            {PHASE_STEPS.map((step, i) => {
              const isCurrent = stepIdx === i;
              const isPast = stepIdx > i;
              return (
                <motion.span
                  key={step.key}
                  role="listitem"
                  layout
                  variants={journeyPillVariants}
                  className={`relative inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    isCurrent
                      ? 'z-[1] bg-[var(--accent)]/25 text-[var(--accent)] ring-2 ring-[var(--accent)]/50 shadow-[0_0_12px_-2px_var(--accent)]'
                      : isPast
                        ? 'bg-[var(--bg-card)] text-[var(--text-muted)] ring-1 ring-[var(--border-muted)]'
                        : 'bg-[var(--bg-card)]/40 text-[var(--text-subtle)] ring-1 ring-transparent'
                  }`}
                  animate={
                    isCurrent
                      ? {
                          boxShadow: [
                            '0 0 14px -3px color-mix(in srgb, var(--accent) 45%, transparent)',
                            '0 0 22px -2px color-mix(in srgb, var(--accent) 70%, transparent)',
                            '0 0 14px -3px color-mix(in srgb, var(--accent) 45%, transparent)',
                          ],
                        }
                      : undefined
                  }
                  transition={
                    isCurrent
                      ? { boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }
                      : undefined
                  }
                >
                  {isCurrent && (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-full bg-[var(--accent)]/35"
                      initial={false}
                      animate={{
                        opacity: [0.25, 0.55, 0.25],
                        scale: [1, 1.12, 1],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{
                        zIndex: -1,
                        filter: 'blur(10px)',
                      }}
                    />
                  )}
                  {isPast && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    >
                      <CheckCircle className="h-3 w-3 shrink-0 text-[var(--accent)] opacity-80" aria-hidden />
                    </motion.span>
                  )}
                  <span className={isCurrent ? 'relative z-[1]' : undefined}>{step.label}</span>
                </motion.span>
              );
            })}
          </motion.div>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border-muted)] bg-gradient-to-br from-[var(--accent)]/[0.07] via-[var(--bg-muted)]/30 to-transparent p-3 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] ring-1 ring-[var(--accent)]/10">
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[var(--accent)] opacity-80 shadow-[0_0_12px_color-mix(in_srgb,var(--accent)_35%,transparent)]"
          />
          <div className="relative z-[1] flex gap-3 pl-1">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/18 text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-2 ring-[var(--accent)]/35">
              <PhaseIcon className="h-5 w-5" strokeWidth={2.1} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Current stage
              </p>
              <p className="mt-1 text-xl font-bold leading-none tracking-tight text-[var(--text)]">
                {formatPhaseLabel(phase)}
              </p>
            </div>
          </div>
          {phaseHint ? (
            <div className="relative z-[1] mt-3 rounded-lg border border-[var(--border-muted)]/80 bg-[var(--bg-card)]/60 py-2.5 pl-3 pr-2.5">
              <p className="border-l-2 border-[var(--accent)]/45 pl-2.5 text-xs leading-relaxed text-[var(--text-muted)]">
                {phaseHint}
              </p>
            </div>
          ) : null}
        </div>
      </motion.div>
    </Card>
  );
};

function notificationHeading(type: UserNotification['type']): string {
  switch (type) {
    case 'approval':
      return 'Application accepted';
    case 'rejection':
      return 'Application update';
    case 'event':
      return 'New event';
    case 'mentor':
      return 'New mentor';
    case 'investor':
      return 'New investor';
    case 'warning':
      return 'Heads up';
    case 'info':
      return 'Program update';
    default:
      return 'Update';
  }
}

const Overview: React.FC = () => {
  const { user } = useAuth();
  const { investors, loading: investorsLoading, error: investorsError } = useInvestors();
  const [startupPhase, setStartupPhase] = useState<string | null>(null);
  const [startupName, setStartupName] = useState<string>('');
  const [requestingIntro, setRequestingIntro] = useState<string | null>(null);
  const [introSuccess, setIntroSuccess] = useState<string | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);
  const [programNotifications, setProgramNotifications] = useState<UserNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);

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

  const refreshNotifications = React.useCallback(async (showSpinner: boolean) => {
    if (!user?.id) return;
    if (showSpinner) setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const list = await notificationsApi.getUserNotifications(user.id);
      setProgramNotifications(list);
    } catch (e) {
      console.error('Error loading notifications:', e);
      setNotificationsError('Could not load updates. Try again later.');
    } finally {
      if (showSpinner) setNotificationsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshNotifications(true);
  }, [refreshNotifications]);

  useEffect(() => {
    const t = setInterval(() => refreshNotifications(false), 60000);
    return () => clearInterval(t);
  }, [refreshNotifications]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') refreshNotifications(false);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [refreshNotifications]);

  const unreadCount = programNotifications.filter((n) => !n.read).length;

  const { primaryNotifications, overflowNotifications } = useMemo(() => {
    const unreadSorted = [...programNotifications]
      .filter((n) => !n.read)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return {
      primaryNotifications: unreadSorted.slice(0, 2),
      overflowNotifications: unreadSorted.slice(2),
    };
  }, [programNotifications]);

  const handleMarkNotificationRead = async (notificationId: string) => {
    setDismissingId(notificationId);
    try {
      await notificationsApi.markAsRead(notificationId);
      setProgramNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setDismissingId(null);
    }
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
    setIntroSuccess('Request submitted successfully.');
    setTimeout(() => setIntroSuccess(null), 5000);
    setRequestingIntro(null);
  };


  const notificationIcon = (type: UserNotification['type']) => {
    switch (type) {
      case 'approval':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'rejection':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-[var(--accent)]" />;
      case 'mentor':
        return <Users className="h-5 w-5 text-[var(--accent)]" />;
      case 'investor':
        return <TrendingUp className="h-5 w-5 text-[var(--accent)]" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return <FileText className="h-5 w-5 text-[var(--text-muted)]" />;
    }
  };

  const notificationTypeStyle = (type: UserNotification['type']) => {
    switch (type) {
      case 'approval':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'rejection':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'event':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'mentor':
        return 'bg-violet-50 text-violet-800 border-violet-200';
      case 'investor':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'warning':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      default:
        return 'bg-[var(--bg-muted)] text-[var(--text-muted)] border-[var(--border-muted)]';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text)] mb-2">Startup Dashboard</h1>
        <p className="text-[var(--text-muted)]">Track your progress and manage your startup journey</p>
      </div>

      {/* Program updates (server-backed: approval, events, mentors, investors) */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-[var(--text)]">Program updates</h2>
          <div className="text-sm text-[var(--text-muted)]">
            {notificationsLoading && programNotifications.length === 0
              ? 'Loading…'
              : unreadCount > 0
                ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}`
                : notificationsLoading
                  ? 'No updates yet'
                  : null}
          </div>
        </div>

        {notificationsError && (
          <p className="text-sm text-red-600 mb-4">{notificationsError}</p>
        )}

        {!notificationsLoading && unreadCount === 0 && !notificationsError && (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">No program updates.</p>
        )}

        {unreadCount > 0 && (
          <div className="space-y-4">
            {primaryNotifications.length > 0 && (
              <ul className="space-y-3" role="list" aria-label="Latest updates">
                {primaryNotifications.map((n) => (
                  <li
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    title="Mark as read"
                    onClick={() => handleMarkNotificationRead(n.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleMarkNotificationRead(n.id);
                      }
                    }}
                    className="flex gap-3 rounded-xl border p-4 transition-colors cursor-pointer select-none border-[var(--accent)]/25 bg-[var(--accent)]/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] hover:bg-[var(--accent)]/[0.09]"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-surface)] ring-1 ring-[var(--border-muted)]"
                      aria-hidden
                    >
                      {notificationIcon(n.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[var(--text)]">{notificationHeading(n.type)}</p>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${notificationTypeStyle(
                            n.type
                          )}`}
                        >
                          {n.type}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">{n.message}</p>
                      <p className="mt-2 text-xs text-[var(--text-subtle)]">
                        {new Date(n.createdAt).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkNotificationRead(n.id);
                      }}
                      disabled={dismissingId === n.id}
                      className="shrink-0 self-start p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-muted)] transition-colors disabled:opacity-50"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      {dismissingId === n.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {overflowNotifications.length > 0 && (
              <ul
                className="max-h-[min(40vh,260px)] overflow-y-auto overscroll-contain rounded-xl border border-[var(--border-muted)]/80 bg-[var(--bg-muted)]/20 divide-y divide-[var(--border-muted)]/40"
                role="list"
                aria-label="More program updates"
              >
                {overflowNotifications.map((n) => (
                  <li
                    key={n.id}
                    className="flex gap-2 px-3 py-2.5 opacity-90 hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => handleMarkNotificationRead(n.id)}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--bg-surface)]/80"
                      aria-hidden
                    >
                      {notificationIcon(n.type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-xs font-medium text-[var(--text)]">{notificationHeading(n.type)}</p>
                        <span
                          className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0 rounded border ${notificationTypeStyle(
                            n.type
                          )}`}
                        >
                          {n.type}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-snug text-[var(--text-muted)] line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-[10px] text-[var(--text-subtle)]">
                        {new Date(n.createdAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkNotificationRead(n.id);
                      }}
                      disabled={dismissingId === n.id}
                      className="shrink-0 self-center p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] disabled:opacity-50"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      {dismissingId === n.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-4 shrink-0">
            <h2 className="text-lg font-semibold text-[var(--text)]">Available Investors</h2>
            {!investorsLoading && investors.length > 3 && (
              <Link
                to="/dashboard/investors"
                className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors whitespace-nowrap"
              >
                View all investors ({investors.length - 3} more)
              </Link>
            )}
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
          {introSuccess && (
            <p className="text-sm text-[var(--text-muted)] mb-3 shrink-0">{introSuccess}</p>
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
                <div
                  key={investor.id}
                  className="bg-[var(--bg-muted)] rounded-xl p-3 border border-[var(--border-muted)] flex flex-col items-center text-center w-full sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)]"
                >
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
                    type="button"
                    onClick={() => handleRequestIntro(investor)}
                    disabled={requestingIntro === investor.id}
                    className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--text-subtle)] disabled:cursor-not-allowed text-white py-1.5 px-3 rounded-full text-[11px] font-medium transition-all flex items-center justify-center hover:shadow-lg hover:shadow-[var(--accent)]/20"
                  >
                    {requestingIntro === investor.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      'Request intro'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Overview;