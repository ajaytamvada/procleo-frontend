# Autovitica P2P Design System

## Overview

The Autovitica P2P Design System provides a comprehensive set of design tokens, components, and patterns to ensure consistency across the procurement platform. This system promotes reusability, accessibility, and maintainability while providing an excellent user experience.

## Design Principles

### 1. Accessibility First

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios

### 2. Consistency

- Unified visual language
- Consistent spacing and typography
- Predictable interaction patterns

### 3. Flexibility

- Theme system (light/dark modes)
- Responsive design
- Customizable components

### 4. Performance

- Optimized bundle sizes
- Efficient rendering
- Minimal dependencies

## Design Tokens

### Colors

#### Primary Palette

```css
--primary-50: #eff6ff --primary-100: #dbeafe --primary-200: #bfdbfe
  --primary-300: #93c5fd --primary-400: #60a5fa --primary-500: #3b82f6
  /* Primary brand color */ --primary-600: #2563eb --primary-700: #1d4ed8
  --primary-800: #1e40af --primary-900: #1e3a8a --primary-950: #172554;
```

#### Semantic Colors

```css
/* Success */
--success-50: #f0fdf4 --success-500: #22c55e --success-700: #15803d
  /* Warning */ --warning-50: #fffbeb --warning-500: #f59e0b
  --warning-700: #b45309 /* Error */ --error-50: #fef2f2 --error-500: #ef4444
  --error-700: #b91c1c /* Info */ --info-50: #f0f9ff --info-500: #06b6d4
  --info-700: #0e7490;
```

#### Neutral Palette

```css
--gray-50: #f9fafb --gray-100: #f3f4f6 --gray-200: #e5e7eb --gray-300: #d1d5db
  --gray-400: #9ca3af --gray-500: #6b7280 --gray-600: #4b5563
  --gray-700: #374151 --gray-800: #1f2937 --gray-900: #111827
  --gray-950: #030712;
```

### Typography

#### Font Families

```css
--font-sans:
  'Inter', system-ui, sans-serif --font-mono: 'JetBrains Mono', 'Fira Code',
  monospace;
```

#### Font Sizes

```css
--text-xs: 0.75rem /* 12px */ --text-sm: 0.875rem /* 14px */ --text-base: 1rem
  /* 16px */ --text-lg: 1.125rem /* 18px */ --text-xl: 1.25rem /* 20px */
  --text-2xl: 1.5rem /* 24px */ --text-3xl: 1.875rem /* 30px */
  --text-4xl: 2.25rem /* 36px */ --text-5xl: 3rem /* 48px */;
```

#### Font Weights

```css
--font-light: 300 --font-normal: 400 --font-medium: 500 --font-semibold: 600
  --font-bold: 700;
```

### Spacing Scale

```css
--space-0: 0 --space-1: 0.25rem /* 4px */ --space-2: 0.5rem /* 8px */
  --space-3: 0.75rem /* 12px */ --space-4: 1rem /* 16px */ --space-5: 1.25rem
  /* 20px */ --space-6: 1.5rem /* 24px */ --space-8: 2rem /* 32px */
  --space-10: 2.5rem /* 40px */ --space-12: 3rem /* 48px */ --space-16: 4rem
  /* 64px */ --space-20: 5rem /* 80px */ --space-24: 6rem /* 96px */;
```

### Border Radius

```css
--radius-none: 0 --radius-sm: 0.125rem /* 2px */ --radius-base: 0.25rem
  /* 4px */ --radius-md: 0.375rem /* 6px */ --radius-lg: 0.5rem /* 8px */
  --radius-xl: 0.75rem /* 12px */ --radius-2xl: 1rem /* 16px */
  --radius-full: 9999px;
```

### Shadows

```css
--shadow-sm:
  0 1px 2px 0 rgb(0 0 0 / 0.05) --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1),
  0 1px 2px -1px rgb(0 0 0 / 0.1) --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1),
  0 2px 4px -2px rgb(0 0 0 / 0.1) --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1),
  0 4px 6px -4px rgb(0 0 0 / 0.1) --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1),
  0 8px 10px -6px rgb(0 0 0 / 0.1);
```

## Component Specifications

### Base Components

#### Button

**Variants:**

- `primary` - Main actions
- `secondary` - Secondary actions
- `ghost` - Subtle actions
- `destructive` - Dangerous actions
- `outline` - Outlined style

**Sizes:**

- `sm` - Small (32px height)
- `md` - Medium (40px height) - Default
- `lg` - Large (48px height)

**States:**

- Default, Hover, Focus, Active, Disabled, Loading

#### Input

**Types:**

- `text`, `email`, `password`, `number`, `tel`, `url`

**Variants:**

- `default` - Standard input
- `error` - Error state
- `success` - Success state

**Sizes:**

- `sm`, `md`, `lg`

#### Card

**Components:**

- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title text
- `CardDescription` - Description text
- `CardContent` - Main content
- `CardFooter` - Footer section

#### Badge

**Variants:**

- `default`, `secondary`, `destructive`, `outline`

#### Avatar

**Sizes:**

- `sm` (32px), `md` (40px), `lg` (48px), `xl` (64px)

**Fallback:**

- Initials or default icon

### Layout Components

#### Container

**Sizes:**

- `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px)

#### Grid

- Responsive grid system
- 12-column layout
- Flexible gaps and alignment

#### Stack

**Directions:**

- `horizontal`, `vertical`

**Alignment:**

- `start`, `center`, `end`, `stretch`

### Form Components

#### Form Field

- Label, Input, Error message, Helper text
- Required indicator
- Validation states

#### Select

- Single and multi-select
- Searchable options
- Custom option rendering

#### Checkbox & Radio

- Individual and group variants
- Custom styling
- Indeterminate state (checkbox)

#### Switch

- On/off toggle
- Size variants
- Disabled state

### Feedback Components

#### Alert

**Variants:**

- `info`, `success`, `warning`, `error`

**Actions:**

- Dismissible
- Action buttons

#### Toast

- Success, error, warning, info types
- Auto-dismiss
- Action buttons
- Position variants

#### Loading

**Types:**

- Spinner, Skeleton, Progress bar

**Sizes:**

- Various sizes for different contexts

### Navigation Components

#### Breadcrumb

- Path navigation
- Custom separators
- Truncation for long paths

#### Tabs

- Horizontal and vertical
- Controlled and uncontrolled
- Custom content

#### Pagination

- Page numbers
- Previous/Next navigation
- Jump to page

### Overlay Components

#### Modal

**Sizes:**

- `sm`, `md`, `lg`, `xl`, `full`

**Features:**

- Backdrop click to close
- Escape key handling
- Focus management

#### Popover

- Trigger-based positioning
- Auto-positioning
- Arrow indicators

#### Tooltip

- Hover and focus triggers
- Multiple positions
- Custom delays

### Data Display Components

#### Table

**Features:**

- Sortable columns
- Selectable rows
- Pagination integration
- Responsive design

#### DataGrid

- Advanced table with filtering
- Column resizing
- Virtual scrolling
- Export functionality

## Responsive Design

### Breakpoints

```css
--breakpoint-sm: 640px --breakpoint-md: 768px --breakpoint-lg: 1024px
  --breakpoint-xl: 1280px --breakpoint-2xl: 1536px;
```

### Mobile-First Approach

- Design for mobile first
- Progressive enhancement
- Touch-friendly interactions

## Accessibility Guidelines

### Color Contrast

- Text: Minimum 4.5:1 ratio
- UI Elements: Minimum 3:1 ratio
- Large text: Minimum 3:1 ratio

### Keyboard Navigation

- Tab order logical and visible
- Skip links for main content
- Escape key handling in overlays

### Screen Readers

- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic content

### Focus Management

- Visible focus indicators
- Focus trapping in modals
- Logical focus flow

## Animation Guidelines

### Principles

- Subtle and purposeful
- Respect user preferences (reduced motion)
- Consistent timing and easing

### Duration

- Micro-interactions: 150-200ms
- State changes: 200-300ms
- Page transitions: 300-500ms

### Easing

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1) --ease-out: cubic-bezier(0, 0, 0.2, 1)
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## Theme System

### Light Theme

```css
--background: 0 0% 100% --foreground: 222.2 84% 4.9% --card: 0 0% 100%
  --card-foreground: 222.2 84% 4.9% --popover: 0 0% 100%
  --popover-foreground: 222.2 84% 4.9% --muted: 210 40% 98%
  --muted-foreground: 215.4 16.3% 46.9% --border: 214.3 31.8% 91.4%
  --input: 214.3 31.8% 91.4% --ring: 222.2 84% 4.9%;
```

### Dark Theme

```css
--background: 222.2 84% 4.9% --foreground: 210 40% 98% --card: 222.2 84% 4.9%
  --card-foreground: 210 40% 98% --popover: 222.2 84% 4.9%
  --popover-foreground: 210 40% 98% --muted: 217.2 32.6% 17.5%
  --muted-foreground: 215 20.2% 65.1% --border: 217.2 32.6% 17.5% --input: 217.2
  32.6% 17.5% --ring: 212.7 26.8% 83.9%;
```

## Component API Design

### Props Naming Convention

- Use descriptive names
- Boolean props start with `is`, `has`, `can`, `should`
- Event handlers start with `on`
- Render props end with `Render` or start with `render`

### Composition Patterns

- Compound components for complex UI
- Render props for flexibility
- Forwarded refs for DOM access

### TypeScript Integration

- Strict typing for all props
- Generic components where appropriate
- Proper event types

## Testing Strategy

### Component Testing

- Unit tests for logic
- Integration tests for interactions
- Visual regression tests

### Accessibility Testing

- Automated a11y tests
- Manual keyboard testing
- Screen reader testing

### Cross-browser Testing

- Modern browser support
- Progressive enhancement
- Graceful degradation

## Documentation Standards

### Storybook Stories

- Default story for each component
- All variants and states
- Interactive controls
- Usage examples

### API Documentation

- Props table with types
- Event documentation
- Examples and best practices

### Design Guidelines

- When to use each component
- Do's and don'ts
- Accessibility considerations

## Implementation Guidelines

### Performance

- Tree-shakeable exports
- Lazy loading for large components
- Optimized bundle sizes

### Customization

- CSS custom properties
- Theme tokens
- Style overrides

### Integration

- Framework agnostic core
- React bindings
- TypeScript support

---

This design system serves as the foundation for building consistent, accessible, and maintainable user interfaces across the Autovitica P2P platform.
