import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const deploymentInfo = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    buildTimestamp: process.env.BUILD_TIMESTAMP || 'unknown',
    forceRebuild: process.env.FORCE_REBUILD || 'none',
    loginFix: 'ACTIVE - Superforms v2 integration complete',
    vercelCommit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    status: 'DEPLOYMENT_ACTIVE'
  };

  return json(deploymentInfo, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
};