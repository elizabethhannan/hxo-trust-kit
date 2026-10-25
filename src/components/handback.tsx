import { useId } from 'react';
import { cx, useEmitOnce } from '../hooks';
import { emit, type OnHxoEvent } from '../telemetry';
import { ActorBadge, Button, StatusPill } from './supporting';
import { ConfidenceChip, type ConfidenceLevel } from './explain';

/* ---------- Handback/Hand-back card ---------- */
export interface HandBackCardProps {
  urgency?: 'Routine' | 'Urgent';
  state?: 'Waiting' | 'Resolved';
  agent?: string;
  timeLeft?: string;
  title?: string;
  did?: string;
  unsure?: string;
  need?: string;
  ifNoOne?: string;
  options?: string[];
  resolution?: string;
  savedNote?: string;
  onChoose?: (option: string, index: number) => void;
  onEvent?: OnHxoEvent;
}
const ROUTINE = {
  timeLeft: 'Needs you · 2 h left', title: 'Claim 4821 needs your decision',
  did: 'Coded 3 findings from the SOAP note and matched every invoice line. Policy checks passed.',
  unsure: 'Otitis externa or allergic dermatitis. Confidence 62%, below the 80% bar.',
  need: 'Choose the diagnosis, or send the claim back to the clinic.',
  ifNoOne: 'At 11:00 the claim stays on hold. Nothing is paid without a person.',
  options: ['Use otitis externa', 'Use dermatitis', 'Send back'], resolution: 'K. Patel chose otitis externa · 09:15:40',
};
const URGENT = {
  timeLeft: 'Urgent · 4 min left', title: 'Pet emergency: claim 4910 jumps the queue',
  did: 'Flagged toxin ingestion on the SOAP note and moved the claim to the front.',
  unsure: 'Whether the after-hours clinic is in network for direct pay.',
  need: 'Approve direct pay to the clinic, or pay the owner back.',
  ifNoOne: 'In 4 minutes it goes to the on-call lead. Care is never delayed.',
  options: ['Approve direct pay', 'Pay owner back', 'Escalate now'], resolution: 'K. Patel approved direct pay · 09:14:22',
};
export function HandBackCard(p: HandBackCardProps) {
  const urgency = p.urgency ?? 'Routine', state = p.state ?? 'Waiting', agent = p.agent ?? 'Coding agent';
  const d = urgency === 'Urgent' ? URGENT : ROUTINE;
  const c = { ...d, ...Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined)) } as typeof d;
  const titleId = useId();
  useEmitOnce(p.onEvent, state === 'Waiting', 'handback_shown', 'Handback/Hand-back card', { agent, action: 'shown', actor: 'agent', urgency });
  const sec = (label: string, text: string, tone?: 'agent') => (
    <div className="hxo-section"><p className={cx('hxo-eyebrow', tone === 'agent' && 'hxo-eyebrow--agent')}>{label}</p><p className="hxo-small" style={{ color: 'var(--ink)' }}>{text}</p></div>
  );
  return (
    <section className={cx('hxo', 'hxo-card', 'hxo-handback', `hxo-handback--${urgency}`, state === 'Resolved' && 'hxo-handback--Resolved')} aria-labelledby={titleId}>
      <div className="hxo-row hxo-row--between">
        <ActorBadge actor="Agent" name={agent} />
        {state === 'Waiting' ? <span aria-live="polite"><StatusPill tone={urgency === 'Urgent' ? 'Critical' : 'Warning'} label={c.timeLeft} /></span> : <StatusPill tone="Success" label="Resolved" />}
      </div>
      <h3 className="hxo-h3" id={titleId}>{c.title}</h3>
      {sec('What I did', c.did)}
      {sec('What I’m unsure of', c.unsure, 'agent')}
      {sec('What I need from you', c.need)}
      {sec('If no one decides', c.ifNoOne)}
      {state === 'Waiting' ? (
        <div className="hxo-actions">
          {c.options.map((o, i) => (
            <Button key={o} variant={i === 0 ? 'Primary' : i === 1 ? 'Secondary' : 'Ghost'}
              onClick={() => { emit(p.onEvent, 'handback_resolved', 'Handback/Hand-back card', { agent, action: 'chose', actor: 'person', option_chosen: o }); p.onChoose?.(o, i); }}>{o}</Button>
          ))}
        </div>
      ) : (
        <div className="hxo-stack">
          <p className="hxo-small hxo-good-text">{c.resolution}</p>
          <p className="hxo-small hxo-muted">{p.savedNote ?? 'Saved as a labeled example for the coding model.'}</p>
        </div>
      )}
    </section>
  );
}

/* ---------- Handback/Escalation banner ---------- */
export interface EscalationBannerProps {
  level?: 'Info' | 'Warning' | 'Critical';
  title?: string;
  detail?: string;
  clock?: string;
  actionLabel?: string;
  agent?: string;
  onAction?: () => void;
  onEvent?: OnHxoEvent;
}
const ESC = {
  Info: ['Change window opens in 2 h', '4 network fixes are queued for your review.', '01:58:20', 'Review fixes'],
  Warning: ['3 claims waiting over 2 hours', 'The coding agents could not finish them alone.', '02:14:05', 'Open claims'],
  Critical: ['Food-safety window closes soon', 'Pickup P-1010: no driver accepted. 45 lb of refrigerated food.', '00:04:12', 'Assign a driver'],
} as const;
export function EscalationBanner({ level = 'Info', title, detail, clock, actionLabel, agent = 'Router', onAction, onEvent }: EscalationBannerProps) {
  const [t, d, c, a] = ESC[level];
  useEmitOnce(onEvent, true, 'escalation_shown', 'Handback/Escalation banner', { agent, action: 'shown', actor: 'agent', level });
  return (
    <section className={cx('hxo', 'hxo-escalation', `hxo-escalation--${level}`)} role={level === 'Critical' ? 'alert' : 'status'} aria-live={level === 'Critical' ? 'assertive' : 'polite'}>
      <div className="hxo-escalation__main">
        <p className="hxo-eyebrow">{level} · Escalated to you</p>
        <p className="hxo-body-strong">{title ?? t}</p>
        <p className="hxo-small">{detail ?? d}</p>
      </div>
      <div className="hxo-stack" style={{ alignItems: 'flex-end' }}>
        <span className="hxo-clock">{clock ?? c}</span>
        <span className="hxo-small hxo-muted">time left</span>
      </div>
      <Button variant="Secondary" onClick={onAction}>{actionLabel ?? a}</Button>
    </section>
  );
}

/* ---------- Handback/Agent disagreement banner ---------- */
export interface Position { agent: string; level: ConfidenceLevel; percent: number; says: string; why: string }
export interface AgentDisagreementBannerProps {
  state?: 'Waiting' | 'Resolved';
  title?: string;
  a?: Position;
  b?: Position;
  thirdOption?: string;
  resolution?: string;
  onChoose?: (choice: string) => void;
  onEvent?: OnHxoEvent;
}
export function AgentDisagreementBanner({
  state = 'Waiting', title = 'Two agents disagree on claim 4821',
  a = { agent: 'Code matcher', level: 'Medium', percent: 74, says: 'Code SIM-OTX-01 · otitis externa', why: 'The note describes a red, swollen ear canal with discharge.' },
  b = { agent: 'Validator', level: 'High', percent: 92, says: 'Do not code yet · rule-out only', why: 'The vet wrote “rule out otitis”; the swab result is pending.' },
  thirdOption = 'Ask the clinic', resolution = 'K. Patel chose Validator · 09:18:31', onChoose, onEvent,
}: AgentDisagreementBannerProps) {
  useEmitOnce(onEvent, state === 'Waiting', 'agent_disagreement', 'Handback/Agent disagreement banner', { agent: [a.agent, b.agent], action: 'raised', actor: 'agent' });
  const choose = (choice: string) => { emit(onEvent, 'agent_disagreement', 'Handback/Agent disagreement banner', { agent: [a.agent, b.agent], action: 'decided', actor: 'person', choice }); onChoose?.(choice); };
  const pos = (x: Position) => (
    <section className="hxo-position" aria-label={`${x.agent} position`}>
      <div className="hxo-row hxo-row--between"><ActorBadge actor="Agent" name={x.agent} /><ConfidenceChip level={x.level} percent={x.percent} agent={x.agent} /></div>
      <p className="hxo-eyebrow">Says</p><p className="hxo-position__claim">{x.says}</p>
      <p className="hxo-eyebrow">Why</p><p className="hxo-small">{x.why}</p>
    </section>
  );
  return (
    <section className={cx('hxo', 'hxo-card', 'hxo-disagree', `hxo-disagree--${state}`)} aria-label={title}>
      <div className="hxo-row hxo-row--between"><h3 className="hxo-h3">{title}</h3>{state === 'Waiting' ? <StatusPill tone="Warning" label="Waiting for a person" /> : <StatusPill tone="Success" label="Decided" />}</div>
      <div className="hxo-positions">{pos(a)}{pos(b)}</div>
      {state === 'Waiting' ? (
        <>
          <div className="hxo-actions">
            <Button variant="Secondary" onClick={() => choose(a.agent)}>Use {a.agent}</Button>
            <Button variant="Secondary" onClick={() => choose(b.agent)}>Use {b.agent}</Button>
            <Button variant="Ghost" onClick={() => choose(thirdOption)}>{thirdOption}</Button>
          </div>
          <p className="hxo-small hxo-muted">Neither agent acts until a person decides. Both reasons stay in the trace.</p>
        </>
      ) : (
        <div className="hxo-stack"><div><StatusPill tone="Success" label={resolution} /></div><p className="hxo-small">Both reasons kept in the trace. The disagreement is saved as an eval case.</p></div>
      )}
    </section>
  );
}
