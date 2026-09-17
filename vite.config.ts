import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

const at = (p: string) => fileURLToPath(new URL(p, import.meta.url))

/* The renderer's Content Security Policy.

   Without one Electron warns, and rightly: this window opens files that
   arrived from elsewhere. An invoice is JSON and a logo is a data URL, but a
   template carries markup and CSS that the user — or whoever sent them the
   file — wrote, and the code panel exists to let them write more.

   `script-src 'self'` is the line that matters. Nothing in this app needs to
   build code at runtime: the preview frame renders markup with scripting
   switched off, and so does the offscreen window that prints the PDF.

   `style-src` has to allow inline styles. React writes element style
   attributes, CodeMirror injects a stylesheet, and the preview frame is a
   srcdoc iframe, which inherits this policy and carries the template's own
   <style>. Inline style is a far smaller risk than inline script, and
   nothing here is worth breaking the preview for.

   Development is looser because Vite's hot reload needs eval and a
   websocket. That looseness never reaches a built app. */
function contentSecurityPolicy (dev: boolean): string {
  return [
    "default-src 'self'",
    dev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    dev ? "connect-src 'self' ws: wss: http://localhost:5173" : "connect-src 'self'",
    "frame-src 'self'",
    "media-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    /* frame-ancestors is deliberately absent: it is ignored when delivered in
       a meta element and only logs a complaint. Nothing embeds this window. */
  ].join('; ')
}

function cspPlugin (): Plugin {
  return {
    name: 'invoice-creator-csp',
    transformIndexHtml (html, context) {
      const dev = !!context.server
      return html.replace(
        '<head>',
        `<head>
    <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(dev)}" />`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), cspPlugin()],
  base: './',
  resolve: {
    alias: {
      '@core': at('./src/core'),
      '@model': at('./src/types'),
      '@elements': at('./src/elements'),
      '@components': at('./src/components'),
      '@store': at('./src/store'),
      '@templates': at('./src/templates'),
      '@pages': at('./src/pages'),
      '@styles': at('./src/styles'),
      '@hooks': at('./src/hooks'),
    },
  },
  css: {
    modules: {
      // predictable, readable class names in the inspector
      generateScopedName: '[name]__[local]__[hash:base64:4]',
    },
  },
  server: { port: 5173, strictPort: true },
  build: { outDir: 'dist', emptyOutDir: true, chunkSizeWarningLimit: 1400 },
})
