#!/bin/bash
# Documentation Lookup Helper for Driplo
# Usage: ./docs/doc-lookup.sh <pattern> [file]

if [ $# -eq 0 ]; then
    echo "Usage: $0 <search_pattern> [file]"
    echo ""
    echo "Files available:"
    echo "  svelte5  - Search docs/svelte5-runes-guide.md (quick reference)"
    echo "  kit2     - Search docs/sveltekit2-patterns.md (quick reference)"
    echo "  llms     - Search llms.txt (full Svelte 5 docs)"
    echo "  kit      - Search llms-kit.txt (full SvelteKit docs)"
    echo "  cli      - Search llms-cli.txt (CLI docs)"
    echo "  all      - Search all documentation files"
    echo ""
    echo "Common patterns:"
    echo "  $0 '\$state' svelte5    # Find state management patterns"
    echo "  $0 'load.*function' kit2    # Find load function patterns"
    echo "  $0 'error.*handling' all    # Find error handling across all docs"
    exit 1
fi

PATTERN="$1"
FILE="${2:-all}"

case "$FILE" in
    "svelte5")
        echo "=== Searching docs/svelte5-runes-guide.md ==="
        grep -n -i -C 2 "$PATTERN" docs/svelte5-runes-guide.md || echo "No matches found"
        ;;
    "kit2")
        echo "=== Searching docs/sveltekit2-patterns.md ==="
        grep -n -i -C 2 "$PATTERN" docs/sveltekit2-patterns.md || echo "No matches found"
        ;;
    "llms")
        echo "=== Searching llms.txt (Svelte 5 full docs) ==="
        grep -n -i -C 2 "$PATTERN" llms.txt | head -50 || echo "No matches found"
        ;;
    "kit")
        echo "=== Searching llms-kit.txt (SvelteKit full docs) ==="
        grep -n -i -C 2 "$PATTERN" llms-kit.txt | head -50 || echo "No matches found"
        ;;
    "cli")
        echo "=== Searching llms-cli.txt ==="
        grep -n -i -C 2 "$PATTERN" llms-cli.txt || echo "No matches found"
        ;;
    "all")
        echo "=== Searching all documentation files ==="
        echo ""
        echo "--- Quick References ---"
        grep -n -i -C 1 "$PATTERN" docs/svelte5-runes-guide.md docs/sveltekit2-patterns.md 2>/dev/null | head -20
        echo ""
        echo "--- Full Documentation (limited results) ---"
        grep -n -i -C 1 "$PATTERN" llms*.txt 2>/dev/null | head -30
        ;;
    *)
        echo "Unknown file: $FILE"
        echo "Use: svelte5, kit2, llms, kit, cli, or all"
        exit 1
        ;;
esac