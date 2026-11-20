/** Server ONLY. Never import into src/shared, src/domain, or client components. */
import { z } from 'zod';
import { assertNoUnsafeProductionAdapters, ConfigurationDenied, type EnvironmentFields } from './preflight.ts';

const switchFlag = z.enum(['on','off']).default('off');
const origin = z.string().url().refine(value => {
  try { const u = new URL(value); return !u.username && !u.password && !u.search && !u.hash && u.pathname === '/' &&
    (u.protocol === 'https:' || value === 'http://localhost:3000'); } catch { return false; }
});
const positiveInt = z.coerce.number().int().positive();
export const serverEnvironmentSchema = z.object({
  APP_ENV: z.enum(['local','test','preview','production']),
  APP_CANONICAL_ORIGIN: origin,
  APP_DOMAIN: z.string().min(1).max(253),
  APP_WILDCARD_ENABLED: z.enum(['true','false']).default('false'),
  APP_WILDCARD_TLS_VERIFIED: z.enum(['true','false']).default('false'),
  APP_ZERO_CHARGE_APPROVED: z.enum(['true','false']).default('false'),
  APP_DEPLOY_COMMIT_SHA: z.string().optional(),
  APP_RELEASE_VERSION: z.string().max(120).optional(),
  AUTH_SECRET: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().min(1).max(100),
  MEDIA_PROVIDER: z.enum(['memory','filesystem','approved-object-store']).default('memory'),
  REDIS_REST_URL: z.string().url().optional(),
  REDIS_REST_TOKEN: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL_ID: z.string().max(150).optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  FEATURE_AI_PLATFORM: switchFlag,
  FEATURE_UPLOADS_PLATFORM: switchFlag,
  FEATURE_RSS_SYNC: switchFlag,
  FEATURE_REGISTRATION: switchFlag,
  AI_GLOBAL_MESSAGE_LIMIT: positiveInt.max(100000).default(100),
  MEDIA_GLOBAL_SAFE_BYTES: positiveInt.max(10737418240).default(15728640),
  AUDIT_RETENTION_DAYS: positiveInt.max(365).default(90),
  LOG_RETENTION_DAYS: positiveInt.max(365).default(30),
});
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
const keys = Object.keys(serverEnvironmentSchema.shape);

/** Reject before any provider import or I/O. Never include value or raw Zod issue in thrown error. */
export function parseServerEnvironment(env: EnvironmentFields): ServerEnvironment {
  assertNoUnsafeProductionAdapters(env);
  const candidate = Object.fromEntries(keys.map(k => [k, env[k]]));
  const result = serverEnvironmentSchema.safeParse(candidate);
  if (!result.success) throw new ConfigurationDenied('invalid-environment-schema');
  const parsed = result.data;
  if (parsed.APP_ENV !== 'production' && parsed.APP_CANONICAL_ORIGIN !== 'http://localhost:3000') {
    // Preview origins are selected by a trusted deploy edge; do not assume the arbitrary Host is canonical.
    if (parsed.APP_ENV !== 'preview') throw new ConfigurationDenied('nonproduction-origin');
  }
  if (parsed.APP_ENV === 'test' && parsed.MEDIA_PROVIDER !== 'memory') throw new ConfigurationDenied('test-provider');
  return parsed;
}

/** Call at server startup / first route. No fallback secret or silent test mode. */
export function loadServerEnvironment(): ServerEnvironment { return parseServerEnvironment(process.env); }

export function redactedEnvironmentSummary(env: ServerEnvironment) {
  return Object.freeze({ environment: env.APP_ENV, origin: env.APP_CANONICAL_ORIGIN,
    domain: env.APP_DOMAIN, mediaMode: env.MEDIA_PROVIDER,
    wildcardEnabled: env.APP_WILDCARD_ENABLED === 'true',
    providerKeysConfigured: { google: Boolean(env.AUTH_GOOGLE_SECRET), github: Boolean(env.AUTH_GITHUB_SECRET),
      redis: Boolean(env.REDIS_REST_TOKEN), groq: Boolean(env.GROQ_API_KEY) },
    features: { ai: env.FEATURE_AI_PLATFORM, uploads: env.FEATURE_UPLOADS_PLATFORM,
      rss: env.FEATURE_RSS_SYNC, registration: env.FEATURE_REGISTRATION } });
}
