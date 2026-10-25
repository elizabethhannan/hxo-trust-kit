import { useEffect, useRef, useState } from 'react';
import type { OnHxoEvent, HxoEventName, Actor } from './telemetry';
import { emit } from './telemetry';

/** True when the person asked the system to reduce motion. */
export function usePrefersReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(query).matches);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(query);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Resolves the Motion variant: an explicit "Off" or the system setting turns motion off. */
export function useMotion(motion: 'On' | 'Off' | undefined): 'On' | 'Off' {
  const reduced = usePrefersReducedMotion();
  if (motion === 'Off' || reduced) return 'Off';
  return 'On';
}

/** Emit an event once when a component mounts in a given state. */
export function useEmitOnce(
  onEvent: OnHxoEvent | undefined,
  enabled: boolean,
  event: HxoEventName,
  component: string,
  fields: { agent?: string | string[]; action: string; actor: Actor; [k: string]: unknown },
): void {
  const done = useRef(false);
  useEffect(() => {
    if (!enabled || done.current) return;
    done.current = true;
    emit(onEvent, event, component, fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
