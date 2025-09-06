namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: string;
    FIRECRAWL_API_KEY?: string;
    OPENAI_API_KEY?: string;
    NEXT_PUBLIC_LOGO_DEV_API_KEY?: string;

    KV_URL?: string;
    KV_REST_API_URL?: string;
    KV_REST_API_TOKEN?: string;
    KV_REST_API_READ_ONLY_TOKEN?: string;
    REDIS_URL?: string;
  }
}
