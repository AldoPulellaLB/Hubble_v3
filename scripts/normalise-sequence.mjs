/**
 * Normalise a hero frame folder to the loader's naming contract.
 *
 *   node scripts/normalise-sequence.mjs public/sequence/desktop [--dry]
 *
 * `SequenceHero` requests `frame_${i.padStart(3,'0')}.webp` for i from 0 to
 * frames-1, so a folder has to be **zero-based, three-digit and contiguous**.
 * Render tools rarely agree with that: the 2026-08-25 desktop export arrived as
 * `frame_01 … frame_09`, `frame_010 … frame_099`, `frame_0100 … frame_0422` —
 * a literal `frame_0` prefix plus the natural number, one-based. Under that
 * naming the loader misses frame 0 entirely, never fires `ready`, and the hero
 * sits on its poster behind a loader that never finishes.
 *
 * This reads whatever integers the filenames carry, sorts them numerically and
 * renames in order. It does not care what the input convention was, and running
 * it on an already-normalised folder is a no-op.
 *
 * Renaming happens in two passes via a temporary prefix. A single pass would
 * clobber: `frame_010.webp` (frame 10) wants to become `frame_009.webp`, while
 * a `frame_009.webp` may still exist as somebody else's source.
 */
import { readdir, rename } from 'node:fs/promises'
import { join } from 'node:path'

const [dir, ...flags] = process.argv.slice(2)
const dry = flags.includes('--dry')

if (!dir) {
  console.error('usage: node scripts/normalise-sequence.mjs <folder> [--dry]')
  process.exit(1)
}

const files = (await readdir(dir)).filter((f) => /\.webp$/i.test(f))
const numbered = files
  .map((name) => {
    const digits = name.match(/(\d+)(?=\.webp$)/i)
    return digits ? { name, n: Number(digits[1]) } : null
  })
  .filter(Boolean)
  .sort((a, b) => a.n - b.n)

if (numbered.length !== files.length) {
  console.error(`${files.length - numbered.length} file(s) carry no frame number — aborting.`)
  process.exit(1)
}

const target = (i) => `frame_${String(i).padStart(3, '0')}.webp`
const moves = numbered
  .map((f, i) => ({ from: f.name, to: target(i) }))
  .filter((m) => m.from !== m.to)

console.log(`${dir}: ${numbered.length} frames, ${moves.length} to rename`)
if (!moves.length) { console.log('already normalised.'); process.exit(0) }
console.log(`  ${moves[0].from} -> ${moves[0].to}`)
console.log(`  ${moves.at(-1).from} -> ${moves.at(-1).to}`)

if (dry) { console.log('dry run, nothing written.'); process.exit(0) }

for (const m of moves) await rename(join(dir, m.from), join(dir, `.tmp-${m.to}`))
for (const m of moves) await rename(join(dir, `.tmp-${m.to}`), join(dir, m.to))

console.log(`renamed ${moves.length} files. frames = ${numbered.length}`)
