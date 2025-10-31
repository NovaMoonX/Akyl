# Copilot Instructions for Akyl

## Project Overview
Akyl is a personal finance visualization web application that helps users understand their finances through dynamic flowcharts. The app shows how money flows from income sources to spending categories and savings goals, providing a visual alternative to traditional budgeting spreadsheets.

Key features:
- Top-to-bottom flowchart visualization of income and expenses
- Period views (weekly, monthly, annually)
- 100% private - data stored entirely in the browser
- Save & load functionality (download as file or image)

## Technologies
- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Flowchart Library:** @xyflow/react (React Flow)
- **Additional Tools:** html-to-image, lucide-react (icons)
- **Deployment:** Firebase Hosting

## Development Commands

### Essential Commands
- `npm install` - Install dependencies (always run first in a fresh clone)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler + Vite build)
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally
- `npm run fbdeploy` - Build and deploy to Firebase

### Build Process
The build process includes:
1. TypeScript compilation (`tsc -b`)
2. Vite bundling and optimization
3. Asset processing

## Code Style & Conventions

### TypeScript
- Use TypeScript for all new files (`.ts`, `.tsx`)
- Follow existing type definitions in the codebase
- Avoid using `any` types when possible

### React
- Use functional components with hooks
- Follow React 19 best practices
- Export components as default exports
- Use proper React hooks patterns (useState, useEffect, etc.)
- When creating context providers, be aware that fast refresh warnings may occur if non-component exports are included

### Zustand State Management
- When using `useShallow` to fetch values from the store, do NOT set default values for objects or arrays
- Default values can be set for primitive types (strings, numbers, booleans, etc.)
- ✅ Correct for primitives: `useSpace(useShallow((state) => state.space?.config?.currency || 'USD'))`
- ❌ Incorrect for objects/arrays: `useSpace(useShallow((state) => state?.space?.sheets || []))`
- ✅ Correct for objects/arrays: `useSpace(useShallow((state) => state?.space?.sheets))`

### Linting
- ESLint is configured with TypeScript support
- React hooks rules are enforced
- React refresh rules warn about component export patterns
- The codebase currently has minimal warnings - maintain this standard
- Run `npm run lint` before committing changes

### Styling
- Use Tailwind CSS utility classes for styling
- Follow existing Tailwind patterns in components
- Prettier is configured with Tailwind plugin for class ordering
- Use the `.prettierrc` configuration for consistent formatting

## Project Structure

```
src/
├── components/        # React components
│   ├── modals/       # Modal components (AuthModal, ConfigModal, etc.)
│   └── *.tsx         # Other UI components
├── contexts/         # React context providers (AuthContext, etc.)
├── firebase/         # Firebase configuration and utilities
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries and helpers
├── store/            # Zustand state management stores
├── styles/           # CSS and style files
├── utils/            # Utility functions
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Testing
- Currently, there is no test infrastructure in place
- Do not add testing frameworks unless specifically requested
- Manual testing should be done via `npm run dev`

## Important Notes

### Firebase Integration
- Firebase is used for hosting and authentication
- Firebase configuration is in `firebase.json` and `.firebaserc`
- Deployment requires Firebase CLI and proper permissions

### Browser Storage
- User data is stored in browser local storage for privacy
- No backend database is used - all data remains client-side

### Build Warnings
- Large bundle size warnings are expected due to dependencies
- The main bundle size is intentionally large due to dependencies - this is acceptable for this project

## Making Changes

### When Adding Features
1. Understand the existing code structure before making changes
2. Run `npm install` to ensure dependencies are installed
3. Test changes locally with `npm run dev`
4. Ensure code passes linting with `npm run lint`
5. Verify the production build works with `npm run build`
6. Keep bundle size reasonable but don't over-optimize

### When Fixing Bugs
1. Identify the affected component or module
2. Make minimal changes to fix the issue
3. Test thoroughly in development mode
4. Verify no new linting errors are introduced

### Code Quality
- Maintain consistency with existing code patterns
- Keep components focused and single-purpose
- Use descriptive variable and function names
- Add comments only when necessary to explain complex logic
- Follow the existing import organization pattern

## Dependencies

### Key Dependencies
- `react` & `react-dom` - UI framework
- `@xyflow/react` - Flowchart and node-based UI library
- `zustand` - State management
- `tailwindcss` - Styling
- `html-to-image` - Export functionality
- `lucide-react` - Icons
- `firebase` - Hosting and auth

### Dev Dependencies
- `vite` - Build tool
- `typescript` - Type checking
- `eslint` - Linting
- `prettier` - Code formatting

When adding new dependencies:
- Ensure they align with the project's goals
- Consider bundle size impact
- Check for security vulnerabilities
- Use npm to install and update package.json

## Deployment
The project uses Firebase Hosting with GitHub Actions:
- PRs trigger preview deployments
- Merges to main trigger production deployment
- Workflows are in `.github/workflows/`
- Do not modify Firebase workflow files unless necessary

## Best Practices
- **Make minimal changes** - only modify what's necessary to accomplish the task
- **Test locally** - always run the dev server to verify changes
- **Lint before commit** - ensure code passes ESLint checks
- **Follow existing patterns** - maintain consistency with the current codebase
- **Document complex changes** - add comments for non-obvious logic
- **Respect privacy** - never introduce features that send user data to external servers
- **Backwards compatibility** - all changes must be backwards compatible to preserve existing user data and functionality
