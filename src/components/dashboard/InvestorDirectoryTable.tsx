import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Investor } from '../../types';
import { ModalPortal } from '../ui/ModalPortal';

export interface InvestorDirectoryTableProps {
  investors: Investor[];
  /** Resolve on success (modal closes); reject on failure so the user can retry. */
  onRequestIntro: (investor: Investor) => Promise<void>;
  requestingIntroId: string | null;
  /** Smaller typography / padding for dashboard widget */
  compact?: boolean;
}

function focusLabel(areas: string[]): string {
  if (!areas?.length) return '—';
  return areas.join(', ');
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function InvestorAvatar({
  profilePicture,
  name,
  className,
}: {
  profilePicture: string;
  name: string;
  className: string;
}) {
  const pic = profilePicture?.trim() ?? '';
  const isRemoteOrData =
    /^https?:\/\//i.test(pic) || pic.startsWith('data:') || pic.startsWith('blob:');
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--accent-muted)] text-[var(--accent)] font-semibold overflow-hidden ${className}`}
    >
      {isRemoteOrData ? (
        <img src={pic} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{pic || getInitials(name)}</span>
      )}
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:gap-4 text-sm border-b border-[var(--border-muted)]/40 pb-3 last:border-0 last:pb-0">
      <dt className="text-[var(--text-muted)] font-medium shrink-0">{label}</dt>
      <dd className="text-[var(--text)] min-w-0 break-words">{children}</dd>
    </div>
  );
}

export const InvestorDirectoryTable: React.FC<InvestorDirectoryTableProps> = ({
  investors,
  onRequestIntro,
  requestingIntroId,
  compact = false,
}) => {
  const [selected, setSelected] = useState<Investor | null>(null);

  useEffect(() => {
    if (!selected) return;
    const stillExists = investors.some((i) => i.id === selected.id);
    if (!stillExists) setSelected(null);
  }, [investors, selected]);

  const cellPx = compact ? 'px-2 py-2' : 'px-4 py-3';
  const textName = compact ? 'text-sm' : 'text-sm';
  const textMuted = compact ? 'text-xs' : 'text-sm';

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-[var(--border-muted)] -mx-px">
        <table className="w-full min-w-[520px] text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-muted)] bg-[var(--bg-muted)]/50">
              <th className={`${cellPx} font-semibold text-[var(--text)] w-12`} scope="col">
                <span className="sr-only">Initials</span>
              </th>
              <th className={`${cellPx} font-semibold text-[var(--text)]`} scope="col">
                Investor
              </th>
              <th className={`${cellPx} font-semibold text-[var(--text)] hidden sm:table-cell`} scope="col">
                Firm
              </th>
              <th className={`${cellPx} font-semibold text-[var(--text)] hidden md:table-cell`} scope="col">
                Focus
              </th>
              <th className={`${cellPx} font-semibold text-[var(--text)] hidden lg:table-cell`} scope="col">
                Range
              </th>
            </tr>
          </thead>
          <tbody>
            {investors.map((inv) => (
              <tr
                key={inv.id}
                className="border-b border-[var(--border-muted)]/60 hover:bg-[var(--accent-muted)]/30 cursor-pointer transition-colors"
                onClick={() => setSelected(inv)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(inv);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${inv.name}`}
              >
                <td className={cellPx}>
                  <InvestorAvatar
                    profilePicture={inv.profilePicture}
                    name={inv.name}
                    className={`mx-auto ${compact ? 'h-9 w-9 text-[10px]' : 'h-9 w-9 text-xs'}`}
                  />
                </td>
                <td className={`${cellPx} ${textName} font-medium text-[var(--text)]`}>
                  {inv.name}
                  <span className={`sm:hidden block ${textMuted} font-normal text-[var(--text-muted)] mt-0.5`}>
                    {inv.firm}
                  </span>
                </td>
                <td className={`${cellPx} ${textMuted} text-[var(--text-muted)] hidden sm:table-cell`}>
                  {inv.firm}
                </td>
                <td className={`${cellPx} ${textMuted} text-[var(--text-muted)] hidden md:table-cell max-w-[200px] truncate`}>
                  {focusLabel(inv.focusAreas)}
                </td>
                <td className={`${cellPx} ${textMuted} text-[var(--text-muted)] hidden lg:table-cell whitespace-nowrap`}>
                  {inv.investmentRange}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <ModalPortal onBackdropClick={() => setSelected(null)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="investor-detail-title"
            className="w-full max-w-xl rounded-2xl border border-[var(--border-muted)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)] max-h-[min(90dvh,720px)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 p-5 border-b border-[var(--border-muted)] shrink-0">
              <div className="min-w-0 pr-2">
                <h2 id="investor-detail-title" className="text-lg font-semibold text-[var(--text)] break-words">
                  {selected.name}
                </h2>
                <p className="text-sm text-[var(--text-muted)] mt-0.5 break-words">{selected.firm}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--text)]"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              <dl className="space-y-3">
                <DetailRow label="Email">
                  {selected.email?.trim() ? (
                    <a
                      href={`mailto:${selected.email.trim()}`}
                      className="text-[var(--accent)] hover:underline font-medium"
                    >
                      {selected.email.trim()}
                    </a>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </DetailRow>
                <DetailRow label="Phone">
                  {selected.phoneNumber?.trim() ? (
                    <a
                      href={`tel:${selected.phoneNumber.replace(/[\s()-]/g, '')}`}
                      className="text-[var(--accent)] hover:underline font-medium"
                    >
                      {selected.phoneNumber.trim()}
                    </a>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </DetailRow>
                <DetailRow label="Investment range">
                  {selected.investmentRange?.trim() ? (
                    selected.investmentRange.trim()
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </DetailRow>
                <DetailRow label="Focus areas">
                  {selected.focusAreas?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selected.focusAreas.map((area) => (
                        <span
                          key={area}
                          className="text-xs px-2 py-1 rounded-full bg-[var(--bg-muted)] text-[var(--text)] border border-[var(--border-muted)]"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </DetailRow>
                <DetailRow label="Background">
                  {selected.backgroundSummary?.trim() ? (
                    <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                      {selected.backgroundSummary.trim()}
                    </p>
                  ) : (
                    <span className="text-[var(--text-muted)]">—</span>
                  )}
                </DetailRow>
              </dl>
            </div>

            <div className="p-5 border-t border-[var(--border-muted)] flex flex-wrap gap-3 justify-end shrink-0 bg-[var(--bg-muted)]/30">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await onRequestIntro(selected);
                    setSelected(null);
                  } catch {
                    /* error surfaced by parent */
                  }
                }}
                disabled={requestingIntroId === selected.id}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-colors"
              >
                {requestingIntroId === selected.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Request intro'
                )}
              </button>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
};

export default InvestorDirectoryTable;
