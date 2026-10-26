import { useEffect, useId, useMemo, useState } from 'react';
import { cx } from '../hooks';
import { clock, mmss, scoreRun, scoreScenario, scenarioSummary, type Measure, type RunScenario, type RunScore, type RunTiming, type Verdict } from '../run';
import { emit, type HxoEvent, type OnHxoEvent } from '../telemetry';
import { ActorBadge, Button, StatusPill, type Tone } from './supporting';

/* ---------- Govern/Run scorecard (human-in-the-loop audit review) ---------- */

export interface RunScorecardProps {
  /** Which seeded test run to show. Ignored when `score` or `events` is given. */
  run?: RunScenario;
  view?: 'Card' | 'Report';
  review?: 'Awaiting sign-off' | 'Signed off';
  /** Score a real run: pass its telemetry events, or a score already computed with scoreRun(). */
  events?: HxoEvent[];
  score?: RunScore;
  team?: string;
  summary?: string;
  reviewer?: string;
  signedAt?: string;
  onSignOff?: (r: { verdict: Verdict; decision: 'signed_off' | 'blocked'; note: string }) => void;
  onSendToEvaluation?: (agent: string) => void;
  onRerun?: () => void;
  onEvent?: OnHxoEvent;
}

const VERDICT_TONE: Record<Verdict, Tone> = { Successful: 'Success', 'Successful with interventions': 'Warning', 'Not successful': 'Critical' };

function ScoreMeter({ label, sub, value, kind }: { label: string; sub: string; value: number; kind: 'agents' | 'person' }) {
  return (
    <div className={cx('hxo-score', `hxo-score--${kind}`)}>
      <p className="hxo-eyebrow">{label}</p>
      <p className="hxo-score__v"><span>{value}</span><span className="hxo-small"> / 100</span></p>
      <div className="hxo-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={`${label}: ${value} out of 100`}><i style={{ width: `${value}%` }} /></div>
      <p className="hxo-small">{sub}</p>
    </div>
  );
}

const fmt = (m: Measure) => (m.pct === null ? 'Not tested' : `${m.pct}%`);
const passWord = (m: Measure) => (m.pass === null ? <span className="hxo-small hxo-muted">no data</span> : m.pass ? <span className="hxo-pass">meets target</span> : <span className="hxo-fail">below target</span>);

function MeasureRows({ items, detailed }: { items: Measure[]; detailed?: boolean }) {
  return (
    <ul className="hxo-measures">
      {items.map(m => (
        <li key={m.key}>
          <span className="hxo-measures__head">
            <span className="hxo-label">{m.label}</span>
            <span className="hxo-data-m">{fmt(m)}</span>
          </span>
          <span className="hxo-bar" aria-hidden="true"><i style={{ width: `${m.pct ?? 0}%` }} /></span>
          <span className="hxo-measures__foot">{passWord(m)}<span className="hxo-small hxo-muted">target {m.target} · weight {m.weight}</span></span>
          {detailed && <span className="hxo-small">{m.detail}</span>}
        </li>
      ))}
    </ul>
  );
}

function Outcomes({ s }: { s: RunScore }) {
  const parts = [
    { k: 'correct', label: 'Right, no human fix', n: s.outcomes.correct, cls: 'good' },
    { k: 'corrected', label: 'Right after a person fixed it', n: s.outcomes.corrected, cls: 'warn' },
    { k: 'wrong', label: 'Would have gone out wrong', n: s.outcomes.wrong, cls: 'crit' },
    { k: 'open', label: 'Still open', n: s.outcomes.open, cls: 'open' },
  ].filter(p => p.n > 0);
  return (
    <div className="hxo-stack" style={{ gap: 'var(--space-sm)' }}>
      <div className="hxo-stackbar" role="img" aria-label={parts.map(p => `${p.label}: ${p.n}`).join(', ')}>
        {parts.map(p => <i key={p.k} className={`hxo-stackbar--${p.cls}`} style={{ flexGrow: p.n }} title={`${p.label}: ${p.n} of ${s.claims}`} />)}
      </div>
      <ul className="hxo-legend">
        {parts.map(p => <li key={p.k}><i className={`hxo-stackbar--${p.cls}`} aria-hidden="true" />{p.label} <strong>{p.n}</strong></li>)}
      </ul>
    </div>
  );
}

function Timeline({ s }: { s: RunScore }) {
  const W = 1040, lane = 26, left = 150, top = 8;
  const end = Math.max(60, s.durationSecs);
  const x = (t: number) => left + (t / end) * (W - left - 8);
  const ticks = Array.from({ length: Math.floor(end / 300) + 1 }, (_, i) => i * 300);
  const H = top + s.timeline.length * lane + 24;
  const fill = (o: string) => (o === 'retry' ? 'var(--warn)' : o === 'held' ? 'var(--brand)' : 'var(--ai)');
  return (
    <figure className="hxo-timeline" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Run timeline, ${s.started} to ${s.ended}. Each lane is an agent; marks are steps.${s.pauses.map(p => ` ${p.agent} paused ${clock(p.from)} to ${p.to !== null ? clock(p.to) : 'end'}.`).join('')}`}>
        {ticks.map(t => <g key={t}><line x1={x(t)} x2={x(t)} y1={top} y2={H - 20} stroke="var(--line)" strokeWidth={1} /><text x={x(t)} y={H - 6} textAnchor="middle" fill="var(--ink-3)" style={{ font: '400 11px var(--font-data)' }}>{clock(t)}</text></g>)}
        {s.timeline.map((row, i) => {
          const y = top + i * lane;
          const p = s.pauses.find(q => q.agent === row.agent);
          return (
            <g key={row.agent}>
              <text x={0} y={y + 16} fill="var(--ink-2)" style={{ font: '500 12px var(--font-body)' }}>{row.agent}</text>
              {p && <g><rect x={x(p.from)} y={y + 2} width={Math.max(2, x(p.to ?? end) - x(p.from))} height={lane - 6} rx={3} fill="url(#hxo-hatch)" stroke="var(--warn-line)" strokeWidth={1}><title>{`Paused by ${p.by} ${clock(p.from)}–${p.to !== null ? clock(p.to) : 'end'}`}</title></rect></g>}
              {row.spans.map((sp, j) => (
                <rect key={j} x={x(sp.from)} y={y + 6} width={Math.max(2, x(sp.to) - x(sp.from) - 1)} height={lane - 14} rx={2} fill={fill(sp.outcome)}>
                  <title>{`${row.agent} · claim ${sp.claim} · ${sp.outcome === 'ok' ? 'done' : sp.outcome === 'held' ? 'handed back to a person' : 'retried'} · ${clock(sp.from)}`}</title>
                </rect>
              ))}
            </g>
          );
        })}
        <defs><pattern id="hxo-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--warn-soft)" /><line x1="0" y1="0" x2="0" y2="6" stroke="var(--warn-line)" strokeWidth="1.5" /></pattern></defs>
      </svg>
      <figcaption>
        <ul className="hxo-legend">
          <li><i style={{ background: 'var(--ai)' }} aria-hidden="true" />Step done by an agent</li>
          <li><i style={{ background: 'var(--brand)' }} aria-hidden="true" />Handed back to a person</li>
          <li><i style={{ background: 'var(--warn)' }} aria-hidden="true" />Retried</li>
          {s.pauses.length > 0 && <li><i className="hxo-legend__hatch" aria-hidden="true" />Paused by a person</li>}
        </ul>
      </figcaption>
    </figure>
  );
}

export function RunScorecard({
  run = 'Paused mid-run', view = 'Card', review = 'Awaiting sign-off', events, score, team = 'Claims Coder agent team',
  summary, reviewer = 'K. Patel', signedAt, onSignOff, onSendToEvaluation, onRerun, onEvent,
}: RunScorecardProps) {
  const s = useMemo(() => score ?? (events ? scoreRun(events) : scoreScenario(run)), [score, events, run]);
  const [rv, setRv] = useState(review);
  const [decision, setDecision] = useState<'signed_off' | 'blocked'>(s.verdict === 'Not successful' ? 'blocked' : 'signed_off');
  useEffect(() => setRv(review), [review]);
  const noteId = useId();
  const [note, setNote] = useState(
    s.verdict === 'Successful' ? 'Ship as is. Keep the Auditor baseline.'
      : s.verdict === 'Successful with interventions' ? `Ship after ${s.agents[s.agents.length - 1].agent} passes the Evaluation Matrix.`
        : `Do not ship. Send ${s.agents[s.agents.length - 1].agent} to the Evaluation Matrix and rerun.`,
  );
  const weakest = [...s.agents].sort((a, b) => a.successPct - b.successPct)[0];
  const tone = VERDICT_TONE[s.verdict];
  const desc = summary ?? (events || score ? `${s.claims} claims · ${s.started}–${s.ended}` : scenarioSummary(run));
  const sign = (d: 'signed_off' | 'blocked') => {
    setDecision(d); setRv('Signed off');
    emit(onEvent, 'run_reviewed', 'Govern/Run scorecard', { agent: 'all', action: d, actor: 'person', verdict: s.verdict, internal: s.internal, hxo: s.hxo, by: reviewer });
    onSignOff?.({ verdict: s.verdict, decision: d, note });
  };
  const send = () => {
    emit(onEvent, 'run_reviewed', 'Govern/Run scorecard', { agent: weakest.agent, action: 'sent_to_evaluation', actor: 'person', by: reviewer });
    onSendToEvaluation?.(weakest.agent);
  };
  const report = view === 'Report';
  const top = report ? s.challenges : s.challenges.slice(0, 3);
  const wins = report ? s.wins : s.wins.slice(0, 2);
  const pw = s.personWork;
  const when = signedAt ?? clock(s.durationSecs + 300);

  return (
    <section className={cx('hxo', 'hxo-card', 'hxo-runscore', report && 'hxo-runscore--report', s.verdict === 'Not successful' && 'hxo-card--crit')} aria-label="Run scorecard">
      <div className="hxo-row hxo-row--between">
        <p className="hxo-eyebrow">Run scorecard · Human-in-the-loop audit review</p>
        <StatusPill tone="Neutral" label="Simulated test run" />
      </div>
      <div className="hxo-row hxo-row--between" style={{ alignItems: 'flex-start' }}>
        <div className="hxo-stack">
          <h3 className={report ? 'hxo-h2' : 'hxo-h3'}>{team}</h3>
          <p className="hxo-small">{desc}</p>
        </div>
        <StatusPill tone={tone} label={s.verdict} />
      </div>

      <div className="hxo-runscore__scores">
        <ScoreMeter kind="agents" label="Internal: how the agents worked together" value={s.internal} sub={`${s.agents.length} agents · ${s.timeline.reduce((k, r) => k + r.spans.length, 0)} steps`} />
        <ScoreMeter kind="person" label="External: HXO experience for the person" value={s.hxo} sub={`${s.outcomes.correct + s.outcomes.corrected} of ${s.claims} resolved right · ${reviewer} worked about ${pw.minutes} min`} />
      </div>

      <div className={cx('hxo-verdict', `hxo-verdict--${tone.toLowerCase()}`)}>
        <p className="hxo-eyebrow">Was it successful?</p>
        <p className="hxo-body-strong">{s.verdict}.</p>
        <p className="hxo-small">{s.verdictLine}</p>
      </div>

      {report && (
        <div className="hxo-runscore__grid">
          <div className="hxo-stack" style={{ gap: 'var(--space-md)' }}>
            <p className="hxo-eyebrow hxo-eyebrow--agent">Internal measures</p>
            <MeasureRows items={s.internalMeasures} detailed />
          </div>
          <div className="hxo-stack" style={{ gap: 'var(--space-md)' }}>
            <p className="hxo-eyebrow" style={{ color: 'var(--brand-ink)' }}>HXO experience measures</p>
            <MeasureRows items={s.hxoMeasures} detailed />
          </div>
        </div>
      )}
      {!report && (
        <div className="hxo-runscore__grid">
          <MeasureRows items={s.internalMeasures} />
          <MeasureRows items={s.hxoMeasures} />
        </div>
      )}

      <p className="hxo-eyebrow">Agents ranked by steps right the first time</p>
      {report ? (
        <table className="hxo-table hxo-ranktable">
          <thead><tr><th scope="col">Rank</th><th scope="col">Agent</th><th scope="col">Right first time</th><th scope="col">Steps</th><th scope="col">Retries</th><th scope="col">Hand-backs</th><th scope="col">Mistakes</th><th scope="col">Hand-off strands</th><th scope="col">Busy</th></tr></thead>
          <tbody>
            {s.agents.map(a => (
              <tr key={a.agent}>
                <td className="hxo-data-m">{a.rank}</td>
                <th scope="row"><span className="hxo-stack"><ActorBadge actor="Agent" name={a.agent} /><span className="hxo-small">{a.role}</span></span></th>
                <td><span className="hxo-rankbar"><span className="hxo-bar" aria-hidden="true"><i style={{ width: `${a.successPct}%` }} /></span><span className="hxo-data-m">{a.successPct}%</span></span></td>
                <td className="hxo-data-m">{a.steps}</td>
                <td className="hxo-data-m">{a.retries}</td>
                <td className="hxo-data-m">{a.held}</td>
                <td className="hxo-data-m">{a.mistakes}{a.mistakes ? <span className="hxo-small"> · {a.caughtByAgents} by Validate</span> : null}</td>
                <td className="hxo-data-m">{a.handoffPct === null ? 'last step' : `${a.handoffPct}%`}</td>
                <td className="hxo-data-m">{Math.round(a.busySecs / 60)} min</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ol className="hxo-rank">
          {s.agents.map(a => (
            <li key={a.agent}>
              <span className="hxo-data-m hxo-rank__n">{a.rank}</span>
              <span className="hxo-rank__name">{a.agent}</span>
              <span className="hxo-bar" aria-hidden="true"><i style={{ width: `${a.successPct}%` }} /></span>
              <span className="hxo-data-m">{a.successPct}%</span>
            </li>
          ))}
        </ol>
      )}

      {report && (
        <div className="hxo-runscore__grid">
          <div className="hxo-stack" style={{ gap: 'var(--space-sm)' }}><p className="hxo-eyebrow">Claim outcomes</p><Outcomes s={s} /></div>
          <div className="hxo-stack" style={{ gap: 'var(--space-sm)' }}>
            <p className="hxo-eyebrow">What the person did</p>
            <p className="hxo-small">{reviewer}: {pw.handbacks} hand-backs answered · {pw.corrections} agent mistakes fixed · {pw.reasks} repeat question{pw.reasks === 1 ? '' : 's'} · {pw.pauses} pause{pw.pauses === 1 ? '' : 's'} · about {pw.minutes} minutes in all. Hand-backs below an agent’s confidence bar are expected work; fixes and repeat questions are avoidable work.</p>
          </div>
        </div>
      )}
      {report && <><p className="hxo-eyebrow">Run timeline</p><Timeline s={s} /></>}

      <div className="hxo-runscore__grid">
        <div className="hxo-stack" style={{ gap: 'var(--space-sm)' }}>
          <p className="hxo-eyebrow hxo-eyebrow--warn">What was hard</p>
          {top.length ? <ul className="hxo-findings">{top.map(c => <li key={c.text}><StatusPill tone={c.tone} label={c.tone === 'Critical' ? 'Critical' : 'Watch'} /><span className="hxo-small" style={{ color: 'var(--ink)' }}>{c.text}</span></li>)}</ul> : <p className="hxo-small">Nothing above the warning bar.</p>}
        </div>
        <div className="hxo-stack" style={{ gap: 'var(--space-sm)' }}>
          <p className="hxo-eyebrow" style={{ color: 'var(--good-ink)' }}>What went well</p>
          <ul className="hxo-findings">{wins.map(c => <li key={c.text}><StatusPill tone="Success" label="Held up" /><span className="hxo-small" style={{ color: 'var(--ink)' }}>{c.text}</span></li>)}</ul>
        </div>
      </div>

      <div className="hxo-signoff">
        <div className="hxo-row hxo-row--between">
          <div className="hxo-row"><ActorBadge actor="Human" name={reviewer} /><span className="hxo-small">reviews the run before the team ships</span></div>
          {rv === 'Signed off' && <StatusPill tone={decision === 'blocked' ? 'Critical' : 'Success'} label={`${decision === 'blocked' ? 'Blocked' : 'Signed off'} by ${reviewer} · ${when}`} />}
        </div>
        {rv === 'Awaiting sign-off' ? (
          <>
            <label htmlFor={noteId} className="hxo-label">Review note (logged with the decision)</label>
            <input id={noteId} className="hxo-field" value={note} onChange={e => setNote(e.target.value)} />
            <div className="hxo-actions">
              {s.verdict === 'Not successful'
                ? <Button variant="Destructive" onClick={() => sign('blocked')}>Block release and log</Button>
                : <Button variant="Primary" onClick={() => sign('signed_off')}>{s.verdict === 'Successful' ? 'Sign off run' : 'Sign off with notes'}</Button>}
              <Button variant="Secondary" onClick={send}>Send {weakest.agent} to the Evaluation Matrix</Button>
              {onRerun && <Button variant="Ghost" onClick={onRerun}>Run the test again</Button>}
            </div>
          </>
        ) : (
          <ul className="hxo-log" aria-label="Review log">
            <li>{`${when} · run ${decision === 'blocked' ? 'blocked' : 'signed off'} by ${reviewer} · ${s.verdict.toLowerCase()} · internal ${s.internal} · HXO ${s.hxo}`}</li>
            <li>{`${when} · note: ${note}`}</li>
            <li>{`${when} · ${weakest.agent} queued for the Evaluation Matrix (${weakest.successPct}% right first time)`}</li>
            <li>{`${when} · Agent Auditor baseline set from this run`}</li>
          </ul>
        )}
      </div>
      <p className="hxo-small hxo-muted">Scored only from the run’s telemetry events. Internal is how the agents worked together; HXO experience is what the person waiting on a result lived through. A person signs off every run; the scorecard never ships a team by itself.</p>
    </section>
  );
}

/* ---------- Govern/Task timers ---------- */

export interface TaskTimersProps {
  current: RunTiming;
  /** An earlier run to compare with, e.g. the same claims done by another agent version. While a run is live, pass the earlier run as it stood at the same clock time. */
  previous?: RunTiming;
  live?: boolean;
  /** Agent a person has paused right now. */
  pausedAgent?: string;
}

function pace(cur: number | null, prev: number | null, words: [string, string] = ['Faster', 'Slower']): { tone: Tone; label: string } | null {
  if (cur === null || prev === null || prev === 0) return null;
  const d = Math.round(((cur - prev) / prev) * 100);
  if (d <= -5) return { tone: 'Success', label: `${words[0]} · ${Math.abs(d)}%` };
  if (d >= 5) return { tone: 'Warning', label: `${words[1]} · ${d}%` };
  return { tone: 'Neutral', label: 'Same pace' };
}

function Compare({ now, before, pace: p }: { now: string; before?: string; pace: { tone: Tone; label: string } | null }) {
  return (
    <span className="hxo-compare">
      <span className="hxo-data-m">{now}</span>
      {before !== undefined && <span className="hxo-small hxo-muted">before {before}</span>}
      {p && <StatusPill tone={p.tone} label={p.label} />}
    </span>
  );
}

/** One timer per task (each agent's job), compared with a finished earlier run. Times are simulated seconds, so playback speed does not change them. */
export function TaskTimers({ current, previous, live, pausedAgent }: TaskTimersProps) {
  const runPace = previous && !live ? pace(current.durationSecs, previous.durationSecs) : null;
  return (
    <section className="hxo hxo-card hxo-timers" aria-label="Task timers">
      <div className="hxo-row hxo-row--between" style={{ alignItems: 'flex-start' }}>
        <div className="hxo-stack">
          <p className="hxo-eyebrow">Task timers</p>
          <h3 className="hxo-h3">{current.label} · Code matcher {current.codeMatcher}</h3>
          <p className="hxo-small">
            Run time <span className="hxo-data-m" role="timer" aria-live="off">{mmss(current.durationSecs)}</span> · {current.resolved} of {current.claims} claims resolved
            {previous ? <> · compared with {previous.label} (Code matcher {previous.codeMatcher}, finished in {mmss(previous.durationSecs)}){live ? ', at the same point in its run' : ''}</> : ' · no earlier run to compare yet'}
          </p>
        </div>
        {runPace && <StatusPill tone={runPace.tone} label={`Whole run: ${runPace.label}`} />}
      </div>
      <table className="hxo-table hxo-ranktable">
        <thead>
          <tr><th scope="col">Task</th><th scope="col">Status</th><th scope="col">Timer</th><th scope="col">Steps</th><th scope="col">Agent time per step</th><th scope="col">Person time on this task</th></tr>
        </thead>
        <tbody>
          {current.tasks.map(t => {
            const prev = previous?.tasks.find(p => p.agent === t.agent);
            const p = pace(t.avgSecs, prev?.avgSecs ?? null);
            const isPaused = pausedAgent === t.agent;
            return (
              <tr key={t.agent}>
                <th scope="row"><span className="hxo-stack"><ActorBadge actor="Agent" name={t.agent === 'Code matcher' ? `Code matcher ${current.codeMatcher}` : t.agent} /><span className="hxo-small">{t.role}</span></span></th>
                <td>{isPaused ? <StatusPill tone="Warning" label="Paused" /> : t.working ? <StatusPill tone="Agent" label="Working" /> : t.steps === current.claims ? <StatusPill tone="Success" label="Done" /> : <StatusPill tone="Neutral" label={t.steps ? 'Waiting' : 'Not started'} />}</td>
                <td className="hxo-data-m">{mmss(t.busySecs)}</td>
                <td className="hxo-data-m">{t.steps}</td>
                <td><Compare now={t.avgSecs === null ? '—' : `${t.avgSecs} s`} before={prev ? (prev.avgSecs === null ? '—' : `${prev.avgSecs} s`) : undefined} pace={p} /></td>
                <td><Compare now={t.personSecs ? mmss(t.personSecs) : '0:00'} before={prev ? mmss(prev.personSecs) : undefined} pace={pace(t.personSecs, prev?.personSecs ?? null, ['Less', 'More'])} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="hxo-small hxo-muted">Timers count simulated agent time, so Slow, Medium and Fast playback never change the result. Agent time per step is the fair speed comparison across runs; ±5% counts as the same pace. Person time is what a person spent answering hand-backs and fixing mistakes for that task, so less is better.{previous && (previous.internal !== undefined) ? ` Earlier run scored internal ${previous.internal}, HXO ${previous.hxo}.` : ''}</p>
    </section>
  );
}
