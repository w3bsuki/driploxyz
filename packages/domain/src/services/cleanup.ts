import { promises as fs } from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';

export type AuditStatus = 'pass' | 'warn' | 'fail';

type Expectation = 'present' | 'absent';

type Severity = 'critical' | 'major' | 'minor';

interface CleanupTarget {
  id: string;
  label: string;
  path: string;
  expectation: Expectation;
  severity: Severity;
  notes?: string;
}

export interface CleanupAuditResult {
  id: string;
  label: string;
  path: string;
  expectation: Expectation;
  severity: Severity;
  status: AuditStatus;
  exists: boolean;
  notes?: string;
}

export interface CleanupMetrics {
  servicesTotal: number;
  removalTargetsPassing: number;
  documentationFilesPresent: number;
}

export interface CleanupReport {
  version: 1;
  generatedAt: string;
  projectRoot: string;
  dryRun: boolean;
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  checks: CleanupAuditResult[];
  metrics: CleanupMetrics;
}

const cleanupTargets: CleanupTarget[] = [
  {
    id: 'design-tokens-entrypoint',
    label: 'Design tokens CSS entrypoint',
    path: 'packages/ui/src/lib/styles/design-tokens.css',
    expectation: 'present',
    severity: 'critical',
    notes: 'SPEC requires tokens to live under packages/ui/src/lib/styles.'
  },
  {
    id: 'phase7-spec',
    label: 'Phase 7 SPEC document',
    path: 'docs/refactor/specs/SPEC-phase7-cleanup.md',
    expectation: 'present',
    severity: 'critical'
  },
  {
    id: 'phase7-prd',
    label: 'Phase 7 PRD document',
    path: 'docs/product/PRD-phase7-cleanup.md',
    expectation: 'present',
    severity: 'critical'
  },
  {
    id: 'phase7-audit-report',
    label: 'Phase 7 cleanup audit report',
    path: 'docs/refactor/reports/phase-7-cleanup-audit.json',
    expectation: 'present',
    severity: 'major'
  },
  {
    id: 'phase7-validation-log',
    label: 'Phase 7 validation log',
    path: 'docs/refactor/reports/phase-7-validation-log.md',
    expectation: 'present',
    severity: 'major'
  },
  {
    id: 'legacy-notification-service',
    label: 'Legacy admin notification service removed',
    path: 'apps/web/src/lib/services/notifications.ts',
    expectation: 'absent',
    severity: 'major',
    notes: 'Deprecated in favor of realtime notification hooks.'
  },
  {
    id: 'legacy-trending-service',
    label: 'Legacy trending service removed',
    path: 'apps/web/src/lib/services/trending.ts',
    expectation: 'absent',
    severity: 'major'
  },
  {
    id: 'unused-form-error-boundary',
    label: 'Unused FormErrorBoundary component removed',
    path: 'apps/web/src/lib/components/FormErrorBoundary.svelte',
    expectation: 'absent',
    severity: 'minor'
  },
  {
    id: 'observability-handler',
    label: 'Observability hook available',
    path: 'apps/web/src/lib/server/observability.ts',
    expectation: 'present',
    severity: 'major'
  }
];

async function pathExists(fullPath: string): Promise<boolean> {
  try {
    await fs.access(fullPath);
    return true;
  } catch {
    return false;
  }
}

function computeStatus(expectation: Expectation, exists: boolean): AuditStatus {
  if (expectation === 'present') {
    return exists ? 'pass' : 'fail';
  }

  return exists ? 'fail' : 'pass';
}

async function resolveTargets(projectRoot: string): Promise<CleanupAuditResult[]> {
  const results: CleanupAuditResult[] = [];

  for (const target of cleanupTargets) {
    const fullPath = path.resolve(projectRoot, target.path);
    const exists = await pathExists(fullPath);
    const status = computeStatus(target.expectation, exists);

    results.push({
      ...target,
      status,
      exists
    });
  }

  return results;
}

async function computeMetrics(projectRoot: string, checks: CleanupAuditResult[]): Promise<CleanupMetrics> {
  const services = await fg('apps/web/src/lib/services/**/*.ts', {
    cwd: projectRoot,
    ignore: ['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts']
  });

  const removalTargetsPassing = checks.filter((check) => check.expectation === 'absent' && check.status === 'pass').length;
  const documentationFilesPresent = checks.filter((check) => check.path.startsWith('docs/') && check.expectation === 'present' && check.status === 'pass').length;

  return {
    servicesTotal: services.length,
    removalTargetsPassing,
    documentationFilesPresent
  };
}

export interface CleanupReportOptions {
  projectRoot: string;
  dryRun?: boolean;
}

export async function generateCleanupReport(options: CleanupReportOptions): Promise<CleanupReport> {
  const projectRoot = path.resolve(options.projectRoot);
  const checks = await resolveTargets(projectRoot);

  const summary = checks.reduce(
    (acc, check) => {
      acc.totalChecks += 1;
      if (check.status === 'pass') acc.passed += 1;
      else if (check.status === 'fail') acc.failed += 1;
      else acc.warnings += 1;
      return acc;
    },
    { totalChecks: 0, passed: 0, failed: 0, warnings: 0 }
  );

  const metrics = await computeMetrics(projectRoot, checks);

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    projectRoot,
    dryRun: Boolean(options.dryRun),
    summary,
    checks,
    metrics
  };
}
