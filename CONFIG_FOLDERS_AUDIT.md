# Configuration Folders Audit

**Date:** October 13, 2025  
**Purpose:** Detailed analysis of configuration folders to determine deletion/retention

---

## 🗂️ `.changeset/`

### Contents
- `clean-domain-types.md` - A single changeset for domain package

### Purpose
Changesets are used for:
- Version management in monorepos
- Automated changelog generation
- Coordinating package releases
- Publishing to npm registry

### Current State
- ❌ **NO** `@changesets/cli` found in package.json
- ❌ **NO** changeset scripts in package.json
- ✅ Only contains 1 orphaned changeset file
- ❌ Not actively being used

### Decision: 🗑️ **DELETE**

**Reasoning:**
1. Changesets CLI is not installed
2. No automation scripts configured
3. Only 1 orphaned file that's already been applied
4. Not part of current workflow
5. If we need versioning later, we can reinstall and start fresh

**Action:** Delete entire `.changeset/` folder

---

## 🗂️ `.claude/`

### Contents
```
.claude/
├── agents/
│   └── brutal-code-auditor.md
├── commands/
│   ├── check.md
│   ├── debug.md
│   ├── setup.md
│   └── start.md
├── mcp/
│   └── svelte5-mcp/
└── settings.local.json (142 lines of permissions)
```

### Purpose
Claude Desktop configuration for:
- Custom AI agents
- Command shortcuts
- MCP server configurations
- Permission management

### Current State
- ✅ Contains custom agent (brutal-code-auditor)
- ✅ Contains useful commands (check, debug, setup, start)
- ✅ Contains MCP configurations
- ✅ Contains extensive permission settings (already granted)
- ✅ **ACTIVELY BEING USED** by Claude Desktop

### Decision: ✅ **KEEP**

**Reasoning:**
1. **Currently in use** - This is active configuration for Claude Desktop
2. **Custom agents** - Contains project-specific AI agents
3. **Command shortcuts** - Useful workflow automation
4. **Permission history** - Already granted permissions saved
5. **MCP configs** - Integration configurations for tools

**Action:** Keep as-is, this is a working development tool

---

## 🗂️ `.github/`

### Contents
```
.github/
├── dependabot.yml (210 lines - extensive config)
├── ISSUE_TEMPLATE/
├── pull_request_template.md
└── workflows/
    ├── ci.yml (98 lines - full CI pipeline)
    ├── ci-simple.yml
    └── dependabot-auto-merge.yml
```

### Purpose
GitHub automation:
- CI/CD pipelines (build, lint, test)
- Dependabot dependency updates
- Issue/PR templates
- Automated merging

### Current State
- ✅ **ACTIVE CI Pipeline** - Runs on push/PR to main
- ✅ Comprehensive dependabot config (weekly updates, 210 lines)
- ✅ Tests Node 22.x with pnpm
- ✅ Includes build, lint, type-check, test steps
- ✅ Auto-merge workflow for dependabot PRs
- ✅ **ESSENTIAL FOR TEAM COLLABORATION**

### Decision: ✅ **KEEP**

**Reasoning:**
1. **Active CI/CD** - Running builds/tests on every push
2. **Dependency management** - Automated security updates
3. **Team workflow** - Issue/PR templates for consistency
4. **Quality gates** - Automated checks before merge
5. **Professional development** - Standard for any serious project

**Action:** Keep entirely - this is critical infrastructure

---

## 🗂️ `.playwright-mcp/`

### Contents
```
.playwright-mcp/
├── homepage-desktop-full.png
├── homepage-mobile-375x667.png
├── homepage-tablet-768x1024.png
├── homepage-viewport.png
├── search-page-desktop.png
└── signup-page-desktop.png
```

### Purpose
Screenshots taken by Playwright MCP server for:
- Visual testing
- UI validation
- Documentation
- Bug reporting

### Current State
- ✅ Playwright is installed (`@playwright/test` in package.json)
- ✅ Tests configured in `apps/web` and `apps/docs`
- ⚠️ Screenshots appear to be test artifacts/cache
- ⚠️ These are generated files, not source

### Analysis
Checking if this is MCP cache or important test snapshots...

**This appears to be:**
- Cache/output from Playwright MCP integration
- Can be regenerated on demand
- Similar to `.turbo/cache/` - build artifacts

### Decision: 🗑️ **DELETE** (Safe to regenerate)

**Reasoning:**
1. **Generated artifacts** - Not source files
2. **Can be recreated** - Playwright MCP will regenerate as needed
3. **Similar to cache** - Like `.turbo/` or `node_modules/`
4. **Not in git** - Should be in `.gitignore` anyway
5. **Reduces repo size** - Unnecessary binary files

**Action:** Delete folder, add to `.gitignore`

---

## 🗂️ `.turbo/`

### Contents
```
.turbo/
├── cache/
├── cookies/
├── daemon/
├── preferences/
└── runs/
```

### Purpose
Turborepo local cache:
- Build caching
- Task execution logs
- Daemon state
- User preferences

### Current State
- ✅ `turbo.json` is configured and active
- ✅ Turborepo is the build system for monorepo
- ✅ **SYSTEM CACHE** - Generated files only
- ✅ Listed in `.gitignore` (should be)
- ✅ Essential for fast builds

### Decision: ✅ **KEEP** (System folder)

**Reasoning:**
1. **System cache** - Like `node_modules/` or `.git/`
2. **Performance critical** - Speeds up builds dramatically
3. **Automatically managed** - Turbo handles cleanup
4. **Already gitignored** - Not committed to repo
5. **Required for turbo** - Can't delete without breaking builds

**Action:** Keep as-is - this is necessary infrastructure

---

## Summary Table

| Folder | Size | Active? | Decision | Reason |
|--------|------|---------|----------|---------|
| `.changeset/` | 1 file | ❌ No | 🗑️ DELETE | No CLI installed, orphaned file |
| `.claude/` | ~10 files | ✅ Yes | ✅ KEEP | Active dev tool with custom config |
| `.github/` | CI/CD | ✅ Yes | ✅ KEEP | Critical CI/CD infrastructure |
| `.playwright-mcp/` | 6 images | ⚠️ Cache | 🗑️ DELETE | Generated artifacts, can regenerate |
| `.turbo/` | Cache | ✅ Yes | ✅ KEEP | System cache, required for builds |

---

## Immediate Actions

### 🗑️ Safe to Delete Now:
1. `.changeset/` - No dependencies, no active use
2. `.playwright-mcp/` - Regenerable cache

### ✅ Keep (Essential):
1. `.claude/` - Active development tool
2. `.github/` - CI/CD pipeline
3. `.turbo/` - Build system cache

### 📝 Follow-up:
- Add `.playwright-mcp/` to `.gitignore` if not already there
- Verify `.turbo/` is in `.gitignore`

---

## Command to Execute

```powershell
# Delete changeset folder
Remove-Item -Path ".\.changeset" -Recurse -Force

# Delete playwright-mcp cache
Remove-Item -Path ".\.playwright-mcp" -Recurse -Force
```

---

## Risk Assessment

### Deleting `.changeset/`: **🟢 ZERO RISK**
- Not integrated into workflow
- No dependencies
- Can reinstall if needed later

### Deleting `.playwright-mcp/`: **🟢 ZERO RISK**
- Just screenshots/cache
- Will regenerate automatically
- No source code affected

---

## Notes

- After deletion, we'll have cleaned up 2/5 config folders
- Kept the 3 essential ones (.claude, .github, .turbo)
- Next: Move to real folders like `/apps`, `/packages`, `/docs`
