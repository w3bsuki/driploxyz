import { describe, it, expect } from 'vitest';
import { generateCleanupPlan } from '../index';

describe('generateCleanupPlan', () => {
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
