'use client';

import posthog from 'posthog-js';

// Initialize PostHog on the client per latest Next.js docs
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: 'identified_only',
    autocapture: true,
    persistence: 'localStorage+cookie',
    session_recording: {
      maskAllInputs: false,
      maskInputOptions: {
        password: true,
        email: false,
      },
    },
  });
}

export default posthog;
