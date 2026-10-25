import { useEffect, useState } from 'react';
import { cx, useEmitOnce } from '../hooks';
import { emit, type OnHxoEvent } from '../telemetry';
import { ActorBadge, Button, StatusPill } from './supporting';

/* ---------- Explain/Confidence chip ---------- */
export type ConfidenceLevel = 'High' | 'Medium' | 'Low' | 'Abstain';
export interface ConfidenceChipProps {
  level?: ConfidenceLevel;
  state?: 'Default' | 'Track record';
  /** Percent shown beside the level word. Ignored for Abstain. */
  percent?: number;
  /** "Right N of 100 times" sentence for the track record. */
  trackRecord?: string;
  agent?: string;
  onEvent?: OnHxoEvent;
}
const DEFAULT_PCT: Record<ConfidenceLevel, number> = { High: 92, Medium: 74, Low: 51, Abstain: 0 };
const DEFAULT_TRACK: Record<ConfidenceLevel, string> = {
  High: 'When this agent says High, it was right 94 of 100 times in the last 30 days.',
  Medium: 'When this agent says Medium, it was right 77 of 100 times in the last 30 days.',
  Low: 'When this agent says Low, it was right 55 of 100 times in the last 30 days.',
  Abstain: 'This agent abstains when it is below 60%. It hands the case to a person.',
};
const BARS: Record<ConfidenceLevel, number> = { High: 3, Medium: 2, Low: 1, Abstain: 0 };
export function ConfidenceChip({ level = 'High', state = 'Default', percent, trackRecord, agent = 'Code matcher', onEvent }: ConfidenceChipProps) {
  const pct = percent ?? DEFAULT_PCT[level];
  const track = trackRecord ?? DEFAULT_TRACK[level];
  const [open, setOpen] = useState(state === 'Track record');
  useEffect(() => setOpen(state === 'Track record'), [state]);
  const label = level === 'Abstain' ? 'Abstains · not sure enough' : `${level} · ${pct}%`;
  const show = () => { if (!open) emit(onEvent, 'confidence_viewed', 'Explain/Confidence chip', { agent, action: 'viewed', actor: 'person', level }); setOpen(true); };
  return (
    <span className={cx('hxo', 'hxo-conf', `hxo-conf--${level}`)}>
      <button
        type="button"
        className="hxo-conf__chip"
        aria-label={`Confidence ${level}${level === 'Abstain' ? '' : `, ${pct} percent`}. ${track}`}
        aria-expanded={open}
        onFocus={show}
        onMouseEnter={show}
        onBlur={() => state !== 'Track record' && setOpen(false)}
        onMouseLeave={() => state !== 'Track record' && setOpen(false)}
      >
        <span className="hxo-conf__bars" aria-hidden="true">
          {[0, 1, 2].map(i => <i key={i} className={i < BARS[level] ? 'on' : ''} />)}
        </span>
        {label}
      </button>
      {open && <span className="hxo-conf__tip" role="note">{track}</span>}
    </span>
  );
}

/* ---------- Explain/Evidence link ---------- */
export interface EvidenceLinkProps {
  state?: 'Default' | 'Highlighted' | 'Unreadable';
  source?: string;
  span?: string;
  supports?: string;
  unreadableNote?: string;
  agent?: string;
  onEvent?: OnHxoEvent;
}
export function EvidenceLink({
  state = 'Default',
  source = state === 'Unreadable' ? 'SOAP note, page 2 · unreadable' : 'SOAP note, page 1, line 6',
  span = 'O: Left ear canal red and swollen, brown discharge.',
  supports = 'Supports code SIM-OTX-01 · otitis externa',
  unreadableNote = 'The scan is blurred. A person must read this page before the code is used.',
  agent = 'Code matcher',
  onEvent,
}: EvidenceLinkProps) {
  const [hl, setHl] = useState(state === 'Highlighted');
  useEffect(() => setHl(state === 'Highlighted'), [state]);
  return (
    <span className={cx('hxo', 'hxo-evidence', `hxo-evidence--${state}`)}>
      <button
        type="button"
        className="hxo-evidence__link"
        aria-expanded={state === 'Unreadable' ? undefined : hl}
        onClick={() => { if (state === 'Unreadable') return; emit(onEvent, 'evidence_opened', 'Explain/Evidence link', { agent, action: 'opened', actor: 'person', source, readable: true }); setHl(v => !v); }}
      >
        <span aria-hidden="true">{state === 'Unreadable' ? '⚠' : '↗'}</span> {source}
      </button>
      {hl && state !== 'Unreadable' && (
        <span className="hxo-evidence__span"><mark>{span}</mark><br /><span className="hxo-data hxo-muted">{supports}</span></span>
      )}
      {state === 'Unreadable' && <span className="hxo-small">{unreadableNote}</span>}
    </span>
  );
}

/* ---------- Explain/Agent trace row ---------- */
export interface AgentTraceRowProps {
  expanded?: boolean;
  time?: string;
  from?: string;
  to?: string;
  message?: string;
  payload?: string[];
  onEvent?: OnHxoEvent;
}
export function AgentTraceRow({
  expanded = false,
  time = '09:13:04',
  from = 'Extractor',
  to = 'Code matcher',
  message = 'Sent 4 findings for coding',
  payload = ['from: extractor · to: code-matcher · 14 ms', 'findings: ear canal red; brown discharge; pruritus 3 wk; no prior otitis', 'ruled out: none · confidence passed: 0.88'],
  onEvent,
}: AgentTraceRowProps) {
  const [open, setOpen] = useState(expanded);
  useEffect(() => setOpen(expanded), [expanded]);
  const id = `trace-${time.replace(/\W/g, '')}-${from}`.replace(/\s/g, '');
  return (
    <div className="hxo hxo-trace">
      <button type="button" className="hxo-trace__head" aria-expanded={open} aria-controls={id}
        onClick={() => { if (!open) emit(onEvent, 'trace_opened', 'Explain/Agent trace row', { agent: [from, to], action: 'opened', actor: 'person', from_agent: from, to_agent: to }); setOpen(v => !v); }}>
        <time className="hxo-trace__time">{time}</time>
        <ActorBadge actor="Agent" name={from} />
        <span aria-hidden="true" className="hxo-muted">→</span><span className="hxo-sr">to</span>
        <ActorBadge actor="Agent" name={to} />
        <span className="hxo-trace__msg">{message}</span>
        <span className="hxo-trace__caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && <pre id={id} className="hxo-code hxo-trace__payload">{payload.join('\n')}</pre>}
    </div>
  );
}

/* ---------- Explain/Understood card ---------- */
export type InputKind = 'Text' | 'Voice' | 'Pointing';
export type Certainty = 'Confident' | 'Unsure' | 'Ambiguous' | 'Needs a point';
export interface UnderstoodCardProps {
  input?: InputKind;
  certainty?: Certainty;
  agent?: string;
  youSaid?: string;
  understood?: string;
  slots?: string[];
  doubt?: string;
  options?: string[];
  onConfirm?: () => void;
  onChange?: () => void;
  onChoose?: (index: number) => void;
  onCancel?: () => void;
  onEvent?: OnHxoEvent;
}
const SAID: Record<InputKind, string> = { Text: '“Put a lamp next to the sofa.”', Voice: '“Put a lamp there.”', Pointing: 'Pointed at the floor left of the sofa' };
const INPUT_LABEL: Record<InputKind, string> = { Text: 'Typed', Voice: 'Spoken', Pointing: 'Pointed' };
export function UnderstoodCard({
  input = 'Text',
  certainty = 'Confident',
  agent = 'Layout agent',
  youSaid,
  understood = 'Add a floor lamp to the left of the grey sofa, facing the room.',
  slots = ['Object: floor lamp', 'Place: left of sofa', '“there” = floor point'],
  doubt = 'Not sure which sofa: there are two in the room.',
  options = ['Grey sofa by the window', 'Leather sofa by the door'],
  onConfirm, onChange, onChoose, onCancel, onEvent,
}: UnderstoodCardProps) {
  const said = youSaid ?? (certainty === 'Needs a point' ? SAID.Voice : SAID[input]);
  useEmitOnce(onEvent, true, 'understood_shown', 'Explain/Understood card', { agent, action: 'shown', actor: 'agent', input, certainty });
  useEmitOnce(onEvent, certainty === 'Ambiguous', 'clarify_asked', 'Explain/Understood card', { agent, action: 'clarify', actor: 'agent', options_count: options.length });
  useEffect(() => {
    if (certainty !== 'Ambiguous') return;
    const k = (e: KeyboardEvent) => { const n = Number(e.key); if (n >= 1 && n <= options.length) onChoose?.(n - 1); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [certainty, options.length, onChoose]);
  const eyebrow = certainty === 'Confident' ? 'I understood' : certainty === 'Unsure' ? 'I think you mean' : certainty === 'Ambiguous' ? 'Which one did you mean?' : 'Show me where';
  return (
    <section className={cx('hxo', 'hxo-card', certainty === 'Confident' ? 'hxo-card--agent' : 'hxo-card--warn', 'hxo-understood')} aria-live="polite" aria-label={`${agent}: ${eyebrow}`}>
      <div className="hxo-row hxo-row--between">
        <ActorBadge actor="Agent" name={agent} />
        <StatusPill tone="Neutral" label={INPUT_LABEL[certainty === 'Needs a point' ? 'Voice' : input]} />
      </div>
      <div className="hxo-stack">
        <p className="hxo-eyebrow">You said</p>
        <p className="hxo-small" style={{ color: 'var(--ink)' }}>{said}</p>
      </div>
      {certainty === 'Ambiguous' ? (
        <div className="hxo-understood__panel hxo-understood__panel--unsure">
          <p className="hxo-eyebrow hxo-eyebrow--warn">{eyebrow}</p>
          {options.map((o, i) => (
            <button key={o} type="button" className="hxo-option" onClick={() => onChoose?.(i)} aria-keyshortcuts={String(i + 1)}>
              <span className="hxo-option__num" aria-hidden="true">{i + 1}</span>{o}
            </button>
          ))}
          <p className="hxo-small">Say or press {options.map((_, i) => i + 1).join(' or ')}. The numbers also show in the room.</p>
        </div>
      ) : certainty === 'Needs a point' ? (
        <div className="hxo-understood__panel hxo-understood__panel--unsure">
          <p className="hxo-eyebrow hxo-eyebrow--warn">{eyebrow}</p>
          <div className="hxo-point-target">Point to the spot, then say “here”.</div>
        </div>
      ) : (
        <div className={cx('hxo-understood__panel', certainty === 'Unsure' && 'hxo-understood__panel--unsure')}>
          <p className={cx('hxo-eyebrow', certainty === 'Unsure' ? 'hxo-eyebrow--warn' : 'hxo-eyebrow--agent')}>{eyebrow}</p>
          <p className="hxo-body-strong">{understood}</p>
          <div className="hxo-understood__slots">{slots.map(s => <span key={s} className="hxo-slot">{s}</span>)}</div>
          {certainty === 'Unsure' && <p className="hxo-small" style={{ color: 'var(--warn-ink)' }}>{doubt}</p>}
        </div>
      )}
      <div className="hxo-actions">
        {certainty === 'Confident' && <><Button variant="Primary" onClick={onConfirm}>Do it</Button><Button variant="Secondary" onClick={onChange}>Change</Button></>}
        {certainty === 'Unsure' && <><Button variant="Primary" onClick={onConfirm}>Yes, the grey sofa</Button><Button variant="Secondary" onClick={onChange}>Pick another</Button></>}
        {(certainty === 'Ambiguous' || certainty === 'Needs a point') && <Button variant="Secondary" onClick={onCancel}>Cancel</Button>}
      </div>
    </section>
  );
}
