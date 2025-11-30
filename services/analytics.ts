import { logger } from '../src/lib/logger';

export type AuthModalContext = 'landing' | 'header' | 'lock' | 'settings' | 'guest-limit' | 'unknown';
export type AuthModalMode = 'signin' | 'signup';

interface AuthModalEventPayload {
  context: AuthModalContext;
  action: 'open' | 'submit' | 'success' | 'error';
  mode?: AuthModalMode;
  provider?: 'email' | 'google';
  errorCode?: string;
}

export const trackAuthModalEvent = (payload: AuthModalEventPayload) => {
  logger.info('analytics.auth_modal', { meta: payload });
};
