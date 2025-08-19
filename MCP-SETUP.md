# MCP (Model Context Protocol) Setup for Driplo

This project uses MCP servers to enhance Claude's capabilities for development.

## Configured MCP Servers

### 1. Supabase MCP Server
- **Purpose**: Direct database operations, migrations, and Supabase management
- **Package**: `@supabase/mcp-server-supabase`
- **Features**:
  - Execute SQL queries
  - Apply migrations
  - Manage branches
  - Check logs and advisors
  - Generate TypeScript types

### 2. Playwright MCP Server
- **Purpose**: Browser automation and E2E testing
- **Package**: `@playwright/mcp@latest`
- **Features**:
  - Automate browser interactions
  - Take screenshots
  - Generate test code
  - Web scraping
  - Execute JavaScript in browser context

### 3. Svelte Docs MCP Server
- **Purpose**: Access to Svelte 5 documentation and best practices
- **Package**: `mcp-svelte-docs`
- **Features**:
  - Svelte 5 documentation reference
  - Migration patterns from Svelte 4 to 5
  - Best practices and common patterns
  - Runes and snippets guidance

## Configuration

The MCP servers are configured in `.mcp.json` at the project root.

## Usage

After restarting Claude Code, you'll have access to:

1. **Supabase tools** (prefix: `mcp__supabase__`)
   - Direct database queries
   - Migration management
   - Branch operations

2. **Playwright tools** (when available after restart)
   - Browser automation
   - Testing capabilities

3. **Svelte documentation** (integrated knowledge)
   - Better Svelte 5 guidance
   - Accurate migration help

## Adding New MCP Servers

To add a new MCP server:

```bash
# For npm packages
claude mcp add <name> -- npx -y <package-name>

# For remote servers
claude mcp add --transport sse <name> <url>
```

## Notes

- Restart Claude Code after modifying `.mcp.json`
- Environment variables in the config are expanded at runtime
- Project-scoped MCP servers are shared with the team