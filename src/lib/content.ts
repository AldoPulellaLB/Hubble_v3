import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/* Flat JSON in-repo, read at build time — the CMS writes these files.
   See context/decisions.md for why this is not a hosted service. */
const dir = join(process.cwd(), 'content')

export function load<T>(name: string): T {
  return JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8')) as T
}
