# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands

```bash
# Development
yarn dev        # Start development server with Turbo mode at http://localhost:3000

# Build & Production
yarn build      # Create production build
yarn start      # Start production server

# Code Quality (RUN FREQUENTLY!)
yarn lint       # Run ESLint checks
yarn lint:fix   # Run ESLint with auto-fix
yarn format     # Format code with Prettier
yarn types      # Check TypeScript types

# Component Installation
yarn dlx shadcn@latest add [component-name]  # Install shadcn/ui components

# Run a specific test (when tests are added)
# yarn test [test-file-path]
```

### Package Management

**IMPORTANT**: Always use `yarn` instead of `npm` for all package operations:

- `yarn add [package]` - Add dependencies
- `yarn remove [package]` - Remove dependencies
- `yarn` or `yarn install` - Install all dependencies
- `yarn dlx` - Execute packages without installing globally
- **NEVER use npm commands** - This project uses Yarn 4.9.2 exclusively

## Architecture Overview

### Tech Stack

- **Next.js 15.4.4** with App Router (modern `app` directory)
- **React 19.1.0** with Server Components by default
- **TypeScript** with strict mode and path aliases (`@/*` → `./src/*`)
- **Tailwind CSS 4.x** with PostCSS and design tokens
- **shadcn/ui** component system (New York style) with Radix UI primitives
- **Yarn 4.9.2** with Turbo mode for faster builds

### Project Structure

```
src/
├── app/          # Next.js App Router pages and layouts
├── components/   # Reusable components
│   └── ui/      # shadcn/ui components (CVA patterns)
├── lib/         # Utilities (includes cn() for className merging)
└── styles/      # Global CSS with Tailwind and theme variables
```

### Key Architectural Patterns

#### Component Development

- **Server Components by default** - Only use `'use client'` when needed for interactivity
- **shadcn/ui conventions** - Components use CVA for variants, cn() for className merging
- **Compound components** - Use Radix Slot for flexible composition
- **File naming** - Components use kebab-case files (e.g., `button.tsx`)

#### Styling Approach

- **Utility-first with Tailwind CSS 4.x** - Native PostCSS integration
- **CSS custom properties** for theming (defined in `src/styles/global.css`)
- **Design tokens** - Consistent spacing, colors, and typography through CSS variables
- **Dark mode ready** - Theme variables support light/dark switching

#### TypeScript Configuration

- **Strict mode enabled** - Catch errors early
- **Path aliases** - Use `@/components` instead of relative imports
- **Module resolution** - Bundler mode for modern tooling

### Important Conventions

#### Next.js App Router

- Use `page.tsx` for pages, `layout.tsx` for layouts
- Implement loading states with `loading.tsx`
- Handle errors with `error.tsx` (must be client component)
- Use Server Actions with `'use server'` for data mutations
- Metadata exports for SEO in layouts and pages

#### Component Patterns

```typescript
// shadcn/ui component structure
import { cn } from '@/lib/utils';
import { VariantProps, cva } from 'class-variance-authority';

const componentVariants = cva('base-classes', {
  variants: {
    variant: { default: 'classes', secondary: 'classes' },
    size: { default: 'classes', sm: 'classes' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});

interface ComponentProps extends VariantProps<typeof componentVariants> {
  className?: string;
}

export function Component({ className, variant, size, ...props }: ComponentProps) {
  return <div className={cn(componentVariants({ variant, size }), className)} {...props} />;
}
```

#### Import Organization

- External packages first
- Internal aliases second (`@/...`)
- Relative imports last
- Automatic sorting via Prettier plugin

### Development Workflow

1. **Before making changes**:
   - Check existing patterns in similar files
   - Use IDE diagnostics (`mcp__ide__getDiagnostics`) to identify TypeScript errors early
   - Run `yarn types` to catch type issues before they become problems

2. **Component creation**:
   - **ALWAYS use shadcn/ui CLI** for new UI components: `yarn dlx shadcn@latest add [component]`
   - Only create custom components when shadcn/ui doesn't have what you need
   - Follow shadcn/ui patterns, use Server Components by default
   - Check available components at: https://ui.shadcn.com/docs/components

3. **Styling**: Use Tailwind utilities, extend via CSS variables in `global.css`

4. **Type safety**:
   - Frequently check for TypeScript errors using IDE diagnostics
   - Let TypeScript infer when possible, explicit types for props/exports
   - Run `yarn types` regularly to ensure type correctness

5. **Code quality**:
   - **Run frequently during development**:
     - `yarn lint` - Check for linting issues
     - `yarn lint:fix` - Auto-fix linting issues
     - `yarn format` - Format code with Prettier
   - Use IDE diagnostics to catch errors early
   - Always lint and format before finalizing changes

### Best Practices Summary

#### Component Development

- **Use shadcn/ui CLI first**: `yarn dlx shadcn@latest add [component]` before creating custom components
- **Server Components by default**: Only add `'use client'` when absolutely necessary
- **Follow existing patterns**: Check similar components before implementing new ones

#### Code Quality Checks

- **Run frequently**: `yarn lint`, `yarn format`, and `yarn types` during development
- **Use IDE diagnostics**: Leverage `mcp__ide__getDiagnostics` to catch errors early
- **Fix issues immediately**: Don't let linting or type errors accumulate

#### Package Management

- **Yarn only**: Never use npm commands in this project
- **Use yarn dlx**: For one-time package executions (like shadcn CLI)
- **Check package.json**: Verify dependencies before adding new ones

### Current State Notes

- Template project with minimal setup - basic layout and button component
- No testing framework configured yet - add when needed
- SVG support configured for both Webpack and Turbopack builds
