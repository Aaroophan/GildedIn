/** Dependency-free environment gate. MUST run before Zod, providers or network adapters. */
export type AppEnvironment = 'local' | 'test' | 'preview' | 'production';
export type EnvironmentFields = Readonly<Record<string, string | undefined>>;
export class ConfigurationDenied extends Error {
  readonly code = 'UNSAFE_CONFIGURATION';
  readonly reason:string;
  constructor(reason: string) { super(`Unsafe configuration: ${reason}`); this.reason=reason; this.name = 'ConfigurationDenied'; }
}
const sensitivePublicName = /(?:SECRET|PRIVATE|PASSWORD|TOKEN|API[_-]?KEY|CREDENTIAL|MONGODB|DATABASE|GROQ|REDIS|AUTH_)/i;
const forbiddenTestKeys = [
  'AUTH_SECRET','AUTH_GOOGLE_SECRET','AUTH_GITHUB_SECRET','GROQ_API_KEY',
  'REDIS_REST_TOKEN','REDIS_REST_URL','BLOB_READ_WRITE_TOKEN','MEDIA_SECRET_KEY',
  'AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','VERCEL_TOKEN','TURBO_TOKEN',
  'TURNSTILE_SECRET_KEY','PRODUCTION_MONGODB_URI','PRODUCTION_MONGODB_DB',
  'PRODUCTION_STORAGE_KEY','PRODUCTION_GROQ_API_KEY',
];
const forbiddenTestSubstrings = /(?:^|[_-])(prod|production|live|customer|tenantdata|realdata)(?:[_-]|$)/i;
const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
const testDatabase = /^gildedin_test_[a-z0-9]{8,50}$/;

const allowedFeatures=new Set(['FEATURE_AI_PLATFORM','FEATURE_UPLOADS_PLATFORM','FEATURE_RSS_SYNC','FEATURE_REGISTRATION']);
export function assertNoPublicSecrets(env: EnvironmentFields): void {
  for (const [name, value] of Object.entries(env)) {
    if (name.startsWith('FEATURE_') && value !== undefined && !allowedFeatures.has(name)) throw new ConfigurationDenied('unknown-feature-flag');
    if (name.startsWith('NEXT_PUBLIC_') && value !== undefined && sensitivePublicName.test(name) && name !== 'NEXT_PUBLIC_TURNSTILE_SITE_KEY') {
      throw new ConfigurationDenied('secret-named-public-build-variable');
    }
  }
}

/** Explicit local MongoDB only. No mongodb+srv, external DNS, alternate socket schemes or credentials. */
export function assertLocalTestMongoUri(uri: string | undefined, databaseName: string | undefined): void {
  if (!databaseName || !testDatabase.test(databaseName) || /(?:prod|production|live)/i.test(databaseName)) {
    throw new ConfigurationDenied('test-database-name');
  }
  if (!uri) return; // in-memory adapters have no Mongo socket
  if (!uri.startsWith('mongodb://') || /[\s,?]/.test(uri.split('/')[2] ?? '')) {
    throw new ConfigurationDenied('test-mongo-scheme-or-multiple-hosts');
  }
  let url: URL;
  try { url = new URL(uri); } catch { throw new ConfigurationDenied('test-mongo-uri'); }
  if (!loopbackHosts.has(url.hostname) || url.username || url.password || !/^\d{2,5}$/.test(url.port) ||
      url.pathname !== `/${databaseName}` || url.search || url.hash) {
    throw new ConfigurationDenied('test-mongo-must-use-isolated-loopback-database');
  }
}

/** No test can open a provider connection by accident, even when NODE_ENV is changed. */
export function assertIsolatedTestEnvironment(env: EnvironmentFields): void {
  assertNoPublicSecrets(env);
  if (env.APP_ENV !== 'test') throw new ConfigurationDenied('test-mode-requires-explicit-APP_ENV-test');
  if (env.NODE_ENV === 'production' || env.VERCEL === '1' || env.VERCEL_ENV === 'production' || env.GI_ALLOW_PRODUCTION_TESTS) {
    throw new ConfigurationDenied('production-runtime-or-override-in-test');
  }
  if (forbiddenTestKeys.some(name => Boolean(env[name])) || Object.keys(env).some(key =>
      /^(PROD_|PRODUCTION_|LIVE_)/i.test(key) && Boolean(env[key]))) {
    throw new ConfigurationDenied('provider-secret-present-in-test');
  }
  if (env.MEDIA_PROVIDER && env.MEDIA_PROVIDER !== 'memory') throw new ConfigurationDenied('test-media-must-be-memory');
  if (env.APP_CANONICAL_ORIGIN && env.APP_CANONICAL_ORIGIN !== 'http://localhost:3000') {
    throw new ConfigurationDenied('test-origin-must-be-loopback');
  }
  for (const name of ['FEATURE_AI_PLATFORM','FEATURE_UPLOADS_PLATFORM','FEATURE_RSS_SYNC','FEATURE_REGISTRATION','APP_WILDCARD_ENABLED']) {
    if (env[name] && !['off','false'].includes(env[name])) throw new ConfigurationDenied(`test-feature-must-be-disabled-${name}`);
  }
  assertLocalTestMongoUri(env.MONGODB_URI, env.MONGODB_DB);
}

export function assertNoUnsafeProductionAdapters(env: EnvironmentFields): void {
  assertNoPublicSecrets(env);
  if (!['local','test','preview','production'].includes(env.APP_ENV ?? '')) throw new ConfigurationDenied('explicit-app-environment-required');
  if (env.APP_ENV === 'test') { assertIsolatedTestEnvironment(env); return; }
  if (env.APP_ENV === 'preview' && (
    env.AUTH_SECRET || env.AUTH_GOOGLE_SECRET || env.AUTH_GITHUB_SECRET || env.GROQ_API_KEY || env.MONGODB_URI ||
    env.REDIS_REST_TOKEN || env.BLOB_READ_WRITE_TOKEN || env.APP_WILDCARD_ENABLED === 'true')) {
    throw new ConfigurationDenied('preview-must-have-no-production-connections');
  }
  if (env.APP_ENV === 'production') {
    if (env.APP_CANONICAL_ORIGIN !== 'https://aaroophan.dev' || env.APP_DOMAIN !== 'aaroophan.dev')
      throw new ConfigurationDenied('production-canonical-host');
    if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 43 || !env.MONGODB_URI?.startsWith('mongodb+srv://') ||
        !env.MONGODB_DB || /(?:^test$|^gildedin_test_|prod-test)/i.test(env.MONGODB_DB)) {
      throw new ConfigurationDenied('production-auth-and-database-identity');
    }
    if (!/^[a-f0-9]{40}$/i.test(env.APP_DEPLOY_COMMIT_SHA ?? ''))
      throw new ConfigurationDenied('production-deploy-commit-provenance');
    if (!env.APP_RELEASE_VERSION) throw new ConfigurationDenied('production-release-version');
    if (!env.APP_ZERO_CHARGE_APPROVED || env.APP_ZERO_CHARGE_APPROVED !== 'true')
      throw new ConfigurationDenied('zero-charge-approval-not-recorded');
    if (env.MEDIA_PROVIDER !== 'approved-object-store') throw new ConfigurationDenied('production-must-not-use-fake-media');
    if (env.APP_WILDCARD_ENABLED === 'true' && env.APP_WILDCARD_TLS_VERIFIED !== 'true')
      throw new ConfigurationDenied('wildcard-not-verified');
    // Provider implementation still refuses to enable optional features until actual gates pass.
    for (const key of ['FEATURE_AI_PLATFORM','FEATURE_UPLOADS_PLATFORM','FEATURE_RSS_SYNC','FEATURE_REGISTRATION']) {
      if (env[key] !== 'off') throw new ConfigurationDenied('production-features-not-yet-authorized');
    }
  }
}
