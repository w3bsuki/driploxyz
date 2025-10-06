import { describe, it, expect } from 'vitest';

// TODO: Replace with real import from services/cleanup when implemented and unskip suite
// import { generateCleanupPlan } from '../../index';
// Temporary placeholder to satisfy type/runtime while test is skipped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateCleanupPlan = async (_args: unknown) => ({
	deadModules: [],
	duplicateComponents: [],
	unusedStyles: [],
	bundleRisks: [],
	summary: { severity: 'low', totalFindings: 0 }
});

describe.skip('generateCleanupPlan', () => {
	it('returns a typed cleanup summary with severity ratings', async () => {
		const report = await generateCleanupPlan({
			projectRoot: process.cwd(),
			thresholds: {
				deadModules: 0,
				duplicateComponents: 0,
				unusedStyles: 0,
				bundleRisks: 0
			}
		});

		expect(report).toMatchObject({
			deadModules: expect.any(Array),
			duplicateComponents: expect.any(Array),
			unusedStyles: expect.any(Array),
			bundleRisks: expect.any(Array),
			summary: expect.objectContaining({
				severity: expect.stringMatching(/low|medium|high/),
				totalFindings: expect.any(Number)
			})
		});
	});
});
