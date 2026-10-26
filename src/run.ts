/**
 * Agent-team test harness and run scoring.
 *
 * simulateRun() runs a seeded, synthetic test of the Claims Coder agent team and emits every step
 * through the kit's telemetry envelope (HxoEvent). scoreRun() scores a run from those events alone,
 * so any product that emits the Telemetry spec events can score its own agent team the same way.
 *
 * All runs here are simulated test runs on synthetic claims. Numbers describe the simulation, not a
 * production system.
 */
import type { Actor, HxoEvent, HxoEventName } from './telemetry';

/* ---------------------------------------------------------------- team and scenarios */

export interface AgentProfile {
  name: string;
  role: string;
  /** Seconds per step. */
  secs: number;
  /** Chance a step fails once and is retried. */
  retry: number;
  /** Chance the agent is below its confidence bar and hands the step back to a person. */
  held: number;
  /** Chance the agent makes a silent mistake. */
  wrong: number;
  /** Chance a hand-off to the next agent drops a strand of the Handoff Contract. */
  drop: number;
}

export const TEAM: AgentProfile[] = [
  { name: 'Emergency agent', role: 'Reads every claim first; moves emergencies up', secs: 4, retry: 0, held: 0, wrong: 0, drop: 0 },
  { name: 'Extract agent', role: 'Reads SOAP notes and invoices', secs: 22, retry: 0.04, held: 0.04, wrong: 0.01, drop: 0.08 },
  { name: 'Code matcher', role: 'Matches findings to claim codes', secs: 30, retry: 0.03, held: 0.07, wrong: 0.02, drop: 0.03 },
  { name: 'Validate agent', role: 'Checks codes against the record', secs: 12, retry: 0.02, held: 0, wrong: 0, drop: 0.02 },
  { name: 'Requirements agent', role: 'Applies insurer rules', secs: 16, retry: 0.03, held: 0.05, wrong: 0.01, drop: 0.03 },
  { name: 'Route agent', role: 'Sends the claim to the right desk', secs: 6, retry: 0.01, held: 0, wrong: 0, drop: 0.02 },
  { name: 'Packet agent', role: 'Builds the claim packet', secs: 10, retry: 0.02, held: 0, wrong: 0, drop: 0 },
];

/** The seven strands every hand-off must carry (HXO Handoff Contract). */
export const STRANDS = ['Task', 'Intent', 'Confidence', 'Ruled out', 'Human context', 'Edge cases', 'Checkpoint'] as const;
/** The four parts every hand-back to a person must carry (Hand-back card). */
export const HANDBACK_PARTS = ['What I did', 'What I’m unsure of', 'What I need', 'If no one answers'] as const;

export type RunScenario = 'Clean run' | 'Paused mid-run' | 'Drifting';

export interface Pause { agent: string; from: number; to: number; by: string }

interface ScenarioSpec {
  seed: number;
  claims: number;
  /** Claims from this index on use the new invoice format. */
  newFormatFrom: number;
  /** Code matcher mistake rate on new-format claims until a person pauses it and adds the rule. */
  newFormatWrong: number;
  /** Share of Code matcher mistakes the Validate agent catches. */
  validateCatch: number;
  /** Share of remaining mistakes the Agent Auditor catches. */
  auditorCatch: number;
  /** Chance a hand-back leaves out "If no one answers". */
  handbackGap: number;
  pauses: Pause[];
  summary: string;
}

const SCENARIOS: Record<RunScenario, ScenarioSpec> = {
  'Clean run': {
    seed: 5, claims: 24, newFormatFrom: 99, newFormatWrong: 0, validateCatch: 0.8, auditorCatch: 0.9, handbackGap: 0.05, pauses: [],
    summary: '24 synthetic pet-insurance claims, all on the current invoice format.',
  },
  'Paused mid-run': {
    seed: 5, claims: 24, newFormatFrom: 8, newFormatWrong: 0.45, validateCatch: 0.6, auditorCatch: 0.85, handbackGap: 0.1,
    pauses: [{ agent: 'Code matcher', from: 24 * 60, to: 30 * 60, by: 'K. Patel' }],
    summary: '24 synthetic claims; a new invoice format arrives at claim 9. K. Patel pauses the Code matcher at 09:24, adds the rule, and resumes at 09:30.',
  },
  Drifting: {
    seed: 5, claims: 24, newFormatFrom: 8, newFormatWrong: 0.45, validateCatch: 0.55, auditorCatch: 0.35, handbackGap: 0.25, pauses: [],
    summary: '24 synthetic claims; a new invoice format arrives at claim 9 and no one pauses the Code matcher.',
  },
};

export function scenarioSummary(s: RunScenario): string { return SCENARIOS[s].summary; }

/* ---------------------------------------------------------------- simulation */

/** Run start used by every scenario: 2026-10-24 09:00 local, written as UTC for a stable clock. */
export const RUN_START = Date.UTC(2026, 9, 24, 9, 0, 0);
const iso = (s: number) => new Date(RUN_START + Math.round(s * 1000)).toISOString();
export const clock = (s: number) => {
  const d = new Date(RUN_START + Math.round(s * 1000));
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const DEFAULT_PERSON = 'K. Patel';
const ARRIVAL_GAP = 90;
const CLAIM_TARGET = 15 * 60;
const EMERGENCY_TARGET = 120;

export type CodeMatcherVersion = 'v2.0' | 'v2.1';
/** v2.1: slower per step, but trained on the new invoice format. */
const CODE_MATCHER_V21 = { secs: 34, held: 0.05, wrong: 0.015, newFormatWrong: 0.06 };

export interface SimOptions {
  /** Overrides the scenario's pauses (used by the live pattern, where a real person pauses). */
  pauses?: Pause[];
  /** Overrides the scenario profile; the live pattern uses the "Paused mid-run" world with no scripted pause. */
  world?: RunScenario;
  /** Name of the person in the loop (default K. Patel). */
  person?: string;
  /** Which Code matcher does the coding task. v2.1 is the candidate that knows the new invoice format. */
  codeMatcher?: CodeMatcherVersion;
}

type Ev = HxoEvent & { s: number };

/**
 * Simulate the agent team on synthetic claims. Every random draw happens up front in a fixed order,
 * so a pause added later in the run never changes what happened before it.
 */
export function simulateRun(scenario: RunScenario, opts: SimOptions = {}): HxoEvent[] {
  const base = SCENARIOS[opts.world ?? scenario];
  const v21 = opts.codeMatcher === 'v2.1';
  const spec = v21 ? { ...base, newFormatWrong: CODE_MATCHER_V21.newFormatWrong } : base;
  const team = TEAM.map(a => (v21 && a.name === 'Code matcher' ? { ...a, secs: CODE_MATCHER_V21.secs, held: CODE_MATCHER_V21.held, wrong: CODE_MATCHER_V21.wrong } : a));
  const pauses = opts.pauses ?? SCENARIOS[scenario].pauses;
  const PERSON = opts.person ?? DEFAULT_PERSON;
  const r = rng(spec.seed);
  const n = spec.claims;
  const claims = Array.from({ length: n }, (_, i) => ({
    id: String(4840 + i),
    arrive: i * ARRIVAL_GAP,
    emergency: i === 5 || i === 17,
    newFormat: i >= spec.newFormatFrom,
    draws: TEAM.map(() => ({ retry: r(), held: r(), wrong: r(), drop: r(), strand: r(), personSecs: r(), gap: r(), catchV: r(), catchA: r(), reask: r() })),
    ready: i * ARRIVAL_GAP,
    mistakes: [] as { agent: string; caught: 'Validate agent' | 'Agent Auditor' | 'missed'; at?: number }[],
    corrected: false,
    stage: -1,
    personWork: 0,
    reasks: 0,
  }));

  const ev: Ev[] = [];
  const push = (s: number, event: HxoEventName, component: string, actor: Actor, action: string, agent: string | string[] | undefined, extra: Record<string, unknown> = {}) =>
    ev.push({ s, event, t: iso(s), component, actor, action, ...(agent !== undefined ? { agent } : {}), ...extra } as Ev);

  push(0, 'run_started', 'Govern/Run scorecard', 'person', 'started', 'all', { scenario, claims: n, team: team.map(a => a.name), versions: { 'Code matcher': opts.codeMatcher ?? 'v2.0' } });

  // When a person pauses an agent: the agent finishes its current step, then idles.
  const pausedAt = (agent: string, t: number) => pauses.find(p => p.agent === agent && t >= p.from && t < p.to);
  const fixedAt = (agent: string) => pauses.filter(p => p.agent === agent).map(p => p.to).sort((a, b) => a - b)[0] ?? Infinity;
  for (const p of pauses) push(p.from, 'agent_paused', 'Control/Pause one agent', 'person', 'paused', p.agent, { by: p.by });

  let codeMistakesSeen = 0;
  let auditorFlagged = false;

  team.forEach((agent, k) => {
    let free = 0;
    const ackDone = new Set<Pause>();
    const pending = claims.filter(c => c.stage === k - 1);
    while (pending.length) {
      // pick next: emergencies first among claims ready by the time the agent is free
      const t0 = Math.max(free, Math.min(...pending.map(c => c.ready)));
      const ready = pending.filter(c => c.ready <= t0);
      const pick = ready.find(c => c.emergency) ?? ready.sort((a, b) => a.ready - b.ready)[0];
      let start = t0;
      const p = pausedAt(agent.name, start);
      if (p) {
        if (!ackDone.has(p)) { ackDone.add(p); push(Math.max(p.from, free), 'agent_paused', 'Control/Pause one agent', 'agent', 'idle', agent.name, { ack_secs: Math.max(0, free - p.from), started_while_paused: false }); }
        if (!isFinite(p.to)) break; // still paused: nothing else starts
        start = p.to;
      }
      pending.splice(pending.indexOf(pick), 1);
      const d = pick.draws[k];
      let dur = agent.secs * (pick.newFormat && k === 1 ? 1.3 : 1);
      let outcome: 'ok' | 'retry' | 'held' = 'ok';
      if (d.retry < agent.retry) { outcome = 'retry'; dur *= 1.8; }
      else if (d.held < agent.held + (pick.newFormat && k === 1 ? 0.06 : 0)) outcome = 'held';
      const wrongRate = agent.name === 'Code matcher' && pick.newFormat && start < fixedAt(agent.name) ? spec.newFormatWrong : agent.wrong;
      const wrong = outcome !== 'held' && d.wrong < wrongRate;
      const end = start + dur;
      free = end;
      push(end, 'agent_step', 'Govern/Run scorecard', 'agent', outcome, agent.name, { claim: pick.id, start_s: start, dur_s: dur, emergency: pick.emergency || undefined });
      let next = end;
      if (agent.name === 'Emergency agent' && pick.emergency) {
        push(end, 'escalation_shown', 'Hand back/Escalation banner', 'agent', 'shown', agent.name, { claim: pick.id, to_person_secs: end - pick.arrive, level: 'Critical' });
      }
      if (outcome === 'held') {
        const gap = d.gap < spec.handbackGap;
        const parts = gap ? HANDBACK_PARTS.filter(x => x !== 'If no one answers') : [...HANDBACK_PARTS];
        push(end, 'handback_shown', 'Hand back/Hand-back card', 'agent', 'shown', agent.name, { claim: pick.id, parts, urgency: pick.emergency ? 'Urgent' : 'Routine' });
        const wait = pick.emergency ? 25 + d.personSecs * 30 : 60 + d.personSecs * 150;
        next = end + wait;
        push(next, 'handback_resolved', 'Hand back/Hand-back card', 'person', 'resolved', agent.name, { claim: pick.id, by: PERSON, wait_secs: wait });
      }
      if (wrong) {
        pick.mistakes.push({ agent: agent.name, caught: 'missed' });
        if (agent.name === 'Code matcher') {
          codeMistakesSeen++;
          if (!auditorFlagged && codeMistakesSeen >= 3) {
            auditorFlagged = true;
            push(end, 'audit_flagged', 'Govern/Agent Auditor', 'auditor', 'flagged', agent.name, { metric: 'decision_accuracy', note: 'Low-confidence codes up since the new invoice format' });
          }
        }
      }
      // Validate agent checks code mistakes; the Auditor checks what is left.
      if (agent.name === 'Validate agent') {
        for (const m of pick.mistakes) if (m.caught === 'missed' && m.agent === 'Code matcher' && d.catchV < spec.validateCatch) { m.caught = 'Validate agent'; m.at = end; }
      }
      if (agent.name === 'Packet agent') {
        for (const m of pick.mistakes) if (m.caught === 'missed' && d.catchA < spec.auditorCatch) { m.caught = 'Agent Auditor'; m.at = end; }
      }
      for (const m of pick.mistakes) {
        if (m.at === end && m.caught !== 'missed') {
          const fix = 90 + d.personSecs * 120;
          if (m.caught === 'Agent Auditor') push(end, 'audit_flagged', 'Govern/Agent Auditor', 'auditor', 'held', m.agent, { claim: pick.id });
          push(end + fix, 'correction_made', 'Act/Correction with reason', 'person', 'corrected', m.agent, { claim: pick.id, by: PERSON, caught_by: m.caught, fix_secs: fix });
          next = Math.max(next, end + fix);
          pick.corrected = true;
        }
      }
      // hand-off to the next agent
      if (k < TEAM.length - 1) {
        const dropped = d.drop < agent.drop ? [d.strand < 0.6 ? 'Edge cases' : 'Ruled out'] : [];
        push(next, 'agent_handoff', 'Hand back/Handoff contract', 'agent', 'handed_off', [agent.name, TEAM[k + 1].name], { claim: pick.id, strands: STRANDS.length - dropped.length, dropped });
        if (dropped.length && d.reask < 0.5) {
          next += 75;
          pick.reasks++;
          push(next, 'clarify_asked', 'Explain/Understood card', 'agent', 'asked_again', TEAM[k + 1].name, { claim: pick.id, why: `${agent.name} dropped “${dropped[0]}”`, avoidable: true });
        }
      }
      pick.ready = next;
      pick.stage = k;
      if (k === TEAM.length - 1) {
        const missed = pick.mistakes.some(m => m.caught === 'missed');
        const res = missed ? 'wrong' : pick.corrected ? 'corrected' : 'correct';
        push(next, 'claim_resolved', 'Govern/Run scorecard', 'agent', res, agent.name, { claim: pick.id, secs: next - pick.arrive, emergency: pick.emergency || undefined, missed_from: pick.mistakes.filter(m => m.caught === 'missed').map(m => m.agent) });
      }
    }
    // An agent that had no work during a pause still acknowledges it.
    for (const p of pauses) if (p.agent === agent.name && !ackDone.has(p)) push(p.from, 'agent_paused', 'Control/Pause one agent', 'agent', 'idle', agent.name, { ack_secs: 0, started_while_paused: false });
  });

  for (const p of pauses) if (isFinite(p.to)) push(p.to, 'agent_paused', 'Control/Pause one agent', 'person', 'resumed', p.agent, { by: p.by });
  ev.sort((a, b) => a.s - b.s);
  const done = ev.filter(e => e.event === 'claim_resolved').length === n;
  if (done) push(ev[ev.length - 1].s, 'run_completed', 'Govern/Run scorecard', 'agent', 'completed', 'all', { claims: n });
  return ev.map(({ s, ...e }) => ({ ...e, s_offset: Math.round(s) }));
}

/* ---------------------------------------------------------------- scoring */

export interface AgentScore {
  rank: number;
  agent: string;
  role: string;
  steps: number;
  firstTime: number;
  successPct: number;
  retries: number;
  held: number;
  mistakes: number;
  caughtByAgents: number;
  handoffPct: number | null;
  busySecs: number;
}
export interface Measure { key: string; label: string; weight: number; pct: number | null; detail: string; target: string; pass: boolean | null }
export type Verdict = 'Successful' | 'Successful with interventions' | 'Not successful';
export interface Finding { tone: 'Critical' | 'Warning' | 'Success'; text: string; impact: number }
export interface RunScore {
  scenario: string;
  claims: number;
  started: string;
  ended: string;
  durationSecs: number;
  internal: number;
  hxo: number;
  internalMeasures: Measure[];
  hxoMeasures: Measure[];
  agents: AgentScore[];
  outcomes: { correct: number; corrected: number; wrong: number; open: number };
  personWork: { handbacks: number; corrections: number; reasks: number; pauses: number; minutes: number };
  verdict: Verdict;
  verdictLine: string;
  challenges: Finding[];
  wins: Finding[];
  timeline: { agent: string; spans: { from: number; to: number; outcome: string; claim: string }[] }[];
  pauses: { agent: string; from: number; to: number | null; by: string; ackSecs: number | null; startedWhilePaused: boolean }[];
  emergencies: { claim: string; secs: number }[];
}

const plural = (k: number, one: string, many = one + 's') => `${k} ${k === 1 ? one : many}`;
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 100);
const weighted = (ms: Measure[]) => {
  const used = ms.filter(m => m.pct !== null);
  const w = used.reduce((s, m) => s + m.weight, 0);
  return Math.round(used.reduce((s, m) => s + (m.pct as number) * m.weight, 0) / w);
};
const n = (e: HxoEvent, k: string) => Number(e[k] ?? 0);
const agentOf = (e: HxoEvent) => (Array.isArray(e.agent) ? e.agent[0] : e.agent) ?? '';

/** Score a run from its telemetry events only. */
export function scoreRun(events: HxoEvent[], team: AgentProfile[] = TEAM): RunScore {
  const by = (name: HxoEventName) => events.filter(e => e.event === name);
  const start = by('run_started')[0];
  const steps = by('agent_step');
  const corrections = by('correction_made');
  const handoffs = by('agent_handoff');
  const handbacks = by('handback_shown');
  const resolved = by('claim_resolved');
  const reasks = by('clarify_asked');
  const claims = (start ? n(start, 'claims') : 0) || resolved.length;
  const offs = events.map(e => n(e, 's_offset'));
  const duration = Math.max(0, ...offs);

  // ---- internal: how the agents worked together
  const agents: AgentScore[] = team.map(a => {
    const st = steps.filter(e => agentOf(e) === a.name);
    const fixes = corrections.filter(e => agentOf(e) === a.name);
    const fixedClaims = new Set(fixes.map(e => e.claim));
    const missedClaims = new Set(resolved.filter(e => (e.missed_from as string[] | undefined)?.includes(a.name)).map(e => e.claim));
    const firstTime = st.filter(e => e.action === 'ok' && !fixedClaims.has(e.claim) && !missedClaims.has(e.claim)).length;
    const ho = handoffs.filter(e => agentOf(e) === a.name);
    return {
      rank: 0, agent: a.name, role: a.role, steps: st.length, firstTime,
      successPct: pct(firstTime, st.length),
      retries: st.filter(e => e.action === 'retry').length,
      held: st.filter(e => e.action === 'held').length,
      mistakes: fixes.length + missedClaims.size,
      caughtByAgents: fixes.filter(e => e.caught_by === 'Validate agent').length,
      handoffPct: ho.length ? pct(ho.reduce((s, e) => s + n(e, 'strands'), 0), ho.length * STRANDS.length) : null,
      busySecs: Math.round(st.reduce((s, e) => s + n(e, 'dur_s'), 0)),
    };
  });
  const wrongClaims = resolved.filter(e => e.action === 'wrong').map(e => e.claim);
  agents.sort((a, b) => b.successPct - a.successPct || a.mistakes - b.mistakes).forEach((a, i) => (a.rank = i + 1));

  const allSteps = steps.length;
  const okFirst = agents.reduce((s, a) => s + a.firstTime, 0);
  const strandsCarried = handoffs.reduce((s, e) => s + n(e, 'strands'), 0);
  const totalMistakes = corrections.length + wrongClaims.length;
  const caughtBeforePerson = corrections.filter(e => e.caught_by === 'Validate agent').length;
  const retries = steps.filter(e => e.action === 'retry').length;

  const internalMeasures: Measure[] = [
    { key: 'steps', label: 'Steps right the first time', weight: 40, pct: pct(okFirst, allSteps), detail: `${okFirst} of ${allSteps} steps, no retry, no hand-back, no later fix`, target: '≥ 90%', pass: pct(okFirst, allSteps) >= 90 },
    { key: 'handoff', label: 'Hand-offs with all 7 strands', weight: 20, pct: pct(strandsCarried, handoffs.length * STRANDS.length), detail: `${handoffs.length - handoffs.filter(e => (e.dropped as string[])?.length).length} of ${handoffs.length} hand-offs carried the full Handoff Contract`, target: '≥ 98%', pass: pct(strandsCarried, handoffs.length * STRANDS.length) >= 98 },
    { key: 'caught', label: 'Mistakes caught before the claim went out', weight: 20, pct: totalMistakes ? pct(corrections.length, totalMistakes) : 100, detail: totalMistakes ? `${corrections.length} of ${totalMistakes} mistakes caught (${caughtBeforePerson} by the Validate agent, ${corrections.length - caughtBeforePerson} by the Agent Auditor)` : 'No mistakes in this run', target: '100%', pass: corrections.length === totalMistakes },
    { key: 'reliable', label: 'Steps with no retry', weight: 20, pct: pct(allSteps - retries, allSteps), detail: `${plural(retries, 'retry', 'retries')} in ${allSteps} steps`, target: '≥ 97%', pass: pct(allSteps - retries, allSteps) >= 97 },
  ];

  // ---- external: the HXO experience for the person who needed the claim resolved
  const correct = resolved.filter(e => e.action === 'correct').length;
  const corrected = resolved.filter(e => e.action === 'corrected').length;
  const wrong = resolved.filter(e => e.action === 'wrong').length;
  const open = Math.max(0, claims - resolved.length);
  const inTime = resolved.filter(e => n(e, 'secs') <= CLAIM_TARGET && e.action !== 'wrong').length;
  const avoidableClaims = new Set([...corrections.map(e => e.claim), ...reasks.map(e => e.claim)]);
  const pauseEvents = events.filter(e => e.event === 'agent_paused');
  const personPauses = pauseEvents.filter(e => e.actor === 'person' && e.action === 'paused');
  const pauses = personPauses.map(p => {
    const ack = pauseEvents.find(e => e.actor === 'agent' && agentOf(e) === agentOf(p) && n(e, 's_offset') >= n(p, 's_offset'));
    const resume = pauseEvents.find(e => e.actor === 'person' && e.action === 'resumed' && agentOf(e) === agentOf(p) && n(e, 's_offset') >= n(p, 's_offset'));
    const from = n(p, 's_offset'); const to = resume ? n(resume, 's_offset') : null;
    const startedWhilePaused = steps.some(s => agentOf(s) === agentOf(p) && n(s, 'start_s') >= from && n(s, 'start_s') < (to ?? Infinity));
    return { agent: agentOf(p), from, to, by: String(p.by ?? 'a person'), ackSecs: ack ? Math.round(n(ack, 'ack_secs')) : null, startedWhilePaused };
  });
  const honored = pauses.filter(p => !p.startedWhilePaused && p.ackSecs !== null && p.ackSecs <= 60).length;
  const fullContext = handbacks.filter(e => (e.parts as string[])?.length === HANDBACK_PARTS.length).length;
  const emergencies = by('escalation_shown').map(e => ({ claim: String(e.claim), secs: Math.round(n(e, 'to_person_secs')) }));
  const emergencyOk = emergencies.filter(e => e.secs <= EMERGENCY_TARGET).length;

  const hxoMeasures: Measure[] = [
    { key: 'outcome', label: 'Got the right result', weight: 30, pct: pct(correct + corrected, claims), detail: `${correct + corrected} of ${claims} claims resolved correctly${wrong ? `; ${wrong} would have reached the insurer wrong` : ''}`, target: '100%', pass: correct + corrected === claims },
    { key: 'speed', label: 'Resolved within 15 minutes', weight: 15, pct: pct(inTime, claims), detail: `${inTime} of ${claims} claims${emergencies.length ? ` · emergencies to a person in ${emergencies.map(e => e.secs + ' s').join(', ')}` : ''}`, target: '≥ 90%, emergencies ≤ 2 min', pass: pct(inTime, claims) >= 90 && emergencyOk === emergencies.length },
    { key: 'effort', label: 'No avoidable work for the person', weight: 20, pct: pct(claims - avoidableClaims.size, claims), detail: `${avoidableClaims.size} claims needed a person to fix a mistake or answer twice; hand-backs below the confidence bar are not counted`, target: '≥ 90%', pass: pct(claims - avoidableClaims.size, claims) >= 90 },
    { key: 'control', label: 'Pauses honored', weight: 15, pct: pauses.length ? pct(honored, pauses.length) : null, detail: pauses.length ? pauses.map(p => `${p.agent} paused by ${p.by} ${clock(p.from)}${p.to !== null ? `–${clock(p.to)}` : ''}; ${p.ackSecs === null ? 'no stop confirmed' : p.ackSecs === 0 ? 'stopped at once' : `stopped after ${p.ackSecs} s`}; ${p.startedWhilePaused ? 'work started while paused' : 'no work started while paused'}`).join(' · ') : 'Not tested: no one paused or stopped an agent in this run', target: 'stop within one step', pass: pauses.length ? honored === pauses.length : null },
    { key: 'clarity', label: 'Hand-backs with full context', weight: 20, pct: handbacks.length ? pct(fullContext, handbacks.length) : null, detail: handbacks.length ? `${fullContext} of ${handbacks.length} said what was done, what is unsure, what is needed, and what happens if no one answers` : 'No hand-backs in this run', target: '100%', pass: handbacks.length ? fullContext === handbacks.length : null },
  ];

  const internal = weighted(internalMeasures);
  const hxo = weighted(hxoMeasures);
  const personMinutes = Math.round(
    (by('handback_resolved').reduce((s, e) => s + n(e, 'wait_secs'), 0) * 0.4 + corrections.reduce((s, e) => s + n(e, 'fix_secs'), 0) + reasks.length * 75) / 60,
  );
  const avoidableRate = (corrections.length + reasks.length + personPauses.length) / Math.max(1, claims);
  const outcomePct = pct(correct + corrected, claims);
  const verdict: Verdict = wrong > 0 || open > 0 || hxo < 70 || outcomePct < 90
    ? 'Not successful'
    : internal >= 85 && hxo >= 85 && avoidableRate <= 0.1
      ? 'Successful'
      : 'Successful with interventions';
  const verdictLine = verdict === 'Not successful'
    ? `${correct + corrected} of ${claims} claims resolved correctly. ${wrong ? `${wrong} would have reached the insurer wrong.` : `${open} were still open.`} Do not ship this team as is.`
    : verdict === 'Successful'
      ? `${correct + corrected} of ${claims} claims resolved correctly, ${correct} with no human fix. The person only stepped in where an agent was below its confidence bar.`
      : `${correct + corrected} of ${claims} claims resolved correctly, but a person had to step in ${corrections.length + reasks.length + personPauses.length} times to get there.`;

  // ---- challenges and wins, ranked by impact
  const challenges: Finding[] = [];
  const wins: Finding[] = [];
  if (wrong) challenges.push({ tone: 'Critical', impact: 100, text: `${wrong} claim${wrong > 1 ? 's' : ''} (${wrongClaims.join(', ')}) passed every agent with a mistake (from ${[...new Set(resolved.filter(e => e.action === 'wrong').flatMap(e => e.missed_from as string[]))].join(', ')}). Neither the Validate agent nor the Auditor caught ${wrong > 1 ? 'them' : 'it'}.` });
  const worst = [...agents].filter(a => a.steps).sort((a, b) => a.successPct - b.successPct)[0];
  if (worst && worst.successPct < 90) challenges.push({ tone: worst.successPct < 75 ? 'Critical' : 'Warning', impact: 100 - worst.successPct, text: `${worst.agent} got ${worst.successPct}% of its steps right the first time: ${plural(worst.mistakes, 'mistake')}, ${plural(worst.held, 'hand-back')}, ${plural(worst.retries, 'retry', 'retries')}.` });
  for (const p of pauses) {
    const flaggedFirst = by('audit_flagged').some(e => agentOf(e) === p.agent && n(e, 's_offset') <= p.from);
    const queued = steps.filter(s => agentOf(s) === p.agent && n(s, 'start_s') >= p.from && n(s, 'start_s') - (p.to ?? Infinity) < 600).length;
    challenges.push({ tone: 'Warning', impact: 30, text: `${p.by} paused ${p.agent} at ${clock(p.from)}${flaggedFirst ? ' after the Agent Auditor flagged it' : ''}${p.to !== null ? `; its work waited until ${clock(p.to)}` : '; it is still paused'}${queued && p.to !== null ? `, then ${plural(queued, 'claim')} cleared in the next 10 minutes` : ''}.` });
  }
  const dropTotal = handoffs.filter(e => (e.dropped as string[])?.length);
  if (dropTotal.length) {
    const worstSender = Object.entries(dropTotal.reduce<Record<string, number>>((m, e) => ((m[agentOf(e)] = (m[agentOf(e)] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1])[0];
    challenges.push({ tone: 'Warning', impact: 10 + dropTotal.length * 3, text: `${dropTotal.length} hand-offs dropped a strand of the Handoff Contract (most from ${worstSender[0]}); the next agent asked the person again ${reasks.length} time${reasks.length === 1 ? '' : 's'}.` });
  }
  if (handbacks.length && fullContext < handbacks.length) challenges.push({ tone: 'Warning', impact: 15, text: `${handbacks.length - fullContext} hand-back${handbacks.length - fullContext > 1 ? 's' : ''} left out what happens if no one answers.` });
  const slow = claims - inTime - wrong - open;
  if (slow > 0) challenges.push({ tone: 'Warning', impact: 10 + slow, text: `${slow} claim${slow > 1 ? 's' : ''} took longer than 15 minutes, mostly waiting on a person.` });
  emergencies.filter(e => e.secs > EMERGENCY_TARGET).forEach(e => challenges.push({ tone: 'Critical', impact: 80, text: `Emergency claim ${e.claim} took ${e.secs} s to reach a person (target 2 min).` }));

  if (emergencies.length && emergencyOk === emergencies.length) wins.push({ tone: 'Success', impact: 0, text: `Every emergency jumped the queue and reached a person in ${Math.max(...emergencies.map(e => e.secs))} s or less.` });
  if (pauses.length && honored === pauses.length) wins.push({ tone: 'Success', impact: 0, text: `Every pause was honored: the agent finished its current step, then nothing new started until a person resumed it.` });
  const caughtTotal = corrections.length;
  if (caughtTotal) wins.push({ tone: 'Success', impact: 0, text: `${caughtTotal} agent mistake${caughtTotal > 1 ? 's were' : ' was'} caught before a claim went out: ${caughtBeforePerson} by the Validate agent, ${caughtTotal - caughtBeforePerson} by the Agent Auditor.` });
  if (!caughtTotal && !wrong) wins.push({ tone: 'Success', impact: 0, text: 'No agent mistakes reached review.' });
  const best = agents[0];
  if (best) wins.push({ tone: 'Success', impact: 0, text: `${best.agent} led the team at ${best.successPct}% right the first time.` });
  if (handbacks.length && fullContext === handbacks.length) wins.push({ tone: 'Success', impact: 0, text: `All ${handbacks.length} hand-backs carried full context.` });
  challenges.sort((a, b) => b.impact - a.impact);

  const timeline = team.map(a => ({
    agent: a.name,
    spans: steps.filter(e => agentOf(e) === a.name).map(e => ({ from: n(e, 'start_s'), to: n(e, 'start_s') + n(e, 'dur_s'), outcome: e.action, claim: String(e.claim) })),
  }));

  return {
    scenario: String(start?.scenario ?? 'Run'), claims, started: clock(0), ended: clock(duration), durationSecs: duration,
    internal, hxo, internalMeasures, hxoMeasures, agents,
    outcomes: { correct, corrected, wrong, open },
    personWork: { handbacks: handbacks.length, corrections: corrections.length, reasks: reasks.length, pauses: personPauses.length, minutes: personMinutes },
    verdict, verdictLine, challenges, wins, timeline, pauses, emergencies,
  };
}

/** Convenience: simulate a scenario and score it. */
export function scoreScenario(s: RunScenario): RunScore { return scoreRun(simulateRun(s)); }

/* ---------------------------------------------------------------- task timers */

export interface TaskTime {
  agent: string;
  role: string;
  /** Steps finished by `now`. */
  steps: number;
  /** Seconds the agent spent working, by `now`. */
  busySecs: number;
  /** Average seconds per finished step. */
  avgSecs: number | null;
  /** Seconds a person spent on this task (answering hand-backs, fixing mistakes), by `now`. */
  personSecs: number;
  working: boolean;
}
export interface RunTiming {
  label: string;
  codeMatcher: string;
  /** Simulated seconds from start to the last event shown. */
  durationSecs: number;
  resolved: number;
  claims: number;
  tasks: TaskTime[];
  internal?: number;
  hxo?: number;
  savedAt?: string;
}

/** Per-task timers from a run's events, as of `now` simulated seconds (default: the whole run). Times are simulated, so playback speed never changes them. */
export function timeRun(events: HxoEvent[], now = Infinity, label = 'This run', team: AgentProfile[] = TEAM): RunTiming {
  const off = (e: HxoEvent) => Number(e.s_offset ?? 0);
  const start = events.find(e => e.event === 'run_started');
  const steps = events.filter(e => e.event === 'agent_step');
  const tasks = team.map(a => {
    const mine = steps.filter(e => agentOf(e) === a.name && Number(e.start_s) <= now);
    const done = mine.filter(e => off(e) <= now);
    const busy = mine.reduce((s, e) => s + Math.min(off(e), now) - Number(e.start_s), 0);
    const doneBusy = done.reduce((s, e) => s + Number(e.dur_s), 0);
    const person = events.filter(e => agentOf(e) === a.name && off(e) <= now && (e.event === 'handback_resolved' || e.event === 'correction_made'))
      .reduce((s, e) => s + Number(e.wait_secs ?? e.fix_secs ?? 0), 0);
    return { agent: a.name, role: a.role, steps: done.length, busySecs: Math.round(busy), avgSecs: done.length ? Math.round((doneBusy / done.length) * 10) / 10 : null, personSecs: Math.round(person), working: mine.length > done.length };
  });
  const last = Math.max(0, ...events.filter(e => off(e) <= now).map(off));
  return {
    label,
    codeMatcher: String((start?.versions as Record<string, string> | undefined)?.['Code matcher'] ?? 'v2.0'),
    durationSecs: isFinite(now) ? Math.round(now) : last,
    resolved: events.filter(e => e.event === 'claim_resolved' && off(e) <= now).length,
    claims: start ? Number(start.claims) : 0,
    tasks,
  };
}

/** mm:ss for a number of seconds. */
export const mmss = (secs: number) => `${Math.floor(secs / 60)}:${String(Math.round(secs % 60)).padStart(2, '0')}`;
