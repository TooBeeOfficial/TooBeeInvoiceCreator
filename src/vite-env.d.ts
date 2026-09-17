/// <reference types="vite/client" />

/* Brings in Vite's own declarations, which is where `*.module.css` gets its
   type — an object of class names, so `styles.button` is checked rather than
   being `any`. The desktop bridge's global declaration lives in types/bridge.ts
   and is picked up from the same compilation. */

import '@model/bridge'
