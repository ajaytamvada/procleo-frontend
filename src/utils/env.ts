/**
 * Environment variable utilities and validation
 *
 * This module provides type-safe access to environment variables
 * and validates their presence and format at runtime.
 */

import { z } from 'zod';

// ========================================
// Environment Variable Schema
// ========================================

const envSchema = z.object({
  // Application Configuration
  VITE_APP_NAME: z.string().default('Autovitica P2P'),
  VITE_APP_VERSION: z.string().default('1.0.0'),
  VITE_APP_DESCRIPTION: z
    .string()
    .default('Procurement to Pay Management System'),

  // API Configuration
  VITE_API_BASE_URL: z.string().url().default('http://localhost:8080'),
  VITE_API_TIMEOUT: z
    .string()
    .default('30000')
    .transform(val => parseInt(val))
    .pipe(z.number().positive()),
  VITE_API_RETRY_ATTEMPTS: z
    .string()
    .default('3')
    .transform(val => parseInt(val))
    .pipe(z.number().min(0).max(10)),

  // Authentication Configuration
  VITE_AUTH_TOKEN_REFRESH_THRESHOLD: z
    .string()
    .default('300000')
    .transform(val => parseInt(val))
    .pipe(z.number().positive()),
  VITE_AUTH_SESSION_TIMEOUT: z
    .string()
    .default('3600000')
    .transform(val => parseInt(val))
    .pipe(z.number().positive()),

  // Feature Flags
  VITE_FEATURE_ADVANCED_SEARCH: z
    .string()
    .default('true')
    .transform(val => val === 'true'),
  VITE_FEATURE_DARK_MODE: z
    .string()
    .default('true')
    .transform(val => val === 'true'),
  VITE_FEATURE_ANALYTICS: z
    .string()
    .default('false')
    .transform(val => val === 'true'),
  VITE_FEATURE_NOTIFICATIONS: z
    .string()
    .default('true')
    .transform(val => val === 'true'),
  VITE_FEATURE_REAL_TIME: z
    .string()
    .default('false')
    .transform(val => val === 'true'),
  VITE_FEATURE_BULK_OPS: z
    .string()
    .default('true')
    .transform(val => val === 'true'),
  VITE_FEATURE_EXPORT: z
    .string()
    .default('true')
    .transform(val => val === 'true'),

  // UI Configuration
  VITE_DEFAULT_PAGE_SIZE: z
    .string()
    .default('20')
    .transform(val => parseInt(val))
    .pipe(z.number().positive()),
  VITE_MAX_PAGE_SIZE: z
    .string()
    .default('100')
    .transform(val => parseInt(val))
    .pipe(z.number().positive()),
  VITE_TOAST_DURATION: z
    .string()
    .default('5000')
    .transform(val => parseInt(val))
    .pipe(z.number().positive()),

  // File Upload Configuration
  VITE_MAX_FILE_SIZE: z
    .string()
    .default('10485760')
    .transform(val => parseInt(val))
    .pipe(z.number().positive()),
  VITE_ALLOWED_FILE_TYPES: z
    .string()
    .default(
      'image/jpeg,image/png,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ),

  // Development Configuration
  VITE_ENABLE_DEVTOOLS: z
    .string()
    .default('true')
    .transform(val => val === 'true'),
  VITE_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  VITE_DEBUG_MODE: z
    .string()
    .default('false')
    .transform(val => val === 'true'),

  // Analytics Configuration
  VITE_ANALYTICS_ID: z.string().optional(),
  VITE_ANALYTICS_DEBUG: z
    .string()
    .default('false')
    .transform(val => val === 'true'),

  // Monitoring Configuration
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_SENTRY_ENVIRONMENT: z.string().default('development'),
});

// ========================================
// Environment Validation
// ========================================

/**
 * Validates and parses environment variables
 * Throws an error if validation fails
 */
function validateEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw new Error(
      'Invalid environment configuration. Please check your .env file.'
    );
  }
}

// ========================================
// Typed Environment Variables
// ========================================

export const env = validateEnv();

// ========================================
// Environment Utilities
// ========================================

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const mode = import.meta.env.MODE;

/**
 * Checks if the application is running in development mode
 */
export const isDev = () => isDevelopment;

/**
 * Checks if the application is running in production mode
 */
export const isProd = () => isProduction;

/**
 * Gets the current environment mode
 */
export const getMode = () => mode;

/**
 * Checks if a feature flag is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof env): boolean => {
  const value = env[feature];
  return typeof value === 'boolean' ? value : false;
};

/**
 * Gets the base URL for API calls
 */
export const getApiBaseUrl = () => env.VITE_API_BASE_URL;

/**
 * Gets the application name
 */
export const getAppName = () => env.VITE_APP_NAME;

/**
 * Gets the application version
 */
export const getAppVersion = () => env.VITE_APP_VERSION;

/**
 * Gets the application description
 */
export const getAppDescription = () => env.VITE_APP_DESCRIPTION;

/**
 * Gets allowed file types as an array
 */
export const getAllowedFileTypes = (): string[] => {
  return env.VITE_ALLOWED_FILE_TYPES.split(',').map(type => type.trim());
};

/**
 * Gets the maximum file size in bytes
 */
export const getMaxFileSize = () => env.VITE_MAX_FILE_SIZE;

/**
 * Gets the API timeout in milliseconds
 */
export const getApiTimeout = () => env.VITE_API_TIMEOUT;

/**
 * Gets the number of API retry attempts
 */
export const getApiRetryAttempts = () => env.VITE_API_RETRY_ATTEMPTS;

/**
 * Gets the default page size for pagination
 */
export const getDefaultPageSize = () => env.VITE_DEFAULT_PAGE_SIZE;

/**
 * Gets the maximum page size for pagination
 */
export const getMaxPageSize = () => env.VITE_MAX_PAGE_SIZE;

/**
 * Gets the toast notification duration in milliseconds
 */
export const getToastDuration = () => env.VITE_TOAST_DURATION;

/**
 * Gets the log level for the application
 */
export const getLogLevel = () => env.VITE_LOG_LEVEL;

/**
 * Checks if debug mode is enabled
 */
export const isDebugMode = () => env.VITE_DEBUG_MODE;

/**
 * Checks if dev tools are enabled
 */
export const areDevToolsEnabled = () =>
  env.VITE_ENABLE_DEVTOOLS && isDevelopment;

/**
 * Gets analytics configuration
 */
export const getAnalyticsConfig = () => ({
  id: env.VITE_ANALYTICS_ID,
  debug: env.VITE_ANALYTICS_DEBUG,
  enabled: isFeatureEnabled('VITE_FEATURE_ANALYTICS'),
});

/**
 * Gets Sentry configuration
 */
export const getSentryConfig = () => ({
  dsn: env.VITE_SENTRY_DSN,
  environment: env.VITE_SENTRY_ENVIRONMENT,
  enabled: !!env.VITE_SENTRY_DSN && isProduction,
});

/**
 * Gets feature flags as an object
 */
export const getFeatureFlags = () => ({
  advancedSearch: env.VITE_FEATURE_ADVANCED_SEARCH,
  darkMode: env.VITE_FEATURE_DARK_MODE,
  analytics: env.VITE_FEATURE_ANALYTICS,
  notifications: env.VITE_FEATURE_NOTIFICATIONS,
  realTime: env.VITE_FEATURE_REAL_TIME,
  bulkOperations: env.VITE_FEATURE_BULK_OPS,
  export: env.VITE_FEATURE_EXPORT,
});

/**
 * Validates required environment variables for specific features
 */
export const validateFeatureRequirements = () => {
  const errors: string[] = [];

  // Validate analytics requirements
  if (env.VITE_FEATURE_ANALYTICS && !env.VITE_ANALYTICS_ID) {
    errors.push(
      'VITE_ANALYTICS_ID is required when analytics feature is enabled'
    );
  }

  // Validate monitoring requirements
  if (isProduction && !env.VITE_SENTRY_DSN) {
    console.warn('⚠️ VITE_SENTRY_DSN is not set for production environment');
  }

  // Validate API configuration
  if (!env.VITE_API_BASE_URL) {
    errors.push('VITE_API_BASE_URL is required');
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }
};

// Validate feature requirements on module load
validateFeatureRequirements();
