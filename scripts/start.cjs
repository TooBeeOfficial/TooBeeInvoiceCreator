/* Launches Electron with a clean environment.

   Some terminals (VS Code tasks, CI runners, agent shells) export
   ELECTRON_RUN_AS_NODE=1, which makes the electron binary behave as plain
   Node — `app` comes back undefined and the window never opens. Stripping it
   here means `npm run dev` works the same everywhere. */

const { spawn } = require('node:child_process')
const path = require('node:path')
const electron = require('electron')

const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const child = spawn(electron, [path.join(__dirname, '..'), ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
})

child.on('close', (code) => process.exit(code ?? 0))
