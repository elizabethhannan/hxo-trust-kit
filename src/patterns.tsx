import type { CSSProperties, ReactNode } from 'react';
import {
  AgentDisagreementBanner, AgentTraceRow, ApprovalCard, EvidenceLink, HandBackCard, PauseOneAgent,
  PreviewThenApply, StopControl, UndoBar,
} from './index';
import type { OnHxoEvent } from './telemetry';

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
          <ApprovalCard onEvent={onEvent} />
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
            <PreviewThenApply agent="Launch agent" preview="Posting the release notes to the help center" countdownText="Posts in 0.6 s · Esc to cancel" onEvent={onEvent} />
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
