import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { generateCleanupReport } from '../cleanup.js';

const repoRoot = path.resolve(__dirname, '../../../../../');

describe('generateCleanupReport', () => {
  it('collects cleanup checks and metrics for the repository', async () => {
    const report = await generateCleanupReport({ projectRoot: repoRoot, dryRun: true });

    expect(report.version).toBe(1);
    expect(report.summary.totalChecks).toBeGreaterThan(0);

    const tokensCheck = report.checks.find((check) => check.id === 'design-tokens-entrypoint');
    expect(tokensCheck?.status).toBe('pass');

    const observabilityCheck = report.checks.find((check) => check.id === 'observability-handler');
    expect(observabilityCheck?.status).toBe('pass');

    expect(report.metrics.servicesTotal).toBeGreaterThan(0);
  });
});
