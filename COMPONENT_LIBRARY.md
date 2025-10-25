# Autovitica P2P Component Library

A comprehensive, accessible, and animated React component library built with TypeScript, Tailwind CSS, and Framer Motion.

## 🚀 Features

- **🎨 Design System Compliant** - Follows the design tokens and patterns defined in UI_DESIGN_SYSTEM.md
- **♿ Accessibility First** - WCAG 2.1 AA compliant with ARIA support and keyboard navigation
- **🌙 Theme System** - Built-in light/dark mode with system preference detection
- **📱 Responsive Design** - Mobile-first approach with responsive variants
- **🎭 Smooth Animations** - Powered by Framer Motion with reduced motion support
- **🔧 TypeScript** - Fully typed for excellent developer experience
- **📦 Tree Shakeable** - Import only what you need
- **🎯 Composable** - Flexible compound components and composition patterns

## 📦 Installation

The component library is built into the project. To use components, simply import them:

```tsx
import { Button, Card, Input } from '@/components/ui';
```

## 🎨 Theme System

### Setup

Wrap your app with the `ThemeProvider`:

```tsx
import { ThemeProvider } from '@/components/providers/ThemeProvider';

function App() {
  return <ThemeProvider defaultTheme='system'>{/* Your app */}</ThemeProvider>;
}
```

### Using Theme

```tsx
import { useTheme } from '@/components/providers/ThemeProvider';

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Current: {resolvedTheme}
    </Button>
  );
}
```

## 📚 Components

### Base Components

#### Button

Versatile button component with multiple variants and states.

```tsx
import { Button } from '@/components/ui';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With icons
<Button leftIcon={<Download />}>Download</Button>
<Button rightIcon={<ArrowRight />}>Next</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
```

**Props:**

- `variant`: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
- `size`: 'sm' | 'default' | 'lg' | 'icon'
- `loading`: boolean
- `leftIcon`, `rightIcon`: React.ReactNode
- `asChild`: boolean - for composition

#### Input

Form input with built-in validation, icons, and accessibility.

```tsx
import { Input } from '@/components/ui';

// Basic usage
<Input placeholder="Enter text..." />

// With label and validation
<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  error="Invalid email format"
  required
/>

// With icons
<Input
  leftIcon={<Search />}
  placeholder="Search..."
/>

// Password input (auto-adds show/hide toggle)
<Input
  label="Password"
  type="password"
  placeholder="Enter password"
/>

// With helper text
<Input
  label="Username"
  helperText="Must be at least 3 characters"
/>
```

**Props:**

- `variant`: 'default' | 'error' | 'success'
- `size`: 'sm' | 'default' | 'lg'
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`, `rightIcon`: React.ReactNode
- `required`: boolean

#### Card

Flexible card component with compound structure.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui';

<Card variant='elevated' hoverable animate>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>
      This is a description of the card content.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

**Props:**

- `variant`: 'default' | 'elevated' | 'outlined' | 'ghost'
- `size`: 'sm' | 'default' | 'lg'
- `hoverable`: boolean
- `clickable`: boolean
- `animate`: boolean

#### Badge

Status and category indicators.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Error</Badge>

// With icons
<Badge leftIcon={<Star />}>Featured</Badge>

// Removable
<Badge removable onRemove={() => console.log('removed')}>
  Removable
</Badge>
```

#### Avatar

Profile pictures with fallbacks and status indicators.

```tsx
import { Avatar, AvatarGroup } from '@/components/ui';

// Basic avatar
<Avatar src="/avatar.jpg" alt="User" fallback="JD" />

// With status
<Avatar
  fallback="JS"
  status="online"
  showStatus
/>

// Different sizes
<Avatar size="sm" fallback="SM" />
<Avatar size="lg" fallback="LG" />

// Avatar group
<AvatarGroup max={4}>
  <Avatar fallback="JD" />
  <Avatar fallback="JS" />
  <Avatar fallback="BW" />
  <Avatar fallback="AM" />
  <Avatar fallback="KL" />
</AvatarGroup>
```

### Form Components

#### Checkbox

Accessible checkbox with labels and validation.

```tsx
import { Checkbox, CheckboxGroup } from '@/components/ui';

// Single checkbox
<Checkbox
  label="Accept terms and conditions"
  description="You must accept to continue"
  required
  animate
/>

// Checkbox group
<CheckboxGroup
  label="Select options"
  value={selectedValues}
  onValueChange={setSelectedValues}
>
  <Checkbox value="option1" label="Option 1" />
  <Checkbox value="option2" label="Option 2" />
  <Checkbox value="option3" label="Option 3" />
</CheckboxGroup>
```

#### Switch

Toggle switch for boolean settings.

```tsx
import { Switch } from '@/components/ui';

<Switch
  label="Enable notifications"
  description="Receive email updates"
  checked={enabled}
  onCheckedChange={setEnabled}
  animate
/>

// Different sizes
<Switch size="sm" label="Small" />
<Switch size="lg" label="Large" />
```

### Feedback Components

#### Alert

Contextual feedback messages.

```tsx
import { Alert } from '@/components/ui';

<Alert variant="success" title="Success!" dismissible animate>
  Your changes have been saved successfully.
</Alert>

<Alert variant="destructive" title="Error" dismissible>
  Something went wrong. Please try again.
</Alert>

// With custom action
<Alert
  variant="warning"
  title="Warning"
  action={<Button size="sm">Fix Now</Button>}
>
  Please review your settings.
</Alert>
```

#### Loading States

Various loading and skeleton components.

```tsx
import { Spinner, Skeleton, Progress } from '@/components/ui';

// Spinners
<Spinner size="lg" />
<Spinner variant="secondary" />

// Skeleton loaders
<Skeleton variant="text" className="w-3/4" />
<Skeleton variant="avatar" className="w-10 h-10" />
<Skeleton variant="card" />

// Progress bar
<Progress
  value={progress}
  showLabel
  label="Upload Progress"
  animate
/>
```

### Layout Components

#### Container

Responsive container with max-widths.

```tsx
import { Container } from '@/components/layout/Container';

<Container size='lg' padding='lg'>
  Content goes here
</Container>;
```

#### Grid

Flexible grid system.

```tsx
import { Grid, GridItem } from '@/components/layout/Grid';

<Grid cols={3} gap={4} responsive>
  <GridItem span={2}>
    Spans 2 columns
  </GridItem>
  <GridItem>
    Single column
  </GridItem>
</Grid>

// Responsive grid
<Grid
  cols={1}
  smCols={2}
  lgCols={3}
  xlCols={4}
  gap={6}
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>
```

#### Stack

Flexbox layout utilities.

```tsx
import { Stack, HStack, VStack } from '@/components/layout/Stack';

// Horizontal stack
<HStack gap={4} align="center">
  <div>Item 1</div>
  <div>Item 2</div>
</HStack>

// Vertical stack
<VStack gap={2}>
  <div>Item 1</div>
  <div>Item 2</div>
</VStack>

// Responsive stack
<Stack
  direction="column"
  responsive={{
    md: { direction: 'row', gap: 4 }
  }}
>
  <div>Stacks vertically on mobile, horizontally on desktop</div>
</Stack>
```

### Interactive Components

#### Dialog

Modal dialogs with focus management.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent size='lg' animate>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        This is a description of what this dialog does.
      </DialogDescription>
    </DialogHeader>
    <div>Dialog content goes here</div>
    <DialogFooter>
      <Button variant='outline'>Cancel</Button>
      <Button>Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

#### DataTable

Advanced table with sorting, filtering, and pagination.

```tsx
import { DataTable, Column } from '@/components/ui';

const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
  },
  {
    key: 'status',
    header: 'Status',
    render: value => (
      <Badge variant={value === 'active' ? 'success' : 'secondary'}>
        {value}
      </Badge>
    ),
  },
];

<DataTable
  data={users}
  columns={columns}
  searchable
  searchPlaceholder='Search users...'
  sortable
  pagination
  pageSize={10}
  animate
  onRowClick={user => console.log('Clicked:', user)}
/>;
```

## 🎯 Accessibility Features

All components include:

- **Keyboard Navigation**: Full keyboard support with logical tab order
- **Screen Reader Support**: Proper ARIA labels, descriptions, and live regions
- **Focus Management**: Visible focus indicators and focus trapping in modals
- **Color Contrast**: WCAG AA compliant color combinations
- **Reduced Motion**: Respects user's motion preferences
- **Semantic HTML**: Uses appropriate HTML elements and roles

## 🎨 Customization

### CSS Custom Properties

Components use CSS custom properties for theming:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more properties */
}
```

### Tailwind Configuration

Extend the Tailwind config to customize design tokens:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        // ... other semantic colors
      },
    },
  },
};
```

### Component Variants

Use `class-variance-authority` for creating component variants:

```tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva('base-button-classes', {
  variants: {
    variant: {
      custom: 'custom-variant-classes',
    },
  },
});
```

## 🚀 Performance

- **Tree Shaking**: Import only the components you use
- **Code Splitting**: Lazy load components when needed
- **Optimized Animations**: Framer Motion with performance optimizations
- **Minimal Bundle**: Efficient CSS with Tailwind's purging

## 📖 Best Practices

### Component Usage

```tsx
// ✅ Good - Semantic and accessible
<Button variant="destructive" aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>

// ❌ Avoid - Missing accessibility
<div onClick={handleClick}>Delete</div>
```

### Form Handling

```tsx
// ✅ Good - Proper form structure
<form onSubmit={handleSubmit}>
  <Input label='Email' type='email' required error={errors.email} />
  <Button type='submit' loading={isSubmitting}>
    Submit
  </Button>
</form>
```

### Theme Usage

```tsx
// ✅ Good - Use semantic colors
<Alert variant="destructive">Error message</Alert>

// ❌ Avoid - Hardcoded colors
<div className="bg-red-500">Error message</div>
```

## 🔧 Development

### Adding New Components

1. Create component in `src/components/ui/`
2. Follow existing patterns and conventions
3. Include TypeScript types
4. Add accessibility features
5. Export from `src/components/ui/index.ts`
6. Add to showcase page for testing

### Testing Components

Run the development server and visit `/components` to see the component showcase:

```bash
npm run dev
```

Navigate to `http://localhost:3000/components` to see all components in action.

## 📋 Component Checklist

When creating new components, ensure:

- [ ] TypeScript interfaces defined
- [ ] Accessibility attributes included
- [ ] Keyboard navigation supported
- [ ] Focus management implemented
- [ ] Error states handled
- [ ] Loading states included
- [ ] Responsive design considered
- [ ] Animation support added
- [ ] Theme colors used
- [ ] Documentation updated

## 🤝 Contributing

1. Follow the design system guidelines
2. Maintain accessibility standards
3. Include proper TypeScript types
4. Test across themes and screen sizes
5. Update documentation

---

This component library provides a solid foundation for building accessible, beautiful, and performant user interfaces in the Autovitica P2P application.
