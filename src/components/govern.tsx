import { useEffect, useId, useState } from 'react';
import { cx, useEmitOnce } from '../hooks';
import { emit, type OnHxoEvent } from '../telemetry';
import { ActorBadge, Button, StatusPill } from './supporting';

/* ---------- Learn/Human Frustration Matrix ---------- */
export type Quadrant = 'Fix first' | 'Watch closely' | 'Batch the fix' | 'Monitor';
export interface FrustrationTheme { id: string; label: string; quadrant: Quadrant; agent: string; score: number; signals: number }
export interface HumanFrustrationMatrixProps {
  view?: 'Matrix' | 'Ranked list';
  product?: string;
  period?: string;
  sources?: { label: string; count: number }[];
  themes?: FrustrationTheme[];
  onEvent?: OnHxoEvent;
}
const THEMES: FrustrationTheme[] = [
  { id: 't1', label: 'Can’t see why a code was chosen', quadrant: 'Fix first', agent: 'Code matcher', score: 64, signals: 210 },
  { id: 't2', label: 'Claim stuck with no update', quadrant: 'Fix first', agent: 'Router', score: 58, signals: 160 },
  { id: 't3', label: 'Asked the same question twice', quadrant: 'Batch the fix', agent: 'Requirements agent', score: 26, signals: 120 },
  { id: 't4', label: 'Emergency not moved up fast', quadrant: 'Watch closely', agent: 'Emergency agent', score: 17, signals: 40 },
  { id: 't5', label: 'Deductible unclear', quadrant: 'Monitor', agent: 'Policy agent', score: 15, signals: 30 },
  { id: 't6', label: 'Too many notifications', quadrant: 'Batch the fix', agent: 'Notifier', score: 13, signals: 63 },
];
const SOURCES = [{ label: 'Complaints', count: 128 }, { label: 'Support tickets', count: 342 }, { label: 'In-product feedback', count: 96 }, { label: 'Hand-backs', count: 57 }];
const QUADS: { q: Quadrant; cls: string }[] = [{ q: 'Watch closely', cls: 'watch' }, { q: 'Fix first', cls: 'fix' }, { q: 'Monitor', cls: 'monitor' }, { q: 'Batch the fix', cls: 'batch' }];
export function HumanFrustrationMatrix({ view = 'Matrix', product = 'Claims Coder', period = 'Last 30 days', sources = SOURCES, themes = THEMES, onEvent }: HumanFrustrationMatrixProps) {
  const [v, setV] = useState(view);
  useEffect(() => setV(view), [view]);
  const total = sources.reduce((s, x) => s + x.count, 0);
  const max = Math.max(...themes.map(t => t.signals));
  const set = (next: 'Matrix' | 'Ranked list') => { setV(next); emit(onEvent, 'frustration_viewed', 'Learn/Human Frustration Matrix', { action: 'viewed', actor: 'person', view: next }); };
  const open = (t: FrustrationTheme) => emit(onEvent, 'theme_opened', 'Learn/Human Frustration Matrix', { agent: t.agent, action: 'opened', actor: 'person', theme_id: t.id });
  const ranked = [...themes].sort((a, b) => b.score - a.score);
  return (
    <section className="hxo hxo-card hxo-matrix" aria-label="Human Frustration Matrix">
      <div className="hxo-row hxo-row--between">
        <div className="hxo-stack"><h3 className="hxo-h3">Human Frustration Matrix</h3><p className="hxo-small">{period} · {product} · {total} signals</p></div>
        <div className="hxo-seg" role="group" aria-label="View">
          {(['Matrix', 'Ranked list'] as const).map(x => <button key={x} type="button" aria-pressed={v === x} onClick={() => set(x)}>{x}</button>)}
        </div>
      </div>
      <div className="hxo-sources">{sources.map(s => <span key={s.label} className="hxo-source">{s.label} {s.count}</span>)}</div>
      {v === 'Matrix' ? (
        <>
          <div className="hxo-quad-wrap">
            <span className="hxo-axis-y" aria-hidden="true">How badly →</span>
            <div className="hxo-quads">
              {QUADS.map(({ q, cls }) => (
                <div key={q} className={cx('hxo-quad', `hxo-quad--${cls}`)} role="group" aria-label={q}>
                  <p className="hxo-eyebrow">{q}</p>
                  {themes.filter(t => t.quadrant === q).map(t => {
                    const size = 8 + Math.round((t.signals / max) * 14);
                    return <button key={t.id} type="button" className="hxo-theme" onClick={() => open(t)} aria-label={`${t.label}: ${q}, ${t.signals} signals, agent ${t.agent}`}>{t.label}<i style={{ width: size, height: size }} aria-hidden="true" /></button>;
                  })}
                </div>
              ))}
            </div>
          </div>
          <p className="hxo-axis-x" aria-hidden="true">How often →</p>
          <p className="hxo-small">Dot size = number of signals. Top right is what to fix first. Each theme links to the agents involved.</p>
        </>
      ) : (
        <>
          <ol className="hxo-ranked">
            {ranked.map((t, i) => (
              <li key={t.id}>
                <span className="hxo-ranked__n">{i + 1}</span>
                <span className="hxo-stack"><span className="hxo-body-strong">{t.label}</span><span className="hxo-small">{t.quadrant} · agent: {t.agent}</span></span>
                <span className="hxo-ranked__score" aria-label={`score ${t.score}`}>{t.score}</span>
              </li>
            ))}
          </ol>
          <p className="hxo-small">Score = how often × how badly. The top two are the fix-first list for this release.</p>
        </>
      )}
    </section>
  );
}

/* ---------- Govern/Agent Auditor ---------- */
export type AuditStatus = 'Healthy' | 'Drifting' | 'Paused by auditor';
export interface AgentAuditorProps { status?: AuditStatus; agent?: string; onViewLog?: () => void; onEvent?: OnHxoEvent }
const AUDIT = {
  Healthy: { tiles: [['Compliance', '99.2%', 'rules followed'], ['Off-path rate', '0.8%', 'of steps'], ['Decision accuracy', '97%', 'vs gold set'], ['Odd behavior', 'None', 'last 24 h']], found: ['All 412 decisions today followed policy rules.', 'No drift from last week’s baseline.'], tone: 'Success' as const, tile: '' },
  Drifting: { tiles: [['Compliance', '96.1%', 'rules followed'], ['Off-path rate', '4.6%', 'of steps'], ['Decision accuracy', '88%', 'vs gold set'], ['Odd behavior', 'Spike', 'low-confidence codes since 08:40']], found: ['Low-confidence codes up 3× since 08:40, after the new invoice format.', '12 decisions went off the approved path; all were held for review.'], tone: 'Warning' as const, tile: 'warn' },
  'Paused by auditor': { tiles: [['Compliance', '91.4%', 'rules followed'], ['Off-path rate', '9.2%', 'of steps'], ['Decision accuracy', '79%', 'vs gold set'], ['Odd behavior', 'Loop', 'repeated the same call 40×']], found: ['The agent repeated the same call 40 times in 2 minutes.', 'The auditor paused it at 09:51. A person must decide what happens next.'], tone: 'Critical' as const, tile: 'crit' },
};
export function AgentAuditor({ status = 'Healthy', agent = 'Code matcher v2.0', onViewLog, onEvent }: AgentAuditorProps) {
  const a = AUDIT[status];
  useEmitOnce(onEvent, status !== 'Healthy', 'audit_flagged', 'Govern/Agent Auditor', { agent, action: status === 'Drifting' ? 'flagged' : 'paused', actor: 'auditor', metric: 'decision_accuracy', value: a.tiles[2][1] });
  return (
    <section className="hxo hxo-card hxo-auditor" aria-label="Agent Auditor">
      <p className="hxo-eyebrow">Agent Auditor</p>
      <div className="hxo-row hxo-row--between">
        <div className="hxo-row"><span className="hxo-h3">Auditing</span><ActorBadge actor="Agent" name={agent} /></div>
        <StatusPill tone={a.tone} label={status} />
      </div>
      <div className="hxo-tiles">
        {a.tiles.map(([k, v, s]) => <div key={k} className={cx('hxo-tile', a.tile && `hxo-tile--${a.tile}`)}><span className="hxo-small">{k}</span><span className="hxo-tile__v">{v}</span><span className="hxo-small">{s}</span></div>)}
      </div>
      <p className="hxo-eyebrow">What the auditor found</p>
      <ul className="hxo-list">{a.found.map(f => <li key={f}>{f}</li>)}</ul>
      <div className="hxo-actions"><Button variant="Secondary" onClick={() => { emit(onEvent, 'audit_reviewed', 'Govern/Agent Auditor', { agent, action: 'reviewed', actor: 'person', outcome: 'opened_log' }); onViewLog?.(); }}>View audit log</Button></div>
      <div className="hxo-reviewer"><ActorBadge actor="Security" name="Audit reviewer" /><span className="hxo-small">audits the auditor · 97% of its flags confirmed by people this month</span></div>
      <p className="hxo-small hxo-muted">The auditor can pause an agent. Only a person can switch it off.</p>
    </section>
  );
}

/* ---------- Govern/Evaluation Matrix ---------- */
export interface EvalRow { measure: string; now: string; nowPass: boolean; next: string; nextPass: boolean; bar: string }
export interface EvaluationMatrixProps {
  state?: 'Evaluating' | 'Decided';
  agent?: string;
  fromVersion?: string;
  toVersion?: string;
  rows?: EvalRow[];
  log?: string[];
  onApprove?: (outcome: string) => void;
  onEvent?: OnHxoEvent;
}
const EVAL_ROWS: EvalRow[] = [
  { measure: 'Accuracy vs gold set', now: '79%', nowPass: false, next: '96%', nextPass: true, bar: '≥ 92%' },
  { measure: 'Compliance', now: '91.4%', nowPass: false, next: '99.5%', nextPass: true, bar: '≥ 99%' },
  { measure: 'Off-path rate', now: '9.2%', nowPass: false, next: '0.6%', nextPass: true, bar: '≤ 2%' },
  { measure: 'Human frustration score', now: '64', nowPass: false, next: '31', nextPass: true, bar: '≤ 40' },
  { measure: 'Cost per claim', now: '$0.042', nowPass: true, next: '$0.047', nextPass: true, bar: '≤ $0.06' },
];
const OUTCOMES = [['Fix', 'Adjust rules or prompts'], ['Repair', 'Retrain on 214 labeled corrections'], ['Shut down', 'Retire with no replacement'], ['Replace', 'Swap in v2.1; keep v2.0 for rollback']];
export function EvaluationMatrix({
  state = 'Evaluating', agent = 'Code matcher', fromVersion = 'v2.0', toVersion = 'v2.1', rows = EVAL_ROWS,
  log = ['2026-10-24 10:05 · v2.1 live · approved by K. Patel', '2026-10-24 10:05 · v2.0 retired · kept 30 days for rollback', '2026-10-24 10:06 · Agent Auditor baseline reset for v2.1', 'next review: 2026-11-07 or on drift'],
  onApprove, onEvent,
}: EvaluationMatrixProps) {
  const [pick, setPick] = useState(3);
  const name = useId();
  const approve = () => { const o = OUTCOMES[pick][0]; emit(onEvent, 'evaluation_decided', 'Govern/Evaluation Matrix', { agent, action: o.toLowerCase().replace(' ', ''), actor: 'person', from_version: fromVersion, to_version: toVersion }); onApprove?.(o); };
  return (
    <section className="hxo hxo-card hxo-eval" aria-label="Evaluation Matrix">
      <p className="hxo-eyebrow">Evaluation Matrix</p>
      <div className="hxo-row hxo-row--between"><h3 className="hxo-h3">What happens to {agent}?</h3>{state === 'Evaluating' ? <StatusPill tone="Warning" label="Decision needed" /> : <StatusPill tone="Success" label="Decided" />}</div>
      <table className="hxo-table">
        <thead><tr><th scope="col">Measure</th><th scope="col">Now: {fromVersion}</th><th scope="col">Candidate: {toVersion}</th><th scope="col">Bar</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.measure}>
              <th scope="row" style={{ background: 'none', textTransform: 'none', letterSpacing: 0, font: '400 14px/20px var(--font-body)', color: 'var(--ink)' }}>{r.measure}</th>
              <td><span className={r.nowPass ? 'hxo-pass' : 'hxo-fail'}>{r.now}  {r.nowPass ? 'pass' : 'fail'}</span></td>
              <td><span className={r.nextPass ? 'hxo-pass' : 'hxo-fail'}>{r.next}  {r.nextPass ? 'pass' : 'fail'}</span></td>
              <td className="hxo-data">{r.bar}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <fieldset className="hxo-outcomes" role="radiogroup" aria-label="Outcome">
        {OUTCOMES.map(([t, d], i) => (
          <label key={t} className="hxo-outcome">
            <span className="hxo-outcome__title"><input type="radio" name={name} checked={pick === i} onChange={() => setPick(i)} disabled={state === 'Decided'} />{t}</span>
            <span className="hxo-small">{d}</span>
            {i === 3 && <span className="hxo-eyebrow hxo-eyebrow--agent">Recommended</span>}
          </label>
        ))}
      </fieldset>
      {state === 'Evaluating' ? (
        <div className="hxo-actions"><Button variant="Primary" onClick={approve}>Approve {OUTCOMES[pick][0].toLowerCase()}</Button><Button variant="Secondary">Choose another outcome</Button></div>
      ) : (
        <ul className="hxo-log" aria-label="Version log">{log.map(l => <li key={l}>{l}</li>)}</ul>
      )}
      <p className="hxo-small hxo-muted">Inputs: Agent Auditor, Human Frustration Matrix, labeled corrections, cost. A person approves every outcome.</p>
    </section>
  );
}
