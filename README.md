# Integration Magnet

Transform natural language into production-ready integration code using AI.

## Quick Start

### Prerequisites

- Node.js 22+
- OpenAI API key
- Firecrawl API key

### Setup

1. **Clone and install:**

```bash
git clone https://github.com/ziogas/integration-magnet.git
cd integration-magnet
corepack enable
yarn install
```

2. **Add environment variables:**

Create `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
NEXT_PUBLIC_LOGO_DEV_API_KEY=your_logo_dev_api_key_here

# Optional
KV_URL=your_kv_url_here
KV_REST_API=your_kv_rest_api_here
KV_REST_TOKEN=your_kv_rest_token_here
KV_REST_URL=your_kv_rest_url_here
REDIS_URL=your_redis_url_here

NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

3. **Run:**

```bash
yarn dev
```

Open http://localhost:3000

## Tech Stack

- Next.js 15 + TypeScript
- OpenAI GPT-4
- Tailwind CSS + shadcn/ui
- Redis caching (optional)
- PostHog analytics (optional)

## Project Structure

```
src/
├── app/           # Pages
├── components/    # UI components
├── actions/       # Server actions (AI logic)
├── lib/          # Utilities & templates
└── contexts/     # State management
```

## Commands

```bash
yarn dev        # Start dev server
yarn build      # Build for production
yarn lint       # Check code quality
yarn format     # Format code
```

## How It Works

1. You describe your integration need
2. AI matches it to a template
3. Generates custom code for your use case
4. Shows code in your preferred style (technical/business/executive)

## Environment Variables

| Variable                       | Required | Description                                      |
| ------------------------------ | -------- | ------------------------------------------------ |
| `OPENAI_API_KEY`               | Yes      | OpenAI API key                                   |
| `FIRECRAWL_API_KEY`            | Yes      | Firecrawl API key (web crawling/extraction)      |
| `NEXT_PUBLIC_LOGO_DEV_API_KEY` | Yes      | logo.dev api key                                 |
| `UPSTASH_REDIS_REST_URL`       | No       | Upstash REST URL for caching                     |
| `UPSTASH_REDIS_REST_TOKEN`     | No       | Upstash REST token                               |
| `NEXT_PUBLIC_POSTHOG_KEY`      | No       | PostHog analytics key                            |
| `NEXT_PUBLIC_POSTHOG_HOST`     | No       | PostHog host (default: https://us.i.posthog.com) |
