# AGENTS.md · component API

A summary of every component in this kit, for people and coding agents working in this repo. Props marked with `|` unions are the Figma variant properties; the first value is the default. All components accept `onEvent` (see Telemetry) unless noted. Actors in events are `person`, `agent` or `auditor`.

## Conventions

- Import from `src/index.ts`; it also loads `tokens.css` and `kit.css`.
- Style with tokens only (`var(--accent)`, `var(--space-md)`). Never hard-code a color.
- Keep the Figma names. A new variant in Figma means a new union member here and a new story.
- Each variant has exactly one story in `src/stories/`, named `Prop=Value, Prop=Value` as in Figma.
- Run `npm run typecheck`, `npm run build-storybook` and `npm run test:stories` before committing.

## supporting.tsx

### Button

- `variant?: 'Primary' | 'Secondary' | 'Ghost' | 'Destructive' | 'Agent'`
- `state?: 'Default' | 'Focus' | 'Disabled'`
- `block?: boolean` (full width)
- All native `<button>` attributes; forwards its ref. No `onEvent`.

### ActorBadge

- `actor?: 'Agent' | 'Human' | 'Security'`
- `name?: string`
- Includes screen-reader text naming the actor kind. No `onEvent`.

### StatusPill

- `tone?: 'Neutral' | 'Agent' | 'Info' | 'Success' | 'Warning' | 'Critical'`
- `label?: string` (status is always in the label text, never color alone). No `onEvent`.

## explain.tsx

### ConfidenceChip

- `level?: ConfidenceLevel`
- `state?: 'Default' | 'Track record'`
- `percent?: number`
- `trackRecord?: string`
- `agent?: string`
- `onEvent?: OnHxoEvent`

### EvidenceLink

- `state?: 'Default' | 'Highlighted' | 'Unreadable'`
- `source?: string`
- `span?: string`
- `supports?: string`
- `unreadableNote?: string`
- `agent?: string`
- `onEvent?: OnHxoEvent`

### AgentTraceRow

- `expanded?: boolean`
- `time?: string`
- `from?: string`
- `to?: string`
- `message?: string`
- `payload?: string[]`
- `onEvent?: OnHxoEvent`

### UnderstoodCard

- `input?: InputKind`
- `certainty?: Certainty`
- `agent?: string`
- `youSaid?: string`
- `understood?: string`
- `slots?: string[]`
- `doubt?: string`
- `options?: string[]`
- `onConfirm?: () => void`
- `onChange?: () => void`
- `onChoose?: (index: number) => void`
- `onCancel?: () => void`
- `onEvent?: OnHxoEvent`

## act.tsx

### PreviewThenApply

- `state?: PreviewState`
- `motion?: 'On' | 'Off'`
- `agent?: string`
- `preview?: string`
- `applied?: string`
- `appliedAt?: string`
- `cancelledAt?: string`
- `countdownText?: string`
- `live?: boolean`
- `durationMs?: number`
- `onApply?: () => void`
- `onCancel?: () => void`
- `onUndo?: () => void`
- `onEvent?: OnHxoEvent`

### ApprovalCard

- `kind?: 'Standard' | 'Destructive'`
- `state?: 'Waiting' | 'Approved' | 'Declined'`
- `agent?: string`
- `title?: string`
- `changes?: string[]`
- `approveLabel?: string`
- `decidedBy?: string`
- `decidedAt?: string`
- `reason?: string`
- `resultNote?: string`
- `onApprove?: () => void`
- `onDecline?: (reason?: string) => void`
- `onEvent?: OnHxoEvent`

### CorrectionWithReason

- `mode?: CorrectionMode`
- `agent?: string`
- `proposed?: string`
- `value?: string`
- `alternatives?: CorrectionAlternative[]`
- `reasons?: string[]`
- `defaultReason?: string`
- `defaultNote?: string`
- `onSave?: (r: { mode: CorrectionMode; value?: string; reason: string; note: string }) => void`
- `onEvent?: OnHxoEvent`

## control.tsx

### UndoBar

- `state?: 'Available' | 'Expired' | 'Undone'`
- `title?: string`
- `detail?: string`
- `agent?: string`
- `onUndo?: () => void`
- `onEvent?: OnHxoEvent`

### StopControl

- `state?: 'Idle' | 'Stopping' | 'Stopped'`
- `working?: number`
- `security?: number`
- `stoppedAt?: string`
- `headline?: string`
- `onStop?: () => void`
- `onRestart?: () => void`
- `onEvent?: OnHxoEvent`

### PauseOneAgent

- `state?: 'Running' | 'Paused' | 'Resumed'`
- `agent?: string`
- `runningLabel?: string`
- `pausedBy?: string`
- `at?: string`
- `onToggle?: (paused: boolean) => void`
- `onEvent?: OnHxoEvent`

### SwitchDecision

- `action?: 'Turn off' | 'Turn on'`
- `state?: 'Choosing' | 'Logged'`
- `agent?: string`
- `reasons?: string[]`
- `defaultReason?: number`
- `note?: string`
- `log?: string[]`
- `onConfirm?: (r: { reason: string; note: string }) => void`
- `onKeep?: () => void`
- `onEvent?: OnHxoEvent`

## handback.tsx

### HandBackCard

- `urgency?: 'Routine' | 'Urgent'`
- `state?: 'Waiting' | 'Resolved'`
- `agent?: string`
- `timeLeft?: string`
- `title?: string`
- `did?: string`
- `unsure?: string`
- `need?: string`
- `ifNoOne?: string`
- `options?: string[]`
- `resolution?: string`
- `savedNote?: string`
- `onChoose?: (option: string, index: number) => void`
- `onEvent?: OnHxoEvent`

### EscalationBanner

- `level?: 'Info' | 'Warning' | 'Critical'`
- `title?: string`
- `detail?: string`
- `clock?: string`
- `actionLabel?: string`
- `agent?: string`
- `onAction?: () => void`
- `onEvent?: OnHxoEvent`

### AgentDisagreementBanner

- `state?: 'Waiting' | 'Resolved'`
- `title?: string`
- `a?: Position`
- `b?: Position`
- `thirdOption?: string`
- `resolution?: string`
- `onChoose?: (choice: string) => void`
- `onEvent?: OnHxoEvent`

## govern.tsx

### HumanFrustrationMatrix

- `view?: 'Matrix' | 'Ranked list'`
- `product?: string`
- `period?: string`
- `sources?: { label: string; count: number }[]`
- `themes?: FrustrationTheme[]`
- `onEvent?: OnHxoEvent`

### AgentAuditor

- `status?: AuditStatus; agent?: string; onViewLog?: () => void; onEvent?: OnHxoEvent }`
- `const AUDIT = {`
- `Healthy: { tiles: [['Compliance', '99.2%', 'rules followed'], ['Off-path rate', '0.8%', 'of steps'], ['Decision accuracy', '97%', 'vs gold set'], ['Odd behavior', 'None', 'last 24 h']], found: ['All 412 decisions today followed policy rules.', 'No drift from last week’s baseline.'], tone: 'Success' as const, tile: '' },`
- `Drifting: { tiles: [['Compliance', '96.1%', 'rules followed'], ['Off-path rate', '4.6%', 'of steps'], ['Decision accuracy', '88%', 'vs gold set'], ['Odd behavior', 'Spike', 'low-confidence codes since 08:40']], found: ['Low-confidence codes up 3× since 08:40, after the new invoice format.', '12 decisions went off the approved path; all were held for review.'], tone: 'Warning' as const, tile: 'warn' },`
- `'Paused by auditor': { tiles: [['Compliance', '91.4%', 'rules followed'], ['Off-path rate', '9.2%', 'of steps'], ['Decision accuracy', '79%', 'vs gold set'], ['Odd behavior', 'Loop', 'repeated the same call 40×']], found: ['The agent repeated the same call 40 times in 2 minutes.', 'The auditor paused it at 09:51. A person must decide what happens next.'], tone: 'Critical' as const, tile: 'crit' },`

### EvaluationMatrix

- `state?: 'Evaluating' | 'Decided'`
- `agent?: string`
- `fromVersion?: string`
- `toVersion?: string`
- `rows?: EvalRow[]`
- `log?: string[]`
- `onApprove?: (outcome: string) => void`
- `onEvent?: OnHxoEvent`

## scorecard.tsx

### RunScorecard

Human-in-the-loop audit review after a test run of an agent team. Scores the run from its telemetry events only.

- `run?: 'Paused mid-run' | 'Clean run' | 'Drifting'` (seeded test runs; ignored when `events` or `score` is given)
- `view?: 'Card' | 'Report'`
- `review?: 'Awaiting sign-off' | 'Signed off'`
- `events?: HxoEvent[]` (score a real run) or `score?: RunScore` (from `scoreRun`)
- `team?: string`, `summary?: string`, `reviewer?: string`, `signedAt?: string`
- `onSignOff?: (r: { verdict; decision: 'signed_off' | 'blocked'; note }) => void`
- `onSendToEvaluation?: (agent: string) => void`, `onRerun?: () => void`, `onEvent?: OnHxoEvent`

Internal score (how the agents worked together, weights): steps right the first time 40, hand-offs with all 7 Handoff Contract strands 20, mistakes caught before the claim went out 20, steps with no retry 20.
HXO experience score (what the person waiting on a result lived through): got the right result 30, resolved within 15 minutes 15, no avoidable work for the person 20, pauses honored 15, hand-backs with full context 20. A measure with no data is shown as Not tested and its weight is shared out.
Verdict: Not successful if any claim would go out wrong, any is still open, HXO < 70 or right results < 90%. Successful if internal ≥ 85, HXO ≥ 85 and avoidable person work (fixes, repeat questions, pauses) ≤ 10% of claims. Otherwise Successful with interventions. Agents are ranked by steps right the first time.

## run.ts

- `simulateRun(scenario, { pauses?, world?, person? })`: seeded test of the Claims Coder agent team (7 agents, 24 synthetic claims). Every random draw happens up front, so a pause added later never changes what happened before it.
- `scoreRun(events)`: the scoring above, from events alone. Works on any product that emits these events.
- `TEAM`, `STRANDS`, `HANDBACK_PARTS`, `clock(seconds)`.

## Telemetry

`onEvent(e: HxoEvent)` receives `{ event, t, component, agent?, action, actor, ...extra }`. Event names:

`understood_shown`, `clarify_asked`, `confidence_viewed`, `evidence_opened`, `trace_opened`, `preview_shown`, `preview_cancelled`, `approval_requested`, `decision_made`, `correction_made`, `undo`, `stop`, `agent_paused`, `switch_decision`, `handback_shown`, `handback_resolved`, `escalation_shown`, `agent_disagreement`, `audit_flagged`, `audit_reviewed`, `evaluation_decided`, `frustration_viewed`, `theme_opened`

Run events (added for the Run scorecard): `run_started`, `agent_step` (action `ok` | `retry` | `held`; `claim`, `start_s`, `dur_s`), `agent_handoff` (agent `[from, to]`; `strands`, `dropped`), `claim_resolved` (action `correct` | `corrected` | `wrong`; `secs`, `missed_from`), `run_completed`, `run_reviewed` (action `signed_off` | `blocked` | `sent_to_evaluation`). Simulated events also carry `s_offset`, seconds from the run start. A person's pause is `agent_paused` with actor `person`; the agent's confirmation is `agent_paused` with actor `agent`, action `idle` and `ack_secs`.

## Patterns

`src/patterns.tsx`: `ClaimsCoderReview` and `TeamChatHandBack`, composed only from kit components. They mirror the Figma Patterns page. `AgentTeamTestRun` plays a test run at 120×; its Pause control is live, and the run ends in the Run scorecard (Report view) scored from the events it emitted. It has no Figma frame yet.
