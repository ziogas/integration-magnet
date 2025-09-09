# Prompts Documentation

This document contains the exact prompts used in the Integration Magnet application, extracted directly from the source code.

## Scenario Matching Prompts

**Source:** `/src/actions/scenario-matcher.ts`

### Persona Context Definitions

```javascript
const personaContext = {
  technical: 'a senior integration engineer helping developers implement production systems',
  business:
    'a business integration consultant helping Product Managers and Business Analysts design workflow solutions',
  executive:
    'an expert technical advisor for Product Managers, VP of Product, and CTOs evaluating integration solutions',
};
```

### Code Guidelines Definitions

```javascript
const codeGuidelines = {
  technical: `Full implementation with detailed comments and error handling
- Show all technical patterns: pagination, webhooks, retries, field mapping
- Include advanced features like rate limiting and circuit breakers
- Keep it comprehensive (~80-100 lines)`,
  business: `Simplified pseudo-code focusing on business logic flow
- Emphasize data transformations and workflow steps
- Show key integration points without implementation details
- Keep it readable for non-developers (~40-60 lines)`,
  executive: `Code that a CTO would approve for production deployment
- Show enterprise patterns: pagination, webhooks, field mapping
- Include monitoring and error handling that VP Engineering requires
- Keep it practical and maintainable (~60-80 lines)
- Focus on scalability and reliability`,
};
```

### System Prompt Template

The system prompt is constructed dynamically based on the selected persona:

```
You are ${personaContext[persona]}.

Your task is to:
1. Parse the use case to extract technical requirements
2. Match it to the best scenario template (confidence 0-100)
3. Generate production-ready code that ${persona === 'technical' ? 'engineering teams' : persona === 'business' ? 'business teams can understand' : 'technical leaders would approve'}

Step 1 - Parse the use case:
Determine if this is a valid integration use case (connecting systems, syncing data, automating workflows).
If not valid (e.g., "make me a sandwich"), set confidence to 0.
Otherwise identify: entities, actions, source/destination systems, integration type.

Step 2 - Match to scenario:
Find the best matching scenario based on technical feasibility and business alignment.
If confidence < 30, set scenarioId to null.

Step 3 - Generate code:
${codeGuidelines[persona]}

Available Scenarios:
${JSON.stringify(scenarioSummaries, null, 2)}
```

### User Prompt Template

```
Company: ${companyContext.name}
${companyContext.description ? `Description: ${companyContext.description}` : ''}
${companyContext.industry ? `Industry: ${companyContext.industry}` : ''}

Use Case: ${useCase}
```

## Schema Definitions

### AnalysisSchema

The schema used to validate GPT responses:

```javascript
const AnalysisSchema = z.object({
  parsedUseCase: z.object({
    description: z.string(),
    entities: z.array(z.string()),
    actions: z.array(z.string()),
    sourceSystem: z.string().nullable().optional(),
    destinationSystem: z.string().nullable().optional(),
    integrationType: z.enum(['sync', 'trigger', 'action', 'bidirectional', 'import', 'export']).nullable().optional(),
  }),
  matchedScenario: z.object({
    scenarioId: z.string().nullable(),
    confidence: z.number().min(0).max(100),
    personalizedDescription: z.string(),
    customizedCodeSnippet: z.string(),
  }),
});
```

## Dynamic Content in Prompts

### Persona-Specific Code Generation Instructions

The Step 3 code generation instructions vary by persona:

#### Technical Persona

```
Full implementation with detailed comments and error handling
- Show all technical patterns: pagination, webhooks, retries, field mapping
- Include advanced features like rate limiting and circuit breakers
- Keep it comprehensive (~80-100 lines)
```

#### Business Persona

```
Simplified pseudo-code focusing on business logic flow
- Emphasize data transformations and workflow steps
- Show key integration points without implementation details
- Keep it readable for non-developers (~40-60 lines)
```

#### Executive Persona

```
Code that a CTO would approve for production deployment
- Show enterprise patterns: pagination, webhooks, field mapping
- Include monitoring and error handling that VP Engineering requires
- Keep it practical and maintainable (~60-80 lines)
- Focus on scalability and reliability
```

### Dynamic Variables

The prompts include several dynamic variables that are inserted at runtime:

1. **`${personaContext[persona]}`** - The persona-specific role description
2. **`${companyContext.name}`** - Company name
3. **`${companyContext.description}`** - Company description (optional)
4. **`${companyContext.industry}`** - Company industry (optional)
5. **`${useCase}`** - The user's integration use case
6. **`${JSON.stringify(scenarioSummaries, null, 2)}`** - Pre-filtered relevant scenarios
7. **`${codeGuidelines[persona]}`** - Persona-specific code generation guidelines
8. **Conditional target audience** - `'engineering teams'` for technical, `'business teams can understand'` for business, `'technical leaders would approve'` for executive

## Implementation Notes

### Pre-filtering Strategy

Before sending to GPT, scenarios are pre-filtered using the `preFilterScenarios` function which:

1. Combines scenario name and description for text matching
2. Uses Set for efficient word deduplication
3. Scores based on:
   - Direct use case match in scenario text (10 points)
   - Keyword matches (3 points each)
   - Word overlap (1 point each)
4. Returns top 30 most relevant scenarios

### Validation Rules

- Use cases with empty or whitespace-only strings return `null`
- Non-integration use cases result in `confidence: 0`
- Scenarios with confidence < 30 are rejected
- Missing scenario IDs return `null`

### Error Handling

The function includes try-catch error handling that:

- Logs errors to console
- Returns `null` on any error
- Allows graceful fallback in the UI
