# AWS in Plain English - Project Context

## Project Overview

This is a React-based web application called "AWS in Plain English" that explains 69 AWS services in simple terms. The project is built using modern web technologies including Vite, TypeScript, React, Tailwind CSS, and shadcn/ui components. The application provides clear, Feynman-style explanations of AWS services with real-world examples and technical deep dives.

The project appears to be a learning resource for AWS services, organized by categories with detailed service pages. It follows a clean architecture with routing for different views (index, category, and service detail pages).

## Technologies Used

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom configuration
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Testing**: Vitest with Testing Library
- **Linting**: ESLint
- **Animation**: Tailwind CSS animations

## Project Structure

```
aws-unpacked/
├── public/                 # Static assets
├── src/                    # Main source code
│   ├── components/         # Reusable UI components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/               # Utility functions and shared logic
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   ├── assets/            # Static assets
│   ├── main.tsx           # Application entry point
│   └── App.tsx            # Main application component
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── components.json        # shadcn/ui configuration
```

## Key Features

1. **Service Organization**: AWS services are organized by categories with dedicated routes
2. **Detailed Explanations**: Each service has plain English explanations following the Feynman technique
3. **Responsive Design**: Mobile-first responsive layout using Tailwind CSS
4. **Modern UI**: Clean interface using shadcn/ui components
5. **Dark Mode**: Support for light/dark theme switching
6. **Search Functionality**: Presumably available for finding specific services
7. **Categorized Navigation**: Easy browsing by AWS service categories

## Building and Running

### Prerequisites
- Node.js (with npm) or Bun
- Modern web browser

### Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   # or
   bun run dev
   ```
   
   The application will be available at http://localhost:8080

3. **Other Available Scripts**:
   - `npm run build` - Build the production version
   - `npm run preview` - Preview the production build locally
   - `npm run lint` - Run ESLint for code quality checks
   - `npm test` - Run unit tests once
   - `npm test:watch` - Run unit tests in watch mode

### Production Build

To create a production-ready build:
```bash
npm run build
```

This creates an optimized build in the `dist/` directory that can be deployed to any static hosting service.

## Development Conventions

1. **Component Architecture**: 
   - Use shadcn/ui components for consistent UI elements
   - Organize components in the `/src/components` directory
   - Separate reusable UI components from page-specific components

2. **Type Safety**:
   - Leverage TypeScript for type safety
   - Define interfaces for props and data structures
   - Use Zod for runtime validation with forms

3. **Styling**:
   - Use Tailwind CSS utility classes
   - Follow the design system defined in `tailwind.config.ts`
   - Maintain consistent spacing and typography

4. **Routing**:
   - Use React Router DOM for navigation
   - Follow the route structure: `/`, `/category/:categorySlug`, `/category/:categorySlug/:serviceSlug`
   - Handle 404 cases with the NotFound component

5. **Data Fetching**:
   - Use TanStack Query for server state management
   - Implement proper loading and error states
   - Cache data appropriately

6. **Testing**:
   - Write unit tests using Vitest and React Testing Library
   - Test components in isolation
   - Mock external dependencies when necessary

## Special Features

1. **Lovable Integration**: The project appears to be integrated with Lovable.dev platform for easy editing and deployment
2. **Custom Domain Support**: Ready for custom domain configuration as mentioned in README
3. **Accessibility**: Built with Radix UI primitives for accessible components
4. **Performance**: Optimized with Vite for fast development and builds

## Deployment

The application can be deployed through the Lovable platform as described in the README, or to any static hosting service that supports client-side routing (with proper fallback to index.html for SPA routing).

For custom deployments, ensure the server redirects all routes to index.html to support React Router DOM functionality.