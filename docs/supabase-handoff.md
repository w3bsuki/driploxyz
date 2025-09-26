# Supabase Handoff Log

Use this file when Claude-Code or automated workflows encounter Supabase work that requires manual intervention. Do not execute database changes until the corresponding entry is reviewed and assigned.

## Instructions
1. Create a new section for each pending task using the template below.
2. Provide both forward and rollback SQL, even if the change is performed through the dashboard.
3. Link to supporting evidence (CLI output, screenshots) committed elsewhere in the repo.
4. Update the **Status** column as work progresses; close the entry only after the change is verified in staging and production.

## Pending items
| ID | Title | Status | Owner | Due date | Related tickets |
| -- | ----- | ------ | ----- | -------- | --------------- |
|    |       | 🔴 Pending |       |          |                 |

## Template
```
### ID: <short identifier>
- **Title:** <brief description>
- **Requested by:** <name / handle>
- **Created on:** <YYYY-MM-DD>
- **Context:**
  - <Why the change is needed; reference failing commands or app features>
- **Forward SQL / CLI steps:**
  ```sql
  -- paste SQL or describe CLI command sequence
  ```
- **Rollback SQL / CLI steps:**
  ```sql
  -- paste SQL or describe rollback procedure
  ```
- **Verification checklist:**
  - [ ] Regenerate types (`pnpm --filter database generate:types`).
  - [ ] Rerun affected commands (`pnpm --filter web check-types`, etc.).
  - [ ] Update documentation (playbooks, notes).
- **Evidence links:**
  - `path/to/command-output.txt`
  - Screenshots in `docs/qa/`
- **Status updates:**
  - <date> – <note>
```
