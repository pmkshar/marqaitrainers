/**
 * Client-side environment detection for MarqAI Courses.
 *
 * GOLDEN RULE: Production and Demo use completely separate databases.
 *   - marqaicourses.com  → PRODUCTION database (real users, real data)
 *   - marqaitrainers.vercel.app / Preview deployments → DEMO database (test data)
 *   - localhost → LOCAL database (dev)
 *
 * Usage:
 *   const { isLive, isDemo, envLabel } = useAppEnvironment();
 *   if (isLive) { /* production-only logic *\/ }
 */

export type AppEnv = 'production' | 'demo' | 'local';

function detectEnvironment(): AppEnv {
  if (typeof window === 'undefined') return 'local';

  const host = window.location.hostname;

  // Production: the custom domain
  if (host === 'marqaicourses.com' || host === 'www.marqaicourses.com') {
    return 'production';
  }

  // Demo: Vercel preview URLs or the demo vercel.app domain
  if (
    host.endsWith('.vercel.app') ||
    host.includes('vercel.app')
  ) {
    return 'demo';
  }

  // Local development
  return 'local';
}

/**
 * React hook that returns the current app environment.
 * Computed once on mount from the browser's hostname.
 */
export function useAppEnvironment() {
  const env = detectEnvironment();

  return {
    env,
    envLabel: env === 'production' ? 'Live' : env === 'demo' ? 'Demo' : 'Local',
    isLive: env === 'production',
    isDemo: env === 'demo',
    isLocal: env === 'local',
    /** Show quick demo login? Only on demo/local, NEVER on production */
    showDemoFeatures: env !== 'production',
  };
}

/**
 * Non-hook version for use outside React components.
 */
export function getAppEnv(): AppEnv {
  return detectEnvironment();
}
