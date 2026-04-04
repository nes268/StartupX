import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Inbox } from 'lucide-react';
import Card from '../ui/Card';
import { useAuth } from '../../context/AuthContext';
import { connectionRequestsApi } from '../../services/connectionRequestsApi';
import { ConnectionRequest } from '../../types';

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const MyRequests: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');
  const backHref =
    from === 'mentors' ? '/dashboard/mentors' : from === 'investors' ? '/dashboard/investors' : '/dashboard';
  const backLabel =
    from === 'mentors' ? 'Back to Mentors' : from === 'investors' ? 'Back to Investors' : 'Back to overview';

  const filterType: 'mentor' | 'investor' | null =
    from === 'mentors' ? 'mentor' : from === 'investors' ? 'investor' : null;

  const [items, setItems] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const list = await connectionRequestsApi.listForUser(user.id);
        if (!cancelled) setItems(list);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load requests.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const displayItems = useMemo(
    () => (filterType ? items.filter((r) => r.targetType === filterType) : items),
    [items, filterType]
  );

  const emptyMessage =
    filterType === 'mentor'
      ? 'No mentor session requests yet.'
      : filterType === 'investor'
        ? 'No investor introduction requests yet.'
        : 'No requests yet.';

  const pageDescription =
    filterType === 'mentor'
      ? 'Mentor session requests you have submitted.'
      : filterType === 'investor'
        ? 'Investor introduction requests you have submitted.'
        : 'Mentor session and investor introduction requests you have submitted.';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text)] mb-2">My requests</h1>
        <p className="text-[var(--text-muted)]">{pageDescription}</p>
      </div>

      <Card className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
            <span className="text-[var(--text-muted)]">Loading…</span>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-12 w-12 text-[var(--text-subtle)] mb-3" />
            <p className="text-[var(--text-muted)]">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border-muted)] -mx-px">
            <table className="w-full min-w-[520px] text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-muted)] bg-[var(--bg-muted)]/50">
                  <th className="px-4 py-3 font-semibold text-[var(--text)]">To</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text)]">Message</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text)]">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--border-muted)]/60">
                    <td className="px-4 py-3 text-[var(--text-muted)]">{r.targetName || '—'}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)] max-w-xs truncate" title={r.message}>
                      {r.message}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--border-muted)]">
                        {statusLabel[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-subtle)] whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyRequests;
