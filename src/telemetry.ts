/**
 * Telemetry envelope shared by every kit component (Figma page "Telemetry spec").
 * Events carry ids, not content. The product joins notes and spans only for approved training sets.
 */
export type Actor = 'person' | 'agent' | 'auditor';

export type HxoEventName =
  | 'understood_shown'
  | 'clarify_asked'
  | 'confidence_viewed'
  | 'evidence_opened'
  | 'trace_opened'
  | 'preview_shown'
  | 'preview_cancelled'
  | 'approval_requested'
  | 'decision_made'
  | 'correction_made'
  | 'undo'
  | 'stop'
  | 'agent_paused'
  | 'switch_decision'
  | 'handback_shown'
  | 'handback_resolved'
  | 'escalation_shown'
  | 'agent_disagreement'
  | 'audit_flagged'
  | 'audit_reviewed'
  | 'evaluation_decided'
  | 'frustration_viewed'
  | 'theme_opened';

export interface HxoEvent {
  /** Event name from the Telemetry spec. */
  event: HxoEventName;
  /** ISO time, client clock. */
  t: string;
  /** Kit component that emitted the event, e.g. "Act/Approval card". */
  component: string;
  /** Agent id, "all", or an array for agent-to-agent events. */
  agent?: string | string[];
  action: string;
  actor: Actor;
  [extra: string]: unknown;
}

export type OnHxoEvent = (e: HxoEvent) => void;

export function emit(
  onEvent: OnHxoEvent | undefined,
  event: HxoEventName,
  component: string,
  fields: { action: string; actor: Actor; agent?: string | string[]; [extra: string]: unknown },
): void {
  if (!onEvent) return;
  onEvent({ ...fields, event, t: new Date().toISOString(), component, action: fields.action, actor: fields.actor });
}
