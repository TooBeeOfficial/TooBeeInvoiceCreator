/* Buttons.

   Four kinds, and the difference between them is how much attention they are
   entitled to: one primary action per view, quiet ones for everything
   ordinary, ghost for controls that live inside a toolbar, danger only for
   the actions that destroy something.

   A button says what it does — "Save invoice", not "Submit" — and keeps that
   word through the whole flow, so the thing that says "Export PDF" produces
   a message that says the PDF was exported. */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icon } from '@elements/Icon/Icon'
import type { IconName } from '@elements/Icon/Icon'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'quiet' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconName
  /** An icon after the label, for menus and disclosures. */
  trailingIcon?: IconName
  /** Fills the width of whatever it is in. */
  block?: boolean
  children?: ReactNode
}

export function Button ({
  variant = 'quiet',
  size = 'md',
  icon,
  trailingIcon,
  block = false,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    block ? styles.block : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} /> : null}
      {children ? <span className={styles.label}>{children}</span> : null}
      {trailingIcon ? <Icon name={trailingIcon} size={size === 'sm' ? 14 : 16} /> : null}
    </button>
  )
}
