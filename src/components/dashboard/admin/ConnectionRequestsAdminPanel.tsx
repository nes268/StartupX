import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, AlertCircle, ClipboardList } from 'lucide-react';
import Card from '../../ui/Card';
import { connectionRequestsApi } from '../../../services/connectionRequestsApi';
import { ConnectionRequest, ConnectionRequestStatus } from '../../../types';

const STATUS_OPTIONS: ConnectionRequestStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];

const statusLabel: Record<ConnectionRequestStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export interface ConnectionRequestsAdminPanelProps {
  targetType: 'mentor' | 'investor';
  /** When false, omit outer Card (e.g. inside a modal shell) */
  withCard?: boolean;
  /** Compact: no large title block (modal provides heading) */
  embedded?: boolean;
}

const ConnectionRequestsAdminPanel: React.FC<ConnectionRequestsAdminPanelProps> = ({
  targetType,
  withCard = true,
  embedded = false,
}) => {
  const [items, setItems] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await connectionRequestsApi.listForAdmin();
      setItems(list.filter((r) => r.targetType === targetType));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load requests.');
    } finally {
      setLoading(false);
    }
  }, [targetType]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => items, [items]);

  const onStatusChange = async (id: string, status: ConnectionRequestStatus) => {
    setUpdatingId(id);
    try {
      const updated = await connectionRequestsApi.updateStatus(id, status);
      setItems((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const title =
    targetType === 'mentor' ? 'Mentor session requests' : 'Investor introduction requests';

  const inner = (
    <>
      {embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-sm text-[var(--text-muted)]">
            {filtered.length} request{filtered.length !== 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Submitted by startups ({filtered.length} total)
            </p>
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={loading}
            className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-14 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
          <span className="text-[var(--text-muted)]">Loading…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <ClipboardList className="h-10 w-10 text-[var(--text-subtle)] mb-2" />
          <p className="text-[var(--text-muted)] text-sm">No {targetType} requests yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-muted)] -mx-px">
          <table className="w-full min-w-[820px] text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-muted)] bg-[var(--bg-muted)]/50">
                <th className="px-3 py-3 font-semibold text-[var(--text)]">Startup</th>
                <th className="px-3 py-3 font-semibold text-[var(--text)]">From</th>
                <th className="px-3 py-3 font-semibold text-[var(--text)]">
                  {targetType === 'mentor' ? 'Mentor' : 'Investor'}
                </th>
                <th className="px-3 py-3 font-semibold text-[var(--text)]">Message</th>
                <th className="px-3 py-3 font-semibold text-[var(--text)]">Status</th>
                <th className="px-3 py-3 font-semibold text-[var(--text)]">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-[var(--border-muted)]/60 align-top">
                  <td className="px-3 py-3 text-[var(--text)]">{r.startupName || '—'}</td>
                  <td className="px-3 py-3 text-[var(--text-muted)] text-xs">
                    <div>{r.requesterName}</div>
                    <div className="text-[var(--text-subtle)]">{r.requesterEmail}</div>
                  </td>
                  <td className="px-3 py-3 text-[var(--text-muted)]">{r.targetName || '—'}</td>
                  <td className="px-3 py-3 text-[var(--text-muted)] max-w-[220px]">
                    <p className="line-clamp-3" title={r.message}>
                      {r.message}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={r.status}
                      disabled={updatingId === r.id}
                      onChange={(e) => onStatusChange(r.id, e.target.value as ConnectionRequestStatus)}
                      className="w-full max-w-[140px] rounded-lg border border-[var(--border-muted)] bg-[var(--bg-surface)] px-2 py-1.5 text-xs text-[var(--text)]"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3 text-[var(--text-subtle)] whitespace-nowrap text-xs">
                    {new Date(r.createdAt).toLocaleString(undefined, {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  if (!withCard) {
    return <div className="p-1">{inner}</div>;
  }

  return <Card className="p-6">{inner}</Card>;
};

export default ConnectionRequestsAdminPanel;
