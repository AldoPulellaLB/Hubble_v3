#!/bin/sh
# Undo the savings-drawer concept: restore the one modified file, delete the new ones.
S="/Users/aldo/Documents/Claude/Hubble 2026/the repo root"
D="$(dirname "$0")"
cp "$D/layout.tsx" "$S/src/app/layout.tsx"
rm -f "$S/src/components/SavingsStage.tsx" \
      "$S/src/components/SavingsStage.module.css" \
      "$S/src/components/sections/SavingsCalculator.tsx" \
      "$S/src/components/sections/SavingsCalculator.module.css"
echo "reverted"
