import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../hooks';

/** Control/Button. Primary for the one recommended action; Destructive only with the destructive Approval card; Agent for an action an agent proposes. */
export type ButtonStyle = 'Primary' | 'Secondary' | 'Ghost' | 'Destructive' | 'Agent';
export type ButtonState = 'Default' | 'Focus' | 'Disabled';
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  variant?: ButtonStyle;
  /** Forces a visual state for documentation. In use, focus comes from the keyboard and Disabled from `disabled`. */
  state?: ButtonState;
  block?: boolean;
  children: ReactNode;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'Primary', state = 'Default', block, className, disabled, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      {...rest}
      disabled={disabled || state === 'Disabled'}
      data-state={state}
      className={cx('hxo-btn', `hxo-btn--${variant.toLowerCase()}`, block && 'hxo-btn--block', className)}
    >
      {children}
    </button>
  );
});

/** Agent/Actor badge. Shows who acted. Purple for agents, neutral for people, inverse for security agents. Always paired with a name. */
export type Actor = 'Agent' | 'Human' | 'Security';
export function ActorBadge({ actor = 'Agent', name = 'Coding agent' }: { actor?: Actor; name?: string }) {
  const cls = actor === 'Agent' ? 'hxo-pill--agent' : actor === 'Human' ? 'hxo-badge--human' : 'hxo-badge--security';
  const label = actor === 'Agent' ? 'Agent' : actor === 'Human' ? 'Person' : 'Security agent';
  return (
    <span className={cx('hxo-pill', cls)} title={`${label}: ${name}`}>
      <span className="hxo-sr">{label}: </span>
      {name}
    </span>
  );
}

/** Status/Pill. A dot and words, never color alone. Warning and Critical carry the time left in the label. */
export type Tone = 'Neutral' | 'Agent' | 'Info' | 'Success' | 'Warning' | 'Critical';
export function StatusPill({ tone = 'Neutral', label = 'Routine' }: { tone?: Tone; label?: string }) {
  return <span className={cx('hxo-pill', `hxo-pill--${tone.toLowerCase()}`)}>{label}</span>;
}
