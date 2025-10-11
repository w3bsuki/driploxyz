#!/bin/bash

# Phase 4B Import Fix Script
# This script fixes all imports after domain package restructure

set -e

echo "🔧 Phase 4B: Domain Package Import Fix Script"
echo "=========================================="

ROOT_DIR="K:\driplo-turbo-1"
DOMAIN_DIR="$ROOT_DIR/packages/domain"

# Function to fix imports in a file
fix_imports_in_file() {
    local file="$1"
    local temp_file=$(mktemp)

    # Skip if file doesn't exist
    if [[ ! -f "$file" ]]; then
        return
    fi

    # Copy original to temp
    cp "$file" "$temp_file"

    # Fix import patterns
    sed -i.bak \
        -e "s|from '@repo/domain/services/products'|from '@repo/domain/products'|g" \
        -e "s|from '@repo/domain/services/orders'|from '@repo/domain/orders'|g" \
        -e "s|from '@repo/domain/services/profiles'|from '@repo/domain/users'|g" \
        -e "s|from '@repo/domain/services/payments'|from '@repo/domain/payments'|g" \
        -e "s|from '@repo/domain/services/messaging'|from '@repo/domain/shared'|g" \
        -e "s|from '@repo/domain/types'|from '@repo/domain/shared'|g" \
        -e "s|from '@repo/domain/validation'|from '@repo/domain/shared'|g" \
        -e "s|from '@repo/domain/adapters'|# TODO: Remove or update to application layer|g" \
        -e "s|from '@repo/domain'|# TODO: Update to specific domain import|g" \
        "$temp_file"

    # Check if changes were made
    if ! cmp -s "$file" "$temp_file"; then
        echo "✅ Fixed imports in: $file"
        mv "$temp_file" "$file"
        rm -f "$file.bak"
    else
        rm -f "$temp_file"
        rm -f "$file.bak"
    fi
}

# Function to recursively fix imports in directory
fix_imports_in_dir() {
    local dir="$1"
    echo "🔍 Fixing imports in directory: $dir"

    find "$dir" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.svelte" \) | while read file; do
        # Skip node_modules, dist, .svelte-kit, build directories
        if [[ "$file" =~ node_modules|dist|\.svelte-kit|build ]]; then
            continue
        fi
        fix_imports_in_file "$file"
    done
}

echo ""
echo "📦 Step 1: Fix domain internal imports"
echo "======================================="

# Fix imports in domain package
find "$DOMAIN_DIR/src" -name "*.ts" | while read file; do
    fix_imports_in_file "$file"
done

echo ""
echo "🌐 Step 2: Fix imports in apps"
echo "============================="

# Fix imports in apps directory
if [[ -d "$ROOT_DIR/apps" ]]; then
    fix_imports_in_dir "$ROOT_DIR/apps"
fi

echo ""
echo "📚 Step 3: Fix imports in packages"
echo "==============================="

# Fix imports in packages directory (excluding domain)
find "$ROOT_DIR/packages" -maxdepth 1 -type d | while read package_dir; do
    if [[ "$package_dir" != "$DOMAIN_DIR" && "$package_dir" != "$ROOT_DIR/packages" ]]; then
        fix_imports_in_dir "$package_dir"
    fi
done

echo ""
echo "🔧 Step 4: Fix main index.ts imports"
echo "================================="

# Fix the main index.ts if it has old import patterns
if [[ -f "$DOMAIN_DIR/src/index.ts" ]]; then
    fix_imports_in_file "$DOMAIN_DIR/src/index.ts"
fi

echo ""
echo "✅ Import fixing completed!"
echo ""
echo "📊 Summary of changes:"
echo "===================="
echo "- Fixed @repo/domain/services/* imports to @repo/domain/*"
echo "- Updated @repo/domain/types to @repo/domain/shared"
echo "- Updated @repo/domain/validation to @repo/domain/shared"
echo "- Marked @repo/domain/adapters imports for manual review"
echo ""
echo "🔍 NEXT STEPS:"
echo "1. Test domain package build: cd packages/domain && pnpm run build"
echo "2. Test monorepo build: cd K:/driplo-turbo-1 && pnpm run build"
echo "3. Test dev server: pnpm --filter @repo/web dev"
echo "4. Manual review of any remaining import issues"
echo ""
echo "⚠️  MANUAL REVIEW REQUIRED:"
echo "- Check for any remaining @repo/domain/adapters imports"
echo "- Verify all @repo/domain imports are working correctly"
echo "- Update any TODO comments added by this script"