import { useEffect, useId, useRef, useState } from 'react';
import { cx, useEmitOnce, useMotion } from '../hooks';
import { emit, type OnHxoEvent } from '../telemetry';
import { ActorBadge, Button, StatusPill } from './supporting';
import { ConfidenceChip, type ConfidenceLevel } from './explain';

/* ---------- Act/Preview-then-apply ---------- */
export type PreviewState = 'Countdown' | 'Applied' | 'Cancelled';
export interface PreviewThenApplyProps {
  /** Move focus to Cancel when the preview appears. Default true; set false when several components share a screen. */
  takeFocus?: boolean;
  state?: PreviewState;
  motion?: 'On' | 'Off';
  agent?: string;
  preview?: string;
  applied?: string;
  appliedAt?: string;
  cancelledAt?: string;
  /** Countdown text. Defaults to the Figma copy for each Motion variant. */
  countdownText?: string;
  /** When true the countdown runs for real and calls onApply at the end. Stories use static states. */
  live?: boolean;
  durationMs?: number;
  onApply?: () => void;
  onCancel?: () => void;
  onUndo?: () => void;
  onEvent?: OnHxoEvent;
}
export function PreviewThenApply({
  state = 'Countdown', motion, agent = 'Layout agent',
  preview = 'Placing a floor lamp left of the grey sofa', applied = 'Floor lamp placed left of the grey sofa',
  appliedAt = '09:21:07', cancelledAt = '09:21:06', countdownText, live = false, durationMs = 1600, takeFocus = true,
  onApply, onCancel, onUndo, onEvent,
}: PreviewThenApplyProps) {
  const m = useMotion(motion);
  const [s, setS] = useState<PreviewState>(state);
  useEffect(() => setS(state), [state]);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const shownAt = useRef(Date.now());
  useEmitOnce(onEvent, s === 'Countdown', 'preview_shown', 'Act/Preview-then-apply', { agent, action: 'shown', actor: 'agent', motion: m });
  const cancel = () => { setS('Cancelled'); emit(onEvent, 'preview_cancelled', 'Act/Preview-then-apply', { agent, action: 'cancelled', actor: 'person', ms_before_cancel: Date.now() - shownAt.current }); onCancel?.(); };
  useEffect(() => {
    if (s !== 'Countdown') return;
    if (takeFocus) cancelRef.current?.focus({ preventScroll: true });
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); cancel(); } };
    window.addEventListener('keydown', k, true);
    const timer = live ? window.setTimeout(() => { setS('Applied'); onApply?.(); }, durationMs) : undefined;
    return () => { window.removeEventListener('keydown', k, true); if (timer) window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, live]);
  const text = countdownText ?? (m === 'On' ? 'Applies in 0.6 s · Esc to cancel' : 'Applies in 2 seconds · Esc to cancel');
  return (
    <section className={cx('hxo', 'hxo-card', 'hxo-preview', `hxo-preview--${s}`)} aria-live="polite">
      <div className="hxo-row">
        <ActorBadge actor="Agent" name={agent} />
        <p className="hxo-body-strong">{s === 'Countdown' ? preview : s === 'Applied' ? applied : 'Cancelled. Nothing changed.'}</p>
      </div>
      {s === 'Countdown' && m === 'On' && (
        <div className={cx('hxo-progress', live && 'hxo-progress--live')} style={{ ['--hxo-dur' as string]: `${durationMs}ms` }} aria-hidden="true"><i /></div>
      )}
      {s === 'Countdown' && (
        <div className="hxo-row hxo-row--between">
          <span className="hxo-data hxo-muted">{text}</span>
          <Button ref={cancelRef} variant="Secondary" onClick={cancel} aria-keyshortcuts="Escape">Cancel</Button>
        </div>
      )}
      {s === 'Applied' && (
        <div className="hxo-row hxo-row--between">
          <StatusPill tone="Success" label={`Applied · ${appliedAt}`} />
          <Button variant="Secondary" onClick={onUndo}>Undo</Button>
        </div>
      )}
      {s === 'Cancelled' && <div><StatusPill tone="Neutral" label={`Cancelled by you · ${cancelledAt}`} /></div>}
    </section>
  );
}

/* ---------- Act/Approval card ---------- */
export interface ApprovalCardProps {
  /** Move focus to the title when the card appears. Default true; set false when several components share a screen. */
  takeFocus?: boolean;
  kind?: 'Standard' | 'Destructive';
  state?: 'Waiting' | 'Approved' | 'Declined';
  agent?: string;
  title?: string;
  changes?: string[];
  approveLabel?: string;
  decidedBy?: string;
  decidedAt?: string;
  reason?: string;
  resultNote?: string;
  onApprove?: () => void;
  onDecline?: (reason?: string) => void;
  onEvent?: OnHxoEvent;
}
export function ApprovalCard(p: ApprovalCardProps) {
  const kind = p.kind ?? 'Standard', state = p.state ?? 'Waiting', agent = p.agent ?? 'Coding agent';
  const destructive = kind === 'Destructive';
  const title = p.title ?? (destructive ? 'Delete 3 duplicate claims?' : 'Submit claim 4821 to the insurer?');
  const changes = p.changes ?? (destructive
    ? ['Claims 4630-B, 4630-C and 4630-D removed from the desk', 'The audit record is kept; the claims are not']
    : ['Claim packet: 3 codes, 6 invoice lines, $412.80', 'Sent to the insurer for direct pay to Kierland Animal Clinic', 'Undo stays open for 10 minutes']);
  const approveLabel = p.approveLabel ?? (destructive ? 'Delete 3 claims' : 'Submit claim');
  const by = p.decidedBy ?? 'K. Patel';
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (state === 'Waiting' && p.takeFocus !== false) titleRef.current?.focus({ preventScroll: true }); }, [state]);
  useEmitOnce(p.onEvent, state === 'Waiting', 'approval_requested', 'Act/Approval card', { agent, action: 'requested', actor: 'agent', kind });
  const decide = (action: 'approved' | 'declined') => {
    emit(p.onEvent, 'decision_made', 'Act/Approval card', { agent, action, actor: 'person', kind, reason: action === 'declined' ? p.reason : undefined });
    if (action === 'approved') p.onApprove?.(); else p.onDecline?.(p.reason);
  };
  return (
    <section className={cx('hxo', 'hxo-card', 'hxo-approval', `hxo-approval--${kind}`, destructive && 'hxo-card--crit')} aria-labelledby={titleId}>
      <div className="hxo-row hxo-row--between">
        <ActorBadge actor="Agent" name={agent} />
        {state === 'Waiting' && <StatusPill tone="Warning" label="Waiting for your OK" />}
        {state === 'Approved' && <StatusPill tone="Success" label="Approved" />}
        {state === 'Declined' && <StatusPill tone="Neutral" label="Declined" />}
      </div>
      <h3 className="hxo-h3" id={titleId} ref={titleRef} tabIndex={-1}>{title}</h3>
      <div className="hxo-well">
        <p className="hxo-eyebrow">What changes</p>
        <ul className="hxo-list">{changes.map(c => <li key={c}>{c}</li>)}</ul>
      </div>
      {destructive && <p className="hxo-warning-text">This cannot be undone.</p>}
      {state === 'Waiting' && (
        <div className="hxo-actions">
          <Button variant={destructive ? 'Destructive' : 'Primary'} onClick={() => decide('approved')}>{approveLabel}</Button>
          <Button variant="Secondary" onClick={() => decide('declined')}>Decline</Button>
        </div>
      )}
      {state === 'Approved' && (
        <div className="hxo-stack">
          <p className="hxo-small hxo-good-text">Approved by {by} · {p.decidedAt ?? '09:16:02'}</p>
          <p className="hxo-small hxo-muted">{p.resultNote ?? (destructive ? 'Audit record #A-2207 kept' : 'Undo until 09:26:02')}</p>
        </div>
      )}
      {state === 'Declined' && (
        <div className="hxo-stack">
          <p className="hxo-small" style={{ color: 'var(--ink)' }}>Declined by {by} · {p.decidedAt ?? '09:16:40'}</p>
          <p className="hxo-small">Reason: {p.reason ?? 'duplicates are separate visits'}</p>
        </div>
      )}
    </section>
  );
}

/* ---------- Act/Correction with reason ---------- */
export type CorrectionMode = 'Edit value' | 'Pick alternative' | 'Reject with reason';
export interface CorrectionAlternative { label: string; level: ConfidenceLevel; percent: number }
export interface CorrectionWithReasonProps {
  mode?: CorrectionMode;
  agent?: string;
  proposed?: string;
  value?: string;
  alternatives?: CorrectionAlternative[];
  reasons?: string[];
  defaultReason?: string;
  defaultNote?: string;
  onSave?: (r: { mode: CorrectionMode; value?: string; reason: string; note: string }) => void;
  onEvent?: OnHxoEvent;
}
export function CorrectionWithReason({
  mode = 'Edit value', agent = 'Code matcher', proposed = 'SIM-OTX-01 · Otitis externa', value = 'SIM-DRM-02 · Allergic dermatitis',
  alternatives = [{ label: 'SIM-DRM-02 · Allergic dermatitis', level: 'Medium', percent: 74 }, { label: 'SIM-OTM-03 · Otitis media', level: 'Low', percent: 51 }],
  reasons = ['Not in the note', 'Wrong body system', 'Pre-existing', 'Rule-out, not a diagnosis', 'Other'],
  defaultReason, defaultNote, onSave, onEvent,
}: CorrectionWithReasonProps) {
  const reject = mode === 'Reject with reason';
  const [reason, setReason] = useState<string | undefined>(defaultReason ?? (reject ? 'Rule-out, not a diagnosis' : 'Not in the note'));
  const [note, setNote] = useState(defaultNote ?? (reject ? '“Ear swab pending. The vet wrote rule out, not confirmed.”' : ''));
  const [val, setVal] = useState(value);
  const [alt, setAlt] = useState(0);
  const name = useId();
  const save = () => {
    if (!reason) return;
    const v = mode === 'Edit value' ? val : mode === 'Pick alternative' ? alternatives[alt]?.label : undefined;
    emit(onEvent, 'correction_made', 'Act/Correction with reason', { agent, action: mode === 'Edit value' ? 'edit' : mode === 'Pick alternative' ? 'pick' : 'reject', actor: 'person', reason, note_length: note.length, labeled_example_id: `ex_${Date.now().toString(36)}` });
    onSave?.({ mode, value: v, reason, note });
  };
  return (
    <section className="hxo hxo-card hxo-correction" aria-label={reject ? 'Reject this code' : 'Correct the code'}>
      <div className="hxo-row hxo-row--between">
        <h3 className="hxo-h3">{reject ? 'Reject this code' : 'Correct the code'}</h3>
        <ActorBadge actor="Agent" name={agent} />
      </div>
      <div className="hxo-stack">
        <p className="hxo-eyebrow">Agent proposed</p>
        <p className="hxo-data" style={{ color: 'var(--ai-ink)' }}>{proposed}</p>
      </div>
      {mode === 'Edit value' && (
        <label className="hxo-stack"><span className="hxo-small">Your code</span>
          <input className="hxo-field hxo-field--mono" value={val} onChange={e => setVal(e.target.value)} />
        </label>
      )}
      {mode === 'Pick alternative' && (
        <fieldset className="hxo-stack" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="hxo-sr">Pick an alternative code</legend>
          {alternatives.map((a, i) => (
            <label key={a.label} className="hxo-alt">
              <input type="radio" name={`${name}-alt`} checked={alt === i} onChange={() => setAlt(i)} />
              <span className="hxo-alt__text">{a.label}</span>
              <ConfidenceChip level={a.level} percent={a.percent} agent={agent} />
            </label>
          ))}
        </fieldset>
      )}
      <fieldset className="hxo-chips" role="radiogroup" aria-required="true">
        <legend className="hxo-legend" style={{ width: '100%' }}>{reject ? 'Why is it wrong? (required)' : 'Reason (required)'}</legend>
        {reasons.map(r => (
          <label key={r} className="hxo-chip-radio">
            <input type="radio" name={`${name}-reason`} value={r} checked={reason === r} onChange={() => setReason(r)} />
            <span>{r}</span>
          </label>
        ))}
      </fieldset>
      <label className="hxo-stack">
        <span className="hxo-sr">Note for the agent (optional)</span>
        <input className="hxo-field" placeholder="Add a note for the agent (optional)" value={note} onChange={e => setNote(e.target.value)} />
      </label>
      <div className="hxo-row hxo-row--between">
        <Button variant={reject ? 'Destructive' : 'Primary'} disabled={!reason} onClick={save}>{reject ? 'Reject code' : 'Save correction'}</Button>
        <span className="hxo-small hxo-muted">Saved as a labeled example</span>
      </div>
    </section>
  );
}
