import posthog from 'posthog-js';

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties);
  }
}

export function identifyUser(distinctId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(distinctId, properties);
  }
}

export function resetUser() {
  if (typeof window !== 'undefined' && posthog) {
    posthog.reset();
  }
}
