# System Architecture & Data Flow

This document explains how data flows through the Integration Magnet application from form submission to final rendering.

## Overview

The system follows a multi-stage pipeline:
1. **Form Input** → 2. **Company Scraping** → 3. **Scenario Matching** → 4. **Code Generation** → 5. **Results Display**

## Data Flow Stages

### 1. Form Submission (`/src/contexts/integration-context.tsx`)

**Input Data:**
- `domain`: Company domain (e.g., "gong.io")
- `useCase`: Integration use case description
- `persona`: User type (technical/executive/business)

**Process:**
```typescript
handleSubmit() {
  // Clean and validate domain
  // Update URL parameters
  // Track form submission event
  // Trigger company scraping
}
```

### 2. Company Scraping (`/src/actions/company-scraper.ts`)

**Input:** Domain name

**Process:**
1. Check Redis cache for existing company data (7-day TTL)
2. If not cached:
   - Verify domain accessibility (HEAD request with 5s timeout)
   - Scrape website using Firecrawl API (2 attempts with retry)
   - Extract company metadata (name, description, industry)
3. Generate logo URLs via Clearbit API

**Output:**
```typescript
CompanyContext {
  url: string
  domain: string
  name: string
  description: string
  industry?: string
  logoUrl: string
  faviconUrl: string
}
```

### 3. Scenario Matching (`/src/actions/scenario-matcher.ts`)

**Input:** CompanyContext + Use Case + Persona

**Process:**
1. **Pre-filtering:** Score and rank scenarios by keyword relevance (top 30)
2. **GPT Analysis:**
   - Parse use case to extract entities, actions, systems
   - Match to best scenario template
   - Generate confidence score (0-100)
   - Create personalized description
   - Generate custom code snippet

**Output:**
```typescript
{
  parsedUseCase: {
    description, entities[], actions[],
    sourceSystem, destinationSystem, integrationType
  },
  scenario: ScenarioTemplate,
  confidence: number,
  personalizedDescription: string,
  codeSnippet: string
}
```

### 4. Code Generation (`/src/actions/code-generator.ts`)

**Input:** Matched scenario + Company context + Parsed use case

**Process:**
- Generate JSON specification with:
  - Company metadata
  - Integration configuration
  - Sync patterns (webhooks/polling)
  - Field mappings
  - Implementation estimates

**Output:** JSON specification object

### 5. Results Rendering (`/src/components/integration-generator/results-section.tsx`)

**Display Components:**
1. **Company Card:** Logo, name, description
2. **Scenario Card:** Name, description, confidence badge
3. **Implementation Card:** 
   - Membrane SDK code snippet
   - JSON specification
   - Copy-to-clipboard functionality
4. **Integration Details:**
   - Supported applications (logos)
   - Building blocks used
   - How it works steps

## State Management

The entire flow is orchestrated by `IntegrationProvider` context which maintains:

```typescript
IntegrationState {
  // Input state
  domain, useCase, persona
  
  // Processing state
  isLoading, showResults, noMatch
  
  // Result state
  companyContext, scenarioResult
}
```

## Error Handling

Each stage includes fallback mechanisms:

1. **Scraping failures:** Return basic company info from domain
2. **GPT failures:** Return null (triggers no-match UI)
3. **Low confidence (<30):** Show no-match fallback
4. **Cache failures:** Continue without caching (Redis errors are non-fatal)

## Performance Optimizations

- **Redis Caching:** 7-day TTL for company data
- **Pre-filtering:** Reduce GPT context by sending only relevant scenarios
- **Parallel Processing:** Application logos fetched concurrently
- **URL State:** Form inputs preserved in URL parameters

## Analytics Integration

PostHog events track the entire flow:
- `form_submitted`: Initial submission with context
- `integration_generated`: Successful generation with scenario details
- `integration_failed`: Failures with error types
- `code_copied`: User engagement with results

## Key Files

- **Context Provider:** `/src/contexts/integration-context.tsx` - Orchestrates the flow
- **Actions:**
  - `/src/actions/company-scraper.ts` - Website scraping
  - `/src/actions/scenario-matcher.ts` - GPT-powered matching
  - `/src/actions/generate-scenario.ts` - Combines all steps
  - `/src/actions/code-generator.ts` - JSON spec generation
- **UI Components:**
  - `/src/components/integration-generator/form-section.tsx` - Input form
  - `/src/components/integration-generator/results-section.tsx` - Results display