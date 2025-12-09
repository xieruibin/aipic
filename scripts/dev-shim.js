import { webcrypto } from 'crypto'
import path from 'path'
import url from 'url'

// Ensure global crypto for Vite webSocketToken
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto
}

// Resolve vite binary relative to this script
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const viteBin = path.resolve(__dirname, '../node_modules/vite/bin/vite.js')

// Run Vite dev server with same args
const args = process.argv.slice(2)
const { spawn } = await import('child_process')
const child = spawn(process.execPath, [viteBin, ...args], { stdio: 'inherit' })
child.on('exit', (code) => process.exit(code ?? 0))
