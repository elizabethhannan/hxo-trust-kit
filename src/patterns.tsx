import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  AgentDisagreementBanner, AgentTraceRow, ApprovalCard, Button, EscalationBanner, EvidenceLink, HandBackCard, PauseOneAgent,
  PreviewThenApply, RunScorecard, StatusPill, StopControl, TaskTimers, UndoBar,
} from './index';
import { clock, scoreRun, simulateRun, timeRun, type CodeMatcherVersion, type Pause, type RunTiming } from './run';
import type { HxoEvent, OnHxoEvent } from './telemetry';

const col = (w: number, gap = 16): CSSProperties => ({ width: w, display: 'flex', flexDirection: 'column', gap, flex: 'none' });
const label: CSSProperties = { font: '700 12px/16px var(--font-body)', color: 'var(--ink-3)', margin: 0 };

/** Pattern: Claims Coder review (Figma Patterns page, frame 16:62). Composed only from kit components. */
export function ClaimsCoderReview({ onEvent }: { onEvent?: OnHxoEvent }) {
  const claim = (id: string, who: string, what: string, tone: string, active = false) => (
    <div key={id} style={{ background: active ? 'var(--ai-soft)' : 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ font: '600 15px/20px var(--font-body)' }}>Claim {id}</span>
      <span style={{ font: '700 12px/16px var(--font-body)', color: tone }}>{who}</span>
      <span style={{ font: '400 13px/18px var(--font-body)', color: 'var(--ink-2)' }}>{what}</span>
    </div>
  );
  return (
    <div className="hxo" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', width: 'max-content' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
          <h1 style={{ font: '600 20px/26px var(--font-display)', margin: 0 }}>Claims Coder</h1>
          <span style={{ font: '400 14px/20px var(--font-body)', color: 'var(--ink-3)' }}>Claim 4821 · pet insurance · synthetic record</span>
        </div>
        <PauseOneAgent onEvent={onEvent} />
      </header>
      <main style={{ display: 'flex', gap: 24, padding: 32, background: 'var(--bg)' }}>
        <nav aria-label="Claims today" style={col(380)}>
          <p style={label}>Claims today</p>
          {claim('4821', 'Needs you · 2 h left', 'Agents disagree on the diagnosis', 'var(--warn-ink)', true)}
          {claim('4822', 'Coding', '3 of 5 findings coded', 'var(--ai-ink)')}
          {claim('4823', 'Submitted', 'Paid to the clinic', 'var(--ink-2)')}
          <StopControl onEvent={onEvent} />
        </nav>
        <section aria-label="Reasoning" style={col(760)}>
          <AgentDisagreementBanner onEvent={onEvent} />
          <p style={label}>Agent trace</p>
          <AgentTraceRow expanded onEvent={onEvent} />
          <p style={label}>Evidence the agents used</p>
          <EvidenceLink onEvent={onEvent} />
        </section>
        <section aria-label="Decisions" style={col(480)}>
          <HandBackCard onEvent={onEvent} />
          <ApprovalCard takeFocus={false} onEvent={onEvent} />
        </section>
      </main>
    </div>
  );
}

/** Pattern: Team-chat hand-back (Figma Patterns page, frame 22:231). A generic team chat; no product branding. */
export function TeamChatHandBack({ onEvent }: { onEvent?: OnHxoEvent }) {
  const msg = (name: string, time: string, agent: boolean, body: string, extra?: ReactNode) => (
    <article style={{ display: 'flex', gap: 12 }} aria-label={`${name}, ${time}`}>
      <span aria-hidden="true" style={{ width: 36, height: 36, flex: 'none', borderRadius: agent ? 10 : 18, display: 'grid', placeItems: 'center', background: agent ? 'var(--ai)' : 'var(--accent-soft)', color: agent ? 'var(--ink-inverse)' : 'var(--accent-ink)', font: '700 13px/1 var(--font-body)' }}>
        {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <strong style={{ font: '700 14px/20px var(--font-body)' }}>{name}</strong>
          {agent && <span className="hxo-pill hxo-pill--agent" style={{ fontSize: 11, padding: '0 8px' }}>Agent</span>}
          <span style={{ font: '400 12px/16px var(--font-body)', color: 'var(--ink-3)' }}>{time}</span>
        </div>
        <p style={{ margin: 0, font: '400 15px/22px var(--font-body)' }}>{body}</p>
        {extra}
      </div>
    </article>
  );
  const side: CSSProperties = { font: '400 14px/20px var(--font-body)', color: 'var(--ink-inverse)', padding: '6px 10px', borderRadius: 8 };
  return (
    <div className="hxo" style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden', width: 'max-content' }}>
      <nav aria-label="Workspace" style={{ width: 240, background: 'var(--inverse)', padding: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ font: '600 18px/24px var(--font-display)', color: 'var(--ink-inverse)' }}>Northwind Studio</span>
        <span style={{ ...side, padding: 0, fontSize: 12, opacity: 0.75 }}>workspace · concept</span>
        <span style={{ ...side, padding: '14px 0 0', font: '700 11px/16px var(--font-body)', opacity: 0.75 }}>CHANNELS</span>
        {['# launch-q4', '# pricing', '# design-crit', '# general'].map((c, i) => <span key={c} aria-current={i === 0 ? 'page' : undefined} style={{ ...side, background: i === 0 ? 'var(--ai)' : 'transparent', fontWeight: i === 0 ? 600 : 400 }}>{c}</span>)}
        <span style={{ ...side, padding: '14px 0 0', font: '700 11px/16px var(--font-body)', opacity: 0.75 }}>AGENTS IN THIS WORKSPACE</span>
        {[['Launch agent', 'waiting for you'], ['Pricing agent', 'working'], ['Notes agent', 'idle'], ['Security agent', 'always on']].map(([a, s]) => (
          <span key={a} style={{ ...side, display: 'flex', flexDirection: 'column' }}><span style={{ fontWeight: 500 }}>{a}</span><span style={{ fontSize: 12, opacity: 0.8 }}>{s}</span></span>
        ))}
      </nav>
      <main style={{ width: 720, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)' }}>
          <h1 style={{ font: '600 18px/24px var(--font-display)', margin: 0 }}># launch-q4</h1>
          <p style={{ margin: 0, font: '400 13px/18px var(--font-body)', color: 'var(--ink-3)' }}>Q4 pricing update: page, release notes, customer email</p>
        </header>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {msg('Maya Chen', '2:58 PM', false, '@Launch agent can you get the Q4 pricing update out today? Page, release notes and the customer email.')}
          {msg('Launch agent', '3:01 PM', true, 'On it. Page and notes are reversible, so I’ll preview each one here before it goes live. The customer email waits for a person.', <>
            <PreviewThenApply takeFocus={false} agent="Launch agent" preview="Posting the release notes to the help center" countdownText="Posts in 0.6 s · Esc to cancel" onEvent={onEvent} />
            <UndoBar title="Release notes posted" detail="Undo stays open until the customer email is sent" agent="Launch agent" onEvent={onEvent} />
          </>)}
          {msg('Launch agent', '3:12 PM', true, 'I’ve paused before the customer email. One decision is yours.',
            <HandBackCard agent="Launch agent" timeLeft="Needs you · 45 min left" title="Annual plans need your call before the email goes out"
              did="Published the pricing page and the release notes. Brand and legal checks passed."
              unsure="Whether annual customers keep the old price until renewal. Two contract templates disagree; confidence 58%, below the 80% bar."
              need="Pick the rule for annual plans, or send it to Finance."
              ifNoOne="At 4:00 the email stays in drafts. Nothing reaches customers without a person."
              options={['Keep old price', 'New price at renewal', 'Ask Finance']} onEvent={onEvent} />)}
        </div>
        <div style={{ padding: '16px 24px', marginTop: 'auto' }}>
          <label style={{ display: 'block' }}>
            <span className="hxo-sr">Message</span>
            <input className="hxo-field" placeholder="Reply to Launch agent, or type “stop” to halt all agents" style={{ background: 'var(--bg)' }} />
          </label>
        </div>
      </main>
      <aside aria-label="Why the agent stopped" style={{ width: 700, background: 'var(--bg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16, borderLeft: '1px solid var(--line)' }}>
        <h2 style={{ font: '600 18px/24px var(--font-display)', margin: 0 }}>Why the agent stopped</h2>
        <p style={{ margin: 0, font: '400 14px/20px var(--font-body)', color: 'var(--ink-2)' }}>The trace shows the message between agents that triggered the hand-back. Anyone in the channel can open it.</p>
        <AgentTraceRow expanded time="15:11:52" from="Pricing agent" to="Launch agent" message="Flagged a conflict in annual terms"
          payload={['from: pricing-agent · to: launch-agent · 22 ms', 'terms: template A keeps price to renewal; template B allows change on 30 days notice', 'ruled out: monthly plans · confidence: 0.58, below 0.80']} onEvent={onEvent} />
        <p style={label}>Controls</p>
        <PauseOneAgent agent="Launch agent" runningLabel="Waiting for you · 1 task held" onEvent={onEvent} />
        <StopControl headline="3 agents working in this workspace" working={3} security={1} onEvent={onEvent} />
      </aside>
    </div>
  );
}


/* ---------------------------------------------------------------- Agent team test run */

/** Playback speed: simulated seconds per real second. Task timers count simulated time, so speed never changes them. */
export const PLAYBACK = { Slow: 60, Medium: 120, Fast: 300 } as const;
export type Playback = keyof typeof PLAYBACK;
const STORE = 'hxo-trust-kit:last-run';
type SavedRun = RunTiming & { n?: number; inputs?: { codeMatcher: CodeMatcherVersion; pauses: Pause[] } };
const loadRun = (): SavedRun | undefined => { try { const v = localStorage.getItem(STORE); return v ? JSON.parse(v) : undefined; } catch { return undefined; } };
const saveRun = (r: SavedRun) => { try { localStorage.setItem(STORE, JSON.stringify(r)); } catch { /* storage unavailable: comparison lasts for this visit only */ } };
const offset = (e: HxoEvent) => Number(e.s_offset ?? 0);
const who = (e: HxoEvent) => (Array.isArray(e.agent) ? e.agent.join(' → ') : e.agent ?? '');

function describe(e: HxoEvent): string | null {
  switch (e.event) {
    case 'run_started': return 'Test run started: 24 synthetic claims, 7 agents.';
    case 'escalation_shown': return `Emergency agent moved claim ${e.claim} to the front and alerted a person.`;
    case 'handback_shown': return `${who(e)} handed claim ${e.claim} back: below its confidence bar.`;
    case 'handback_resolved': return `${e.by} answered ${who(e)} on claim ${e.claim}.`;
    case 'audit_flagged': return e.action === 'flagged' ? `Agent Auditor flagged ${who(e)}: low-confidence codes since the new invoice format.` : `Agent Auditor held claim ${e.claim} for review (${who(e)}).`;
    case 'correction_made': return `${e.by} fixed a ${who(e)} mistake on claim ${e.claim} (caught by ${e.caught_by}).`;
    case 'clarify_asked': return `${who(e)} asked the person again on claim ${e.claim}: ${e.why}.`;
    case 'agent_paused': return e.actor === 'person' ? `${e.by ?? 'You'} ${e.action} ${who(e)}.` : `${who(e)} finished its current step and is idle.`;
    case 'claim_resolved': return e.action === 'wrong' ? `Claim ${e.claim} went out with a mistake.` : e.action === 'corrected' ? `Claim ${e.claim} resolved after a fix.` : null;
    case 'run_completed': return 'All claims resolved. Scoring the run.';
    default: return null;
  }
}

/**
 * Pattern: Agent team test run. A seeded test of the Claims Coder agent team plays back at 120×.
 * The Pause control is live: pausing the Code matcher and resuming it changes the rest of the run
 * (the person adds the new invoice rule while it is paused). When the run ends, the Run scorecard
 * scores it from the events the run emitted, including the person's own pause.
 */
export function AgentTeamTestRun({ onEvent, autoStart = false, speed: initialSpeed = 'Medium', previous: givenPrevious }: { onEvent?: OnHxoEvent; autoStart?: boolean; speed?: Playback; previous?: RunTiming }) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>(autoStart ? 'running' : 'idle');
  const [now, setNow] = useState(0);
  const [pauses, setPauses] = useState<Pause[]>([]);
  const [speed, setSpeed] = useState<Playback>(initialSpeed);
  const [version, setVersion] = useState<CodeMatcherVersion>('v2.0');
  const [previous, setPrevious] = useState<SavedRun | undefined>(() => givenPrevious ?? loadRun());
  const runNo = (previous?.n ?? 0) + 1;
  const nowRef = useRef(0);
  nowRef.current = now;
  const speedRef = useRef<number>(PLAYBACK[initialSpeed]);
  speedRef.current = PLAYBACK[speed];
  const events = useMemo(() => simulateRun('Paused mid-run', { pauses, person: 'You', codeMatcher: version }), [pauses, version]);
  const lastT = events.length ? offset(events[events.length - 1]) : 0;
  const completed = events.some(e => e.event === 'run_completed');
  const visible = events.filter(e => offset(e) <= now);
  const paused = pauses.find(p => p.agent === 'Code matcher' && !isFinite(p.to));

  useEffect(() => {
    if (phase !== 'running') return;
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const next = nowRef.current + ((t - last) / 1000) * speedRef.current;
      last = t;
      setNow(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);
  useEffect(() => { if (phase === 'running' && completed && now >= lastT) setPhase('done'); }, [phase, completed, now, lastT]);

  const togglePause = (isPaused: boolean) => {
    const t = Math.round(nowRef.current);
    setPauses(ps => (isPaused
      ? [...ps, { agent: 'Code matcher', from: t, to: Infinity, by: 'You' }]
      : ps.map(p => (p.agent === 'Code matcher' && !isFinite(p.to) ? { ...p, to: Math.max(t, p.from + 1) } : p))));
  };
  /** Keep this run as the one to compare with, then wait so the person can pick the agent and speed for the next run. */
  const runAgain = () => { if (finished) setPrevious(finished); setPauses([]); setNow(0); setPhase('idle'); };
  const resolved = visible.filter(e => e.event === 'claim_resolved').length;
  const flagged = visible.find(e => e.event === 'audit_flagged' && e.action === 'flagged');
  const feed = visible.map(e => ({ e, text: describe(e) })).filter(x => x.text).slice(-8).reverse();
  const score = useMemo(() => (phase === 'done' ? scoreRun(events) : null), [phase, events]);
  const timing = timeRun(events, phase === 'done' ? Infinity : now, `Run ${runNo}`);
  const finished = useMemo<SavedRun | undefined>(() => (score ? { ...timeRun(events, Infinity, `Run ${runNo}`), internal: score.internal, hxo: score.hxo, savedAt: new Date().toISOString(), n: runNo, inputs: { codeMatcher: version, pauses } } : undefined), [score, events, runNo, version, pauses]);
  // Compare like with like: replay the earlier run (same claims, same draws) to this run's clock.
  const previousEvents = useMemo(() => (previous?.inputs ? simulateRun('Paused mid-run', { pauses: previous.inputs.pauses, person: 'You', codeMatcher: previous.inputs.codeMatcher }) : null), [previous]);
  const previousNow = previous && previousEvents
    ? { ...timeRun(previousEvents, phase === 'done' ? Infinity : now, previous.label), durationSecs: previous.durationSecs, internal: previous.internal, hxo: previous.hxo }
    : previous;
  useEffect(() => { if (finished) saveRun(finished); }, [finished]);
  const seg = <T extends string>(label: string, opts: readonly T[], value: T, set: (v: T) => void, disabled = false, note?: (v: T) => string) => (
    <div className="hxo-row"><span className="hxo-label">{label}</span>
      <div className="hxo-seg" role="group" aria-label={label}>
        {opts.map(o => <button key={o} type="button" aria-pressed={value === o} disabled={disabled} onClick={() => set(o)}>{o}{note ? ` ${note(o)}` : ''}</button>)}
      </div>
    </div>
  );

  return (
    <div className="hxo" style={{ display: 'flex', flexDirection: 'column', gap: 24, width: 1200, maxWidth: '100%' }}>
      <header className="hxo-row hxo-row--between">
        <div className="hxo-stack">
          <h1 className="hxo-h2">Agent team test run</h1>
          <p className="hxo-small">Claims Coder · 7 agents · 24 synthetic claims · a new invoice format arrives at claim 9 · same claims every run, so runs compare fairly · simulated</p>
        </div>
        <div className="hxo-actions">
          <StatusPill tone={phase === 'done' ? 'Success' : phase === 'running' ? 'Agent' : 'Neutral'} label={phase === 'done' ? `Done · ${clock(lastT)}` : phase === 'running' ? `Running · ${clock(now)}` : 'Ready'} />
          {phase === 'idle' && <Button variant="Primary" onClick={() => setPhase('running')}>{previous ? `Start run ${runNo}` : 'Start test run'}</Button>}
          {phase === 'running' && !paused && <Button variant="Secondary" onClick={() => setNow(lastT)}>Skip to the end</Button>}
          {phase === 'done' && <Button variant="Secondary" onClick={runAgain}>Set up the next run to compare</Button>}
        </div>
      </header>
      <div className="hxo-row" style={{ gap: 24 }}>
        {seg('Playback', ['Slow', 'Medium', 'Fast'] as const, speed, setSpeed, false, v => `${PLAYBACK[v]}×`)}
        {seg('Code matcher', ['v2.0', 'v2.1'] as const, version, setVersion, phase === 'running', v => (v === 'v2.0' ? '(current)' : '(candidate)'))}
      </div>
      <TaskTimers current={timing} previous={previousNow} live={phase !== 'done'} pausedAgent={paused && now >= paused.from ? 'Code matcher' : undefined} />
      {phase !== 'done' || !score ? (
        <div className="hxo-live">
          <section className="hxo-stack" style={{ gap: 12 }} aria-label="Agent team">
            <p className="hxo-eyebrow">Human in the loop</p>
            <PauseOneAgent agent="Code matcher" pausedBy="You" state={paused ? 'Paused' : pauses.length ? 'Resumed' : 'Running'} at={paused ? clock(paused.from) : pauses.length ? clock(pauses[pauses.length - 1].to) : undefined} runningLabel={phase === 'running' ? 'Running · new invoice format ahead' : 'Ready'} onToggle={togglePause} onEvent={onEvent} />
            {paused && <p className="hxo-small">While it is paused, you add the new invoice rule. Resume it to let the run finish.</p>}
          </section>
          <section className="hxo-stack" style={{ gap: 12 }} aria-label="Run progress">
            <p className="hxo-eyebrow">Claims resolved: {resolved} of 24</p>
            <div className="hxo-meter" style={{ background: 'var(--muted)' }} role="progressbar" aria-valuemin={0} aria-valuemax={24} aria-valuenow={resolved} aria-label="Claims resolved"><i style={{ width: `${(resolved / 24) * 100}%`, background: 'var(--ai)' }} /></div>
            {flagged && !paused && !pauses.length && (
              <EscalationBanner level="Warning" title="The Agent Auditor flagged the Code matcher" detail="Low-confidence codes since the new invoice format. Pause it to add the rule; other agents keep working." clock={clock(offset(flagged))} actionLabel="Pause Code matcher" agent="Agent Auditor" onAction={() => togglePause(true)} onEvent={onEvent} />
            )}
            <p className="hxo-eyebrow">What just happened</p>
            <ol className="hxo-feed" aria-live="polite">
              {feed.length ? feed.map(({ e, text }, i) => <li key={`${e.event}-${offset(e)}-${i}`}><time>{clock(offset(e))}</time>{text}</li>) : <li>Press Start test run. Watch for the Auditor’s flag, then decide whether to pause the Code matcher.</li>}
            </ol>
          </section>
        </div>
      ) : (
        <RunScorecard view="Report" score={score} summary={`Run ${runNo} · Code matcher ${version} · 24 synthetic claims · ${pauses.length ? `you paused the Code matcher ${clock(pauses[0].from)}–${clock(pauses[0].to)}` : 'no one paused the Code matcher'}`} reviewer="You" onRerun={runAgain} onEvent={onEvent} />
      )}
    </div>
  );
}
