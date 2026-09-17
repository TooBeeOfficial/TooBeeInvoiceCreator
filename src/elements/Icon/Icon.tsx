/* Icons.

   Line drawings on a 24 grid, one weight, no fills — so they sit at the same
   optical weight as the text beside them and take the colour of whatever they
   are inside. Drawn here rather than pulled from a font or an emoji, because
   an invoice tool has to look the same on a machine that has never been
   online.

   An icon on its own is never a label: every icon-only control carries a
   real name for screen readers, which is why `title` exists below. */

import type { CSSProperties } from 'react'
import styles from './Icon.module.css'

export type IconName = keyof typeof PATHS

const PATHS = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  check: 'M4 12.5 9 17.5 20 6.5',
  close: 'M6 6l12 12M18 6L6 18',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  chevronRight: 'M9 6l6 6-6 6',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  arrowDown: 'M12 5v14M6 13l6 6 6-6',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
  folder: 'M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z',
  save: 'M5 5a2 2 0 0 1 2-2h9l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM8 3v6h7M8 14h8v6H8z',
  download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  printer: 'M7 9V4h10v5M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 15h10v6H7z',
  sheet: 'M4 4h16v16H4zM4 10h16M4 15h16M10 4v16',
  table: 'M4 5h16v14H4zM4 10h16M9 10v9',
  trash: 'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13M10 11v6M14 11v6',
  copy: 'M9 9h10v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z',
  users: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8',
  image: 'M4 5h16v14H4zM4 16l4.5-4.5 3 3L15 11l5 5M9.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  undo: 'M4 9h11a5 5 0 0 1 0 10h-5M4 9l4-4M4 9l4 4',
  redo: 'M20 9H9a5 5 0 0 0 0 10h5M20 9l-4-4M20 9l-4 4',
  zoomIn: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3M8 11h6M11 8v6',
  zoomOut: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3M8 11h6',
  fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  code: 'M9 18l-6-6 6-6M15 6l6 6-6 6',
  palette: 'M12 21a9 9 0 1 1 0-18c4.6 0 8 3 8 6.5 0 2.5-2 3.5-4 3.5h-1.5a1.75 1.75 0 0 0-1.2 3c.4.4.6.9.6 1.4 0 1-.8 1.6-1.9 1.6zM7.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM10.5 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM15 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  layout: 'M4 5h16v14H4zM4 10h16M10 10v9',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  alert: 'M12 4 2.5 20h19zM12 10v4M12 17.5v.5',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5v.5',
  /* Real circles, not hairline dashes with round caps. A `h.01` segment is
     a dot the width of the stroke — 0.9px at the size this is drawn — which
     antialiases away to nothing next to icons made of full-length lines. */
  more: 'M6.6 12a.6.6 0 1 1-1.2 0 .6.6 0 1 1 1.2 0M12.6 12a.6.6 0 1 1-1.2 0 .6.6 0 1 1 1.2 0M18.6 12a.6.6 0 1 1-1.2 0 .6.6 0 1 1 1.2 0',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  grip: 'M9.6 6a.6.6 0 1 1-1.2 0 .6.6 0 1 1 1.2 0M9.6 12a.6.6 0 1 1-1.2 0 .6.6 0 1 1 1.2 0M9.6 18a.6.6 0 1 1-1.2 0 .6.6 0 1 1 1.2 0M15.6 6a.6.6 0 1 1-1.2 0 .6.6 0 1 1 1.2 0M15.6 12a.6.6 0 1 1-1.2 0 .6.6 0 1 1 1.2 0M15.6 18a.6.6 0 1 1-1.2 0 .6.6 0 1 1 1.2 0',
  percent: 'M6 18 18 6M7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM16.5 18a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  send: 'M21 3 3 10.5l7 3 3 7z',
  mail: 'M4 6h16v12H4zM4 7l8 5.5L20 7',
  bank: 'M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  calendar: 'M4 6h16v15H4zM4 11h16M8 3v4M16 3v4',
  eye: 'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M17 10h.01M7 14h10',
} as const

export interface IconProps {
  name: IconName
  size?: number
  /** Names the icon for assistive tech. Leave unset when text sits beside it. */
  title?: string
  className?: string
  style?: CSSProperties
}

export function Icon ({ name, size = 16, title, className, style }: IconProps) {
  const path = PATHS[name]
  return (
    <svg
      className={[styles.icon, className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      style={style}
    >
      {title ? <title>{title}</title> : null}
      <path d={path} />
    </svg>
  )
}
