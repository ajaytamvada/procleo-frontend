# Autovitica P2P Frontend Architecture

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Development Setup](#development-setup)
6. [Code Quality & Standards](#code-quality--standards)
7. [State Management](#state-management)
8. [Routing & Navigation](#routing--navigation)
9. [UI Components & Design System](#ui-components--design-system)
10. [Testing Strategy](#testing-strategy)
11. [Build & Deployment](#build--deployment)
12. [Performance Optimization](#performance-optimization)
13. [Security Considerations](#security-considerations)
14. [Best Practices](#best-practices)
15. [Troubleshooting](#troubleshooting)

## Overview

The Autovitica P2P Frontend is a modern, production-ready React TypeScript application built for the Procurement-to-Pay management system. It follows enterprise-grade patterns and practices to ensure scalability, maintainability, and performance.

### Key Features

- **Modern React 19** with TypeScript for type safety
- **Feature-based architecture** for scalability
- **Comprehensive testing** with Jest and React Testing Library
- **Production-ready tooling** with ESLint, Prettier, and Husky
- **Advanced error handling** with Error Boundaries
- **Responsive design** with Tailwind CSS
- **State management** with React Query and Context API
- **Form handling** with React Hook Form and Zod validation
- **Routing** with React Router v7

## Technology Stack

### Core Technologies

| Technology   | Version | Purpose      |
| ------------ | ------- | ------------ |
| React        | 19.1.1  | UI Framework |
| TypeScript   | ~5.8.3  | Type Safety  |
| Vite         | 7.1.2   | Build Tool   |
| Tailwind CSS | 4.1.12  | Styling      |
| React Router | 7.8.0   | Routing      |

### State Management & Data Fetching

| Technology            | Version  | Purpose                 |
| --------------------- | -------- | ----------------------- |
| @tanstack/react-query | 5.85.3   | Server State Management |
| React Context API     | Built-in | Client State Management |
| Axios                 | 1.11.0   | HTTP Client             |

### Form Handling & Validation

| Technology          | Version | Purpose                     |
| ------------------- | ------- | --------------------------- |
| React Hook Form     | 7.62.0  | Form Management             |
| @hookform/resolvers | 5.2.1   | Form Validation Integration |
| Zod                 | 4.0.17  | Schema Validation           |

### Development & Quality Tools

| Technology  | Version | Purpose            |
| ----------- | ------- | ------------------ |
| ESLint      | 9.33.0  | Code Linting       |
| Prettier    | 3.6.2   | Code Formatting    |
| Husky       | 9.1.7   | Git Hooks          |
| lint-staged | 16.1.5  | Pre-commit Linting |

### Testing

| Technology                  | Version | Purpose                  |
| --------------------------- | ------- | ------------------------ |
| Jest                        | 30.0.5  | Test Runner              |
| @testing-library/react      | 16.3.0  | Component Testing        |
| @testing-library/jest-dom   | 6.7.0   | DOM Testing Utilities    |
| @testing-library/user-event | 14.6.1  | User Interaction Testing |

### UI & Icons

| Technology   | Version | Purpose               |
| ------------ | ------- | --------------------- |
| lucide-react | 0.539.0 | Icons                 |
| clsx         | 2.1.1   | Class Name Management |

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI components (Button, Input, etc.)
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   └── common/          # Common components (ErrorBoundary, Loading, etc.)
├── features/            # Feature-based modules
│   ├── auth/            # Authentication feature
│   │   ├── components/  # Auth-specific components
│   │   ├── hooks/       # Auth-specific hooks
│   │   ├── services/    # Auth API services
│   │   ├── types/       # Auth type definitions
│   │   └── constants/   # Auth constants
│   ├── dashboard/       # Dashboard feature
│   ├── purchases/       # Purchase management feature
│   ├── assets/          # Asset management feature
│   ├── vendors/         # Vendor management feature
│   └── users/           # User management feature
├── hooks/               # Global custom hooks
├── utils/               # Utility functions
├── services/            # Global API services
├── types/               # Global type definitions
├── constants/           # Global constants
├── contexts/            # React contexts
├── pages/               # Page components
├── styles/              # Global styles and themes
└── test/                # Testing utilities and setup
    ├── utils/           # Test utilities
    ├── __mocks__/       # Mock files
    └── setup.ts         # Test setup
```

### Feature-Based Architecture

Each feature follows a consistent structure:

```
features/[feature-name]/
├── components/          # Feature-specific components
│   ├── [FeatureName]List.tsx
│   ├── [FeatureName]Form.tsx
│   ├── [FeatureName]Details.tsx
│   └── __tests__/       # Component tests
├── hooks/               # Feature-specific hooks
│   ├── use[FeatureName].ts
│   ├── use[FeatureName]Mutations.ts
│   └── __tests__/       # Hook tests
├── services/            # API services
│   ├── [featureName]Api.ts
│   └── __tests__/       # Service tests
├── types/               # Type definitions
│   └── index.ts
├── constants/           # Feature constants
│   └── index.ts
└── index.ts             # Feature barrel export
```

## Architecture Patterns

### 1. Component Architecture

```typescript
// Example component structure
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({
  // Destructured props
}) => {
  // Hooks (state, effects, custom hooks)

  // Event handlers

  // Render helpers

  return (
    // JSX
  );
};

export default Component;
```

### 2. Custom Hooks Pattern

```typescript
// Example custom hook
export const useFeature = (id: string) => {
  const [state, setState] = useState();

  // Logic

  return {
    // Returned interface
  };
};
```

### 3. Service Layer Pattern

```typescript
// Example API service
export const featureApi = {
  getAll: (params: SearchParams) =>
    apiClient.get<PaginatedResponse<Item>>('/api/v1/items', { params }),

  getById: (id: string) => apiClient.get<Item>(`/api/v1/items/${id}`),

  create: (data: CreateItemRequest) =>
    apiClient.post<Item>('/api/v1/items', data),

  update: (id: string, data: UpdateItemRequest) =>
    apiClient.put<Item>(`/api/v1/items/${id}`, data),

  delete: (id: string) => apiClient.delete(`/api/v1/items/${id}`),
};
```

### 4. Error Handling Pattern

```typescript
// Global error boundary
<ErrorBoundary level="page" onError={handleError}>
  <App />
</ErrorBoundary>

// Component-level error boundary
<ErrorBoundary level="component">
  <FeatureComponent />
</ErrorBoundary>

// Hook-based error handling
const { captureError } = useErrorHandler();
```

## Development Setup

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+ or yarn 1.22+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd autovitica-p2p-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run format:check     # Check Prettier formatting
npm run type-check       # Run TypeScript checks

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Git Hooks
npm run prepare          # Set up Husky hooks
```

## Code Quality & Standards

### ESLint Configuration

The project uses a comprehensive ESLint setup with:

- **TypeScript support** with `@typescript-eslint`
- **React best practices** with `react-hooks` rules
- **Import optimization** with `import` plugin
- **Accessibility checks** with `jsx-a11y`
- **Code formatting** integration with Prettier

### Prettier Configuration

Consistent code formatting with:

- 2-space indentation
- Single quotes for strings
- Trailing commas
- 80-character line length
- Semicolons

### Git Hooks

Pre-commit hooks with Husky and lint-staged:

- **TypeScript files**: ESLint fix + Prettier format
- **Other files**: Prettier format only
- **Type checking**: Ensures no TypeScript errors

### TypeScript Configuration

Strict TypeScript setup with:

- Strict mode enabled
- Path mapping for absolute imports
- React JSX support
- ES2022 target
- Bundle module resolution

## State Management

### Server State (React Query)

```typescript
// Query example
const { data, isLoading, error } = useQuery({
  queryKey: ['items', searchParams],
  queryFn: () => itemsApi.getAll(searchParams),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutation example
const createMutation = useMutation({
  mutationFn: itemsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries(['items']);
    toast.success('Item created successfully');
  },
  onError: error => {
    toast.error(error.message);
  },
});
```

### Client State (Context + useReducer)

```typescript
// Example context
interface AppState {
  theme: 'light' | 'dark';
  user: User | null;
  notifications: Notification[];
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>();

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
};
```

## Routing & Navigation

### Route Structure

```typescript
// Main routing setup
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      {
        path: 'purchases',
        children: [
          {
            index: true,
            element: <PurchasesListPage />,
          },
          {
            path: ':id',
            element: <PurchaseDetailsPage />,
          },
          {
            path: 'create',
            element: <CreatePurchasePage />,
          },
        ],
      },
    ],
  },
]);
```

### Protected Routes

```typescript
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

## UI Components & Design System

### Component Hierarchy

```
UI Components
├── Basic Components (Button, Input, Card, etc.)
├── Layout Components (Header, Sidebar, Footer)
├── Common Components (ErrorBoundary, Loading, Modal)
└── Feature Components (PurchaseForm, AssetCard, etc.)
```

### Design Tokens

```typescript
// Theme configuration
export const theme = {
  colors: {
    primary: 'rgb(59 130 246)', // blue-500
    secondary: 'rgb(107 114 128)', // gray-500
    success: 'rgb(34 197 94)', // green-500
    warning: 'rgb(245 158 11)', // amber-500
    error: 'rgb(239 68 68)', // red-500
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  // ... more tokens
};
```

### Component Examples

```typescript
// Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-md focus:outline-none focus:ring-2';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        {
          'opacity-50 cursor-not-allowed': disabled || loading,
        }
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
};
```

## Testing Strategy

### Testing Pyramid

1. **Unit Tests (70%)**: Individual components and functions
2. **Integration Tests (20%)**: Component interactions and API integration
3. **E2E Tests (10%)**: Critical user journeys

### Testing Setup

```typescript
// Test utilities
import { render, screen, fireEvent } from '@/test/utils/test-utils';

// Example component test
describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Testing Best Practices

1. **Test behavior, not implementation**
2. **Use semantic queries** (getByRole, getByLabelText)
3. **Mock external dependencies**
4. **Test accessibility**
5. **Maintain high coverage** (70%+ for critical paths)

### Mock Service Worker (MSW)

```typescript
// API mocks for testing
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/v1/items', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [{ id: 1, name: 'Test Item' }],
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Build & Deployment

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          ui: ['lucide-react', 'clsx'],
        },
      },
    },
  },
});
```

### Environment Configuration

```bash
# Development
VITE_API_BASE_URL=http://localhost:8080
VITE_FEATURE_ANALYTICS=false

# Production
VITE_API_BASE_URL=https://api.autovitica.com
VITE_FEATURE_ANALYTICS=true
```

### Deployment Pipeline

```yaml
# Example GitHub Actions workflow
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

      - name: Deploy to S3
        run: aws s3 sync dist/ s3://your-bucket-name
```

## Performance Optimization

### Code Splitting

```typescript
// Route-based code splitting
const PurchasesPage = lazy(() => import('@/pages/PurchasesPage'));
const AssetsPage = lazy(() => import('@/pages/AssetsPage'));

// Component-based code splitting
const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

// Usage with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <PurchasesPage />
</Suspense>
```

### Image Optimization

```typescript
// Lazy loading with intersection observer
const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};
```

### Bundle Analysis

```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer dist/assets/*.js
```

## Security Considerations

### Authentication & Authorization

```typescript
// Token management
const useAuth = () => {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    setTokens(response.tokens);
    localStorage.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      response.tokens.accessToken
    );
    localStorage.setItem(
      STORAGE_KEYS.REFRESH_TOKEN,
      response.tokens.refreshToken
    );
  };

  const logout = () => {
    setTokens(null);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  };

  return { tokens, login, logout };
};
```

### XSS Prevention

```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const SafeHtml: React.FC<{ html: string }> = ({ html }) => {
  const sanitizedHtml = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
};
```

### Content Security Policy

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
/>
```

## Best Practices

### 1. Component Design

- **Single Responsibility**: Each component should have one clear purpose
- **Composition over Inheritance**: Use composition patterns
- **Props Interface**: Always define TypeScript interfaces for props
- **Default Props**: Use defaultProps or default parameters

### 2. State Management

- **Server State**: Use React Query for server state
- **Client State**: Use Context API for global client state
- **Local State**: Use useState for component-local state
- **Form State**: Use React Hook Form for form state

### 3. Performance

- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Code Splitting**: Implement route and component-based splitting
- **Bundle Size**: Monitor and optimize bundle size
- **Image Optimization**: Implement lazy loading and responsive images

### 4. Accessibility

- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add ARIA attributes when needed
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Screen Readers**: Test with screen readers

### 5. Error Handling

- **Error Boundaries**: Implement at appropriate levels
- **User Feedback**: Provide clear error messages
- **Logging**: Log errors for monitoring
- **Graceful Degradation**: Handle errors gracefully

## Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### TypeScript Errors

```bash
# Check TypeScript configuration
npm run type-check

# Regenerate types
npm run build
```

#### Testing Issues

```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests in verbose mode
npm test -- --verbose
```

### Performance Issues

#### Bundle Size

```bash
# Analyze bundle
npm run build
npx webpack-bundle-analyzer dist/assets/*.js
```

#### Memory Leaks

```typescript
// Check for memory leaks in useEffect
useEffect(() => {
  const subscription = api.subscribe();

  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, []);
```

### Development Tips

1. **Use React Developer Tools** for debugging
2. **Enable Strict Mode** to catch issues early
3. **Use TypeScript strictly** - avoid `any` types
4. **Write tests first** for critical functionality
5. **Monitor bundle size** regularly
6. **Use ESLint and Prettier** consistently
7. **Keep dependencies updated** but test thoroughly

---

## Contributing

When contributing to this project:

1. Follow the established patterns and conventions
2. Write tests for new functionality
3. Update documentation as needed
4. Run linting and type checking before commits
5. Use semantic commit messages
6. Create focused, single-purpose pull requests

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Testing Library Documentation](https://testing-library.com/docs/)

---

_This document is maintained by the development team and should be updated as the architecture evolves._
