import React, { useState, useEffect, useMemo } from 'react';
import Card from '../ui/Card';
import { Users, AlertCircle, Loader2, ArrowLeft, Search, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInvestors } from '../../hooks/useInvestors';
import { useAuth } from '../../context/AuthContext';
import { startupsApi } from '../../services/startupsApi';
import { profileApi } from '../../services/profileApi';
import { connectionRequestsApi } from '../../services/connectionRequestsApi';
import { Investor } from '../../types';
import InvestorDirectoryTable from './InvestorDirectoryTable';

const Investors: React.FC = () => {
  const { user } = useAuth();
  const { investors, loading, error: investorsError } = useInvestors();
  const [startupName, setStartupName] = useState('');
  const [requestingIntro, setRequestingIntro] = useState<string | null>(null);
  const [introSuccess, setIntroSuccess] = useState<string | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvestors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return investors;
    return investors.filter(
      (inv) =>
        inv.name.toLowerCase().includes(q) ||
        inv.firm.toLowerCase().includes(q) ||
        inv.email.toLowerCase().includes(q) ||
        inv.investmentRange.toLowerCase().includes(q) ||
        inv.backgroundSummary.toLowerCase().includes(q) ||
        inv.phoneNumber.toLowerCase().includes(q) ||
        inv.focusAreas.some((area) => area.toLowerCase().includes(q))
    );
  }, [investors, searchTerm]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      let found = false;
      try {
        const startups = await startupsApi.getStartups(user.id);
        if (startups.length > 0 && startups[0].name) {
          setStartupName(startups[0].name);
          found = true;
        }
      } catch {
        /* noop */
      }
      if (!found) {
        try {
          const profile = await profileApi.getProfileByUserId(user.id);
          if (profile.startupName) setStartupName(profile.startupName);
        } catch {
          /* noop */
        }
      }
    };
    load();
  }, [user?.id]);

  const handleRequestIntro = async (investor: Investor) => {
    if (!user?.id || !user?.email || !user?.fullName) {
      const msg = 'User information not available. Please log in again.';
      setIntroError(msg);
      setTimeout(() => setIntroError(null), 5000);
      throw new Error(msg);
    }
    if (!startupName) {
      const msg = 'Startup name not found. Please complete your profile.';
      setIntroError(msg);
      setTimeout(() => setIntroError(null), 5000);
      throw new Error(msg);
    }
    setRequestingIntro(investor.id);
    setIntroError(null);
    setIntroSuccess(null);
    try {
      const firm = investor.firm?.trim() || '';
      await connectionRequestsApi.create({
        startupUserId: user.id,
        targetId: investor.id,
        targetType: 'investor',
        message: firm
          ? `Introduction to investor ${investor.name} · ${firm}.`
          : `Introduction to investor ${investor.name}.`,
        details: { startupName, investorFirm: investor.firm || '' },
        startupName,
        requesterEmail: user.email,
        requesterName: user.fullName,
      });
      setIntroSuccess('Request submitted successfully.');
      setTimeout(() => setIntroSuccess(null), 5000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to submit request.';
      setIntroError(msg);
      setTimeout(() => setIntroError(null), 5000);
      throw e;
    } finally {
      setRequestingIntro(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to overview
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold text-[var(--text)] mb-2">Available investors</h1>
          <p className="text-[var(--text-muted)]">Browse the directory and request an introduction.</p>
        </div>
        <div className="w-full sm:w-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 shrink-0">
          <div className="w-full sm:w-auto sm:min-w-[220px] sm:max-w-sm">
            <label htmlFor="investor-directory-search" className="sr-only">
              Search investors
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-subtle)]"
                aria-hidden
              />
              <input
                id="investor-directory-search"
                type="search"
                autoComplete="off"
                placeholder="Search investors…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-muted)] bg-[var(--bg-surface)] py-2.5 pl-10 pr-3 text-sm text-[var(--text)] placeholder:text-[var(--text-subtle)] shadow-sm focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
              />
            </div>
          </div>
          <Link
            to="/dashboard/requests?from=investors"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text)] shadow-sm transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--bg-muted)]/50 hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25 whitespace-nowrap"
          >
            <Inbox className="h-4 w-4 shrink-0" aria-hidden />
            My requests
          </Link>
        </div>
      </div>

      <Card className="p-6">
        {introSuccess && <p className="text-sm text-[var(--text-muted)] mb-4">{introSuccess}</p>}
        {introError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="text-red-700 text-sm">{introError}</span>
          </div>
        )}
        {investorsError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="text-red-700 text-sm">{investorsError}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            <span className="text-[var(--text-muted)]">Loading investors...</span>
          </div>
        ) : investors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-[var(--text-subtle)] mb-3" />
            <h2 className="text-lg font-medium text-[var(--text-muted)] mb-1">No investors available</h2>
            <p className="text-sm text-[var(--text-muted)] max-w-md">
              Investors will appear here once they are added by administrators.
            </p>
          </div>
        ) : filteredInvestors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="h-10 w-10 text-[var(--text-subtle)] mb-3" />
            <h2 className="text-lg font-medium text-[var(--text-muted)] mb-1">No matching investors</h2>
            <p className="text-sm text-[var(--text-muted)] max-w-md">
              Try a different name, firm, email, or focus area.
            </p>
          </div>
        ) : (
          <InvestorDirectoryTable
            investors={filteredInvestors}
            onRequestIntro={handleRequestIntro}
            requestingIntroId={requestingIntro}
          />
        )}
      </Card>
    </div>
  );
};

export default Investors;
