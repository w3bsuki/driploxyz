import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';

type CleanupReportGenerator = typeof import('@repo/domain').generateCleanupReport;

interface CliOptions {
  dryRun: boolean;
  prettyPrint: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../..');
const defaultOutput = path.resolve(projectRoot, 'docs/refactor/reports/phase-7-cleanup-audit.json');

function parseArgs(argv: string[]): CliOptions {
  return {
    dryRun: argv.includes('--dry-run'),
    prettyPrint: argv.includes('--pretty') || argv.includes('--print')
  };
}

async function writeReport(outputPath: string, contents: unknown) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(contents, null, 2));
}

async function loadGenerator(): Promise<CleanupReportGenerator> {
  try {
    const module = await import('@repo/domain');
    return module.generateCleanupReport;
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ERR_MODULE_NOT_FOUND') {
      const module = await import('../../../../packages/domain/src/services/cleanup.ts');
      return module.generateCleanupReport;
    }

    throw error;
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const generateCleanupReport = await loadGenerator();
  const report = await generateCleanupReport({ projectRoot, dryRun: options.dryRun });

  const summary = `${report.summary.passed}/${report.summary.totalChecks} checks passing`;
  console.log(`\n🧹 Cleanup audit summary (${options.dryRun ? 'dry-run' : 'write'} mode): ${summary}`);

  if (options.prettyPrint || options.dryRun) {
    console.log(JSON.stringify(report, null, 2));
  }

  if (!options.dryRun) {
    await writeReport(defaultOutput, report);
    console.log(`📄 Report written to ${path.relative(projectRoot, defaultOutput)}`);
  }
}

const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isDirectExecution) {
  run().catch((error) => {
    console.error('Cleanup audit failed:', error);
    process.exitCode = 1;
  });
}

export async function createCleanupReport(options: Partial<CliOptions> = {}) {
  const cliOptions = { dryRun: false, prettyPrint: false, ...options };
  const generateCleanupReport = await loadGenerator();
  const report = await generateCleanupReport({ projectRoot, dryRun: cliOptions.dryRun });

  if (!cliOptions.dryRun) {
    await writeReport(defaultOutput, report);
  }

  return report;
}
