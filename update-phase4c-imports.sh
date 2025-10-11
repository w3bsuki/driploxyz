#!/bin/bash

# Comprehensive Phase 4C Import Update Script (Bash Version)
# Updates all import statements after the restructure

set -euo pipefail

# Configuration
PROJECT_ROOT="${1:-K:/driplo-turbo-1}"
WEB_SRC_PATH="$PROJECT_ROOT/apps/web/src"
LOG_PATH="$PROJECT_ROOT/phase4c-comprehensive-import-updates.log"
DRY_RUN=${DRY_RUN:-false}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
WHITE='\033[1;37m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Counters
TOTAL_FILES=0
UPDATED_FILES=0
SKIPPED_FILES=0
ERROR_FILES=0

# Logging function
log() {
    local message="$1"
    local level="${2:-INFO}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_PATH"
    if [[ "$level" == "ERROR" ]]; then
        echo -e "${RED}$message${NC}" >&2
    elif [[ "$level" == "WARN" ]]; then
        echo -e "${YELLOW}$message${NC}" >&2
    fi
}

# Update file function
update_file_imports() {
    local file_path="$1"
    local description="$2"
    shift 2
    local replacements=("$@")

    try {
        ((TOTAL_FILES++))

        if [[ ! -f "$file_path" ]]; then
            log "File not found: $file_path" "WARN"
            ((SKIPPED_FILES++))
            return
        fi

        local original_content
        original_content=$(cat "$file_path")
        local updated_content="$original_content"
        local has_changes=false
        local applied_replacements=()

        # Apply all replacements
        for i in "${!replacements[@]}"; do
            if ((i % 2 != 0)); then continue; fi  # Skip odd indices (replacements)
            local pattern="${replacements[$i]}"
            local replacement="${replacements[$((i+1))]}"

            if echo "$updated_content" | grep -q "$pattern"; then
                # Use sed for replacement
                updated_content=$(echo "$updated_content" | sed "s|$pattern|$replacement|g")
                has_changes=true
                applied_replacements+=("$replacement")
            fi
        done

        if [[ "$has_changes" == true ]]; then
            if [[ "$DRY_RUN" == "true" ]]; then
                echo -e "  ${CYAN}[DRY RUN] Would update: $file_path${NC}"
                for replace in "${applied_replacements[@]}"; do
                    echo -e "    ${GRAY}→ $replace${NC}"
                done
            else
                # Backup original file
                cp "$file_path" "$file_path.backup"

                # Write updated content
                echo "$updated_content" > "$file_path"

                echo -e "  ${GREEN}✅ Updated: $file_path${NC}"
                for replace in "${applied_replacements[@]}"; do
                    echo -e "    ${GRAY}→ $replace${NC}"
                done

                ((UPDATED_FILES++))
                log "Updated imports in $file_path: $(IFS=', '; echo "${applied_replacements[*]}")"
            fi
        else
            ((SKIPPED_FILES++))
        fi
    } catch {
        ((ERROR_FILES++))
        log "Error processing $file_path: $1" "ERROR"
        echo -e "  ${RED}❌ Error: $file_path${NC}" >&2
    }
}

# Main execution
main() {
    echo -e "${CYAN}🔄 Comprehensive Phase 4C Import Update Script${NC}"
    echo -e "${GRAY}Project Root: $PROJECT_ROOT${NC}"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${YELLOW}Mode: DRY RUN${NC}"
    else
        echo -e "${GREEN}Mode: LIVE UPDATE${NC}"
    fi
    echo

    log "Starting comprehensive Phase 4C import updates"

    # Clear log file
    > "$LOG_PATH"

    log "Processing project root: $PROJECT_ROOT"

    # 1. Update modular component imports in messages route
    echo -e "${MAGENTA}📦 1. Updating modular component imports in messages route...${NC}"

    local messages_files=(
        "$WEB_SRC_PATH/routes/(protected)/messages/ModularMessages.svelte"
        "$WEB_SRC_PATH/routes/(protected)/messages/+page.svelte"
        "$WEB_SRC_PATH/routes/(protected)/messages/new/+page.svelte"
    )

    local modular_replacements=(
        "from ['\"]\\\$lib/components/modular/ChatWindow\\.svelte['\"]" "from './components/ChatWindow.svelte'"
        "from ['\"]\\\$lib/components/modular/ConversationSidebar\\.svelte['\"]" "from './components/ConversationSidebar.svelte'"
        "from ['\"]\\\$lib/components/modular/ConnectionStatus\\.svelte['\"]" "from './components/ConnectionStatus.svelte'"
        "import ChatWindow from ['\"]\\\$lib/components/modular/ChatWindow\\.svelte['\"]" "import ChatWindow from './components/ChatWindow.svelte'"
        "import ConversationSidebar from ['\"]\\\$lib/components/modular/ConversationSidebar\\.svelte['\"]" "import ConversationSidebar from './components/ConversationSidebar.svelte'"
        "import ConnectionStatus from ['\"]\\\$lib/components/modular/ConnectionStatus\\.svelte['\"]" "import ConnectionStatus from './components/ConnectionStatus.svelte'"
    )

    for file in "${messages_files[@]}"; do
        if [[ -f "$file" ]]; then
            echo -e "${WHITE}Processing messages file: $(basename "$file")${NC}"
            update_file_imports "$file" "Modular components in messages" "${modular_replacements[@]}"
        else
            log "Messages file not found: $file" "WARN"
        fi
    done

    # 2. Update Header, RealtimeErrorBoundary, RegionSwitchModal imports in root layout
    echo -e "${MAGENTA}🎨 2. Updating Header, RealtimeErrorBoundary, RegionSwitchModal imports...${NC}"

    local root_layout_files=(
        "$WEB_SRC_PATH/routes/+layout.svelte"
    )

    local root_layout_replacements=(
        "from ['\"]\\\$lib/components/Header\\.svelte['\"]" "from './components/Header.svelte'"
        "from ['\"]\\\$lib/components/RealtimeErrorBoundary\\.svelte['\"]" "from './components/RealtimeErrorBoundary.svelte'"
        "from ['\"]\\\$lib/components/RegionSwitchModal\\.svelte['\"]" "from './components/RegionSwitchModal.svelte'"
        "import Header from ['\"]\\\$lib/components/Header\\.svelte['\"]" "import Header from './components/Header.svelte'"
        "import RealtimeErrorBoundary from ['\"]\\\$lib/components/RealtimeErrorBoundary\\.svelte['\"]" "import RealtimeErrorBoundary from './components/RealtimeErrorBoundary.svelte'"
        "import RegionSwitchModal from ['\"]\\\$lib/components/RegionSwitchModal\\.svelte['\"]" "import RegionSwitchModal from './components/RegionSwitchModal.svelte'"
    )

    for file in "${root_layout_files[@]}"; do
        if [[ -f "$file" ]]; then
            echo -e "${WHITE}Processing root layout: $(basename "$file")${NC}"
            update_file_imports "$file" "Root layout components" "${root_layout_replacements[@]}"
        else
            log "Root layout file not found: $file" "WARN"
        fi
    done

    # 3. Update server imports across all files
    echo -e "${MAGENTA}🖥️ 3. Updating server imports...${NC}"

    # Find all TypeScript and Svelte files
    local all_files
    readarray -t all_files < <(find "$WEB_SRC_PATH" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.svelte" \) ! -path "*backup*" ! -path "*node_modules*")

    echo -e "${GRAY}Found ${#all_files[@]} files to check for server imports...${NC}"

    local server_replacements=(
        # env/ directory moves
        "from ['\"]\\\$lib/env/" "from '\$lib/server/env/"
        # supabase/server moves
        "from ['\"]\\\$lib/supabase/server['\"]" "from '\$lib/server/supabase/server'"
        # middleware/ directory moves
        "from ['\"]\\\$lib/middleware/" "from '\$lib/server/middleware/"
        # analytics/ directory moves
        "from ['\"]\\\$lib/analytics/" "from '\$lib/server/analytics/"
        # monitoring/ directory moves
        "from ['\"]\\\$lib/monitoring/" "from '\$lib/server/monitoring/"
        # security/ directory moves
        "from ['\"]\\\$lib/security/" "from '\$lib/server/security/"
        # utils/rate-limiting moves
        "from ['\"]\\\$lib/utils/rate-limiting['\"]" "from '\$lib/server/utils/rate-limiting'"
        "from ['\"]\\\$lib/utils/rate-limiting\\.ts['\"]" "from '\$lib/server/utils/rate-limiting'"
        # utils/payments moves
        "from ['\"]\\\$lib/utils/payments['\"]" "from '\$lib/server/utils/payments'"
        "from ['\"]\\\$lib/utils/payments\\.ts['\"]" "from '\$lib/server/utils/payments'"
        # cache.ts moves
        "from ['\"]\\\$lib/cache['\"]" "from '\$lib/server/utils/cache'"
        "from ['\"]\\\$lib/cache\\.ts['\"]" "from '\$lib/server/utils/cache'"
        # jobs/ directory moves
        "from ['\"]\\\$lib/jobs/" "from '\$lib/server/jobs/"
        # cookies/ directory moves
        "from ['\"]\\\$lib/cookies/" "from '\$lib/server/cookies/"
    )

    for file in "${all_files[@]}"; do
        local relative_path="${file#$WEB_SRC_PATH/}"
        local content
        content=$(cat "$file")
        local has_server_imports=false

        # Check if file contains any server imports before processing
        for pattern in "${server_replacements[@]}"; do
            if ((i % 2 != 0)); then continue; fi  # Skip odd indices
            if echo "$content" | grep -q "$pattern"; then
                has_server_imports=true
                break
            fi
        done

        if [[ "$has_server_imports" == true ]]; then
            update_file_imports "$file" "Server imports" "${server_replacements[@]}"
        else
            ((SKIPPED_FILES++))
        fi
    done

    # 4. Fix core package import paths
    echo -e "${MAGENTA}📚 4. Fixing core package import paths...${NC}"

    local core_import_replacements=(
        "from ['\"]@repo/core/services/products['\"]" "from '@repo/domain/products'"
        "from ['\"]@repo/core/services/ConversationService['\"]" "from '@repo/domain/conversations'"
    )

    for file in "${all_files[@]}"; do
        local content
        content=$(cat "$file")
        local has_core_imports=false

        # Check if file contains any core imports before processing
        for pattern in "${core_import_replacements[@]}"; do
            if ((i % 2 != 0)); then continue; fi  # Skip odd indices
            if echo "$content" | grep -q "$pattern"; then
                has_core_imports=true
                break
            fi
        done

        if [[ "$has_core_imports" == true ]]; then
            local relative_path="${file#$WEB_SRC_PATH/}"
            update_file_imports "$file" "Core package imports" "${core_import_replacements[@]}"
        fi
    done

    # 5. Summary
    echo -e "${CYAN}📊 Summary${NC}"
    echo -e "${WHITE}Total files processed: $TOTAL_FILES${NC}"
    echo -e "${GREEN}Files updated: $UPDATED_FILES${NC}"
    echo -e "${YELLOW}Files skipped (no changes needed): $SKIPPED_FILES${NC}"
    echo -e "${RED}Files with errors: $ERROR_FILES${NC}"

    if [[ "$DRY_RUN" == "true" ]]; then
        echo
        echo -e "${CYAN}💡 This was a DRY RUN. No files were actually modified.${NC}"
        echo -e "${GRAY}   Run without DRY_RUN=true to apply the changes.${NC}"
    else
        echo
        echo -e "${GREEN}✅ Import updates completed successfully!${NC}"
        echo -e "${GRAY}   Log file saved to: $LOG_PATH${NC}"
        echo -e "${GRAY}   Backup files created with .backup extension${NC}"

        echo
        echo -e "${MAGENTA}🎯 Next steps:${NC}"
        echo -e "${WHITE}1. Run 'pnpm run check' in apps/web to verify TypeScript compilation${NC}"
        echo -e "${WHITE}2. Run 'pnpm run lint' in apps/web to check for linting issues${NC}"
        echo -e "${WHITE}3. Test the application to ensure all imports work correctly${NC}"
        echo -e "${GRAY}4. Remove .backup files if everything is working correctly${NC}"
    fi

    log "Phase 4C comprehensive import updates completed. Total: $TOTAL_FILES, Updated: $UPDATED_FILES, Skipped: $SKIPPED_FILES, Errors: $ERROR_FILES"
}

# Error handling wrapper
try() {
    "$@"
}
catch() {
    ERROR_FILES=$((ERROR_FILES + 1))
    log "Command failed: $*" "ERROR"
    echo -e "${RED}❌ Command failed: $*${NC}" >&2
}

# Run main function
main "$@"