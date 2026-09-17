/* A button that is only an icon.

   The label is required, not optional. An icon-only control with no name is
   unusable with a screen reader and a guess with a mouse, so the label does
   double duty here: it names the button for assistive tech and becomes the
   tooltip for everyone else. */

import type { ButtonHTMLAttributes } from 'react'
import { Icon } from '@elements/Icon/Icon'
import type { IconName } from '@elements/Icon/Icon'
import styles from './IconButton.module.css'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon: IconName
  /** What this button does, said as an action: "Remove line". */
  label: string
  size?: 'sm' | 'md'
  tone?: 'default' | 'danger'
  active?: boolean
}

export function IconButton ({
  icon,
  label,
  size = 'md',
  tone = 'default',
  active = false,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const classes = [
    styles.button,
    styles[size],
    tone === 'danger' ? styles.danger : '',
    active ? styles.active : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} aria-label={label} title={label} aria-pressed={active || undefined} {...rest}>
      <Icon name={icon} size={size === 'sm' ? 14 : 16} />
    </button>
  )
}
