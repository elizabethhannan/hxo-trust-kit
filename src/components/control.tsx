import { useEffect, useId, useState } from 'react';
import { cx } from '../hooks';
import { emit, type OnHxoEvent } from '../telemetry';
import { ActorBadge, Button, StatusPill } from './supporting';

/* ---------- Control/Undo bar ---------- */
export interface UndoBarProps {
  state?: 'Available' | 'Expired' | 'Undone';
  title?: string;
  detail?: string;
  agent?: string;
  onUndo?: () => void;
  onEvent?: OnHxoEvent;
}
const UNDO_COPY = {
  Available: ['Floor lamp placed', 'Undo stays open until the next step runs'],
  Expired: ['Undo closed', 'The next step ran at 09:21:19. Use history to roll back.'],
  Undone: ['Undone', 'The room is back the way it was.'],
} as const;
export function UndoBar({ state = 'Available', title, detail, agent = 'Layout agent', onUndo, onEvent }: UndoBarProps) {
  const [s, setS] = useState(state);
  useEffect(() => setS(state), [state]);
  const [t, d] = s === state ? [title ?? UNDO_COPY[s][0], detail ?? UNDO_COPY[s][1]] : UNDO_COPY[s];
  return (
    <section className={cx('hxo', 'hxo-card', 'hxo-undo', `hxo-undo--${s}`)} aria-live="polite">
      <div className="hxo-stack">
        <p className="hxo-body-strong">{t}</p>
        <p className="hxo-small">{d}</p>
      </div>
      {s === 'Available' && (
        <Button variant="Secondary" autoFocus={false} onClick={() => { emit(onEvent, 'undo', 'Control/Undo bar', { agent, action: 'undo', actor: 'person' }); setS('Undone'); onUndo?.(); }}>Undo</Button>
      )}
    </section>
  );
}

/* ---------- Control/Stop control ---------- */
export interface StopControlProps {
  state?: 'Idle' | 'Stopping' | 'Stopped';
  working?: number;
  security?: number;
  stoppedAt?: string;
  /** Workspace-specific headline; defaults to the Figma copy. */
  headline?: string;
  onStop?: () => void;
  onRestart?: () => void;
  onEvent?: OnHxoEvent;
}
export function StopControl({ state = 'Idle', working = 13, security = 5, stoppedAt = '09:22:40', headline, onStop, onRestart, onEvent }: StopControlProps) {
  const [s, setS] = useState(state);
  useEffect(() => setS(state), [state]);
  const stop = () => { if (s !== 'Idle') return; emit(onEvent, 'stop', 'Control/Stop control', { agent: 'all', action: 'stop', actor: 'person', scope: 'all except security' }); setS('Stopping'); onStop?.(); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !e.defaultPrevented) stop(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  return (
    <section className={cx('hxo', 'hxo-card', 'hxo-stop', `hxo-stop--${s}`)} role="status" aria-live="assertive">
      {s === 'Idle' && <p className="hxo-body-strong">{headline ?? `${working} working agents running`}</p>}
      {s === 'Stopping' && <><div><StatusPill tone="Warning" label={`Stopping ${working} agents…`} /></div><p className="hxo-small">Finishing the current write so nothing is left half done.</p></>}
      {s === 'Stopped' && <><p className="hxo-body-strong">All {working} working agents stopped · {stoppedAt}</p><div><Button variant="Secondary" onClick={onRestart}>Restart agents</Button></div></>}
      {s === 'Idle' && <Button variant="Destructive" block onClick={stop} aria-keyshortcuts="Escape">Stop all agents  (Esc)</Button>}
      <div className="hxo-row">
        <ActorBadge actor="Security" name={`${security} security agent${security === 1 ? '' : 's'}`} />
        <span className="hxo-label" style={{ fontWeight: 400, color: "var(--ink-2)" }}>keep running to protect data</span>
      </div>
    </section>
  );
}

/* ---------- Control/Pause one agent ---------- */
export interface PauseOneAgentProps {
  state?: 'Running' | 'Paused' | 'Resumed';
  agent?: string;
  runningLabel?: string;
  pausedBy?: string;
  at?: string;
  onToggle?: (paused: boolean) => void;
  onEvent?: OnHxoEvent;
}
export function PauseOneAgent({ state = 'Running', agent = 'Code matcher', runningLabel = 'Running · 24 in queue', pausedBy = 'K. Patel', at, onToggle, onEvent }: PauseOneAgentProps) {
  const [s, setS] = useState(state);
  useEffect(() => setS(state), [state]);
  const paused = s === 'Paused';
  const toggle = () => { const next = !paused; emit(onEvent, 'agent_paused', 'Control/Pause one agent', { agent, action: next ? 'paused' : 'resumed', actor: 'person' }); setS(next ? 'Paused' : 'Resumed'); onToggle?.(next); };
  return (
    <section className="hxo hxo-card hxo-pause" aria-label={`${agent} controls`}>
      <div className="hxo-row">
        <ActorBadge actor="Agent" name={agent} />
        {s === 'Running' && <StatusPill tone="Agent" label={runningLabel} />}
        {s === 'Paused' && <StatusPill tone="Warning" label={`Paused by ${pausedBy} · ${at ?? '09:24'}`} />}
        {s === 'Resumed' && <StatusPill tone="Success" label={`Resumed · ${at ?? '09:30'}`} />}
      </div>
      <div className="hxo-row">
        <button type="button" role="switch" className="hxo-switch" aria-checked={!paused} aria-label={`${agent} running`} onClick={toggle} />
        <Button variant="Ghost" onClick={toggle}>{paused ? 'Resume' : 'Pause'}</Button>
      </div>
    </section>
  );
}

/* ---------- Control/Switch decision ---------- */
export interface SwitchDecisionProps {
  action?: 'Turn off' | 'Turn on';
  state?: 'Choosing' | 'Logged';
  agent?: string;
  reasons?: string[];
  defaultReason?: number;
  note?: string;
  log?: string[];
  onConfirm?: (r: { reason: string; note: string }) => void;
  onKeep?: () => void;
  onEvent?: OnHxoEvent;
}
const OFF_REASONS = ['Pull the plug: it is causing errors or harm', 'Rebuild: new technology is available', 'Rebuild: new compliance rules apply'];
const ON_REASONS = ['Repaired: passed the Evaluation Matrix', 'New version v2.1 passed the gold set', 'Back after a compliance review'];
export function SwitchDecision({ action = 'Turn off', state = 'Choosing', agent = 'Code matcher', reasons, defaultReason = 2, note, log, onConfirm, onKeep, onEvent }: SwitchDecisionProps) {
  const off = action === 'Turn off';
  const list = reasons ?? (off ? OFF_REASONS : ON_REASONS);
  const [r, setR] = useState<number | undefined>(defaultReason);
  const [n, setN] = useState(note ?? (off ? '“State rule 4.2 changes on Nov 1; codes need a new check.”' : '“Rebuilt with the 4.2 check; gold set 30 of 30.”'));
  const name = useId();
  const lines = log ?? (off
    ? ['reason: rebuild · new compliance rules', 'by: K. Patel · 2026-10-24 09:40:12', 'note: State rule 4.2 changes on Nov 1', 'audit: #A-2231 · sent to Evaluation Matrix']
    : ['reason: new version v2.1 · gold set passed', 'by: K. Patel · 2026-10-24 09:40:12', 'note: Rebuilt with the 4.2 check', 'audit: #A-2231 · sent to Evaluation Matrix']);
  const confirm = () => { if (r === undefined) return; emit(onEvent, 'switch_decision', 'Control/Switch decision', { agent, action: off ? 'off' : 'on', actor: 'person', reason: list[r], note: n }); onConfirm?.({ reason: list[r], note: n }); };
  return (
    <section className={cx('hxo', 'hxo-card', 'hxo-switchdec', off && state === 'Choosing' && 'hxo-card--crit')} aria-label={`${action} ${agent}`}>
      <div className="hxo-row hxo-row--between">
        <h3 className="hxo-h3">{action} {agent}?</h3>
        <ActorBadge actor="Agent" name={agent} />
      </div>
      {state === 'Choosing' ? (
        <>
          <fieldset className="hxo-stack" style={{ border: 0, padding: 0, margin: 0, gap: 'var(--space-sm)' }} role="radiogroup" aria-required="true">
            <legend className="hxo-small" style={{ marginBottom: 8 }}>Choose why. Every on and off is logged with its reason.</legend>
            {list.map((t, i) => (
              <label key={t} className="hxo-alt"><input type="radio" name={name} checked={r === i} onChange={() => setR(i)} /><span className="hxo-alt__text">{t}</span></label>
            ))}
          </fieldset>
          <label><span className="hxo-sr">Note</span><input className="hxo-field" value={n} onChange={e => setN(e.target.value)} /></label>
          <div className="hxo-actions">
            <Button variant={off ? 'Destructive' : 'Primary'} disabled={r === undefined} onClick={confirm}>{off ? 'Turn off and log' : 'Turn on and log'}</Button>
            <Button variant="Secondary" onClick={onKeep}>Keep as is</Button>
          </div>
        </>
      ) : (
        <>
          <div><StatusPill tone={off ? 'Critical' : 'Success'} label={off ? 'Off · logged' : 'On · logged'} /></div>
          <pre className="hxo-code">{lines.join('\n')}</pre>
        </>
      )}
    </section>
  );
}
