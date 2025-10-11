export interface PingDiagnostics {
  message: string;
  timestamp: string;
  environment: string;
  nodeVersion: string;
  platform: NodeJS.Platform;
}

export const collectPingDiagnostics = (
  message = 'Debug utilities available'
): PingDiagnostics => ({
  message,
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV ?? 'development',
  nodeVersion: process.version,
  platform: process.platform
});
