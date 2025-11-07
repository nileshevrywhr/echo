## Build, Lint, and Test Commands

- **Start:** `npm start` or `expo start`
- **Build:** `npx expo prebuild` then `npx expo run:ios --device` or `npx expo run:android` (or use `npm run build:ios`/`build:android` for legacy builds)
- **Type Check:** `npm run check-types`
- **Lint:** No lint command configured
- **Test:** No test framework configured (Jest not installed, no test files present). For single test: N/A (install Jest and add scripts if needed)

## Code Style Guidelines

- **Imports:** Group in order: React, React Native, third-party libraries, local components. Use `import type` for types
- **Formatting:** 2-space indentation, semicolons, trailing commas. Styles at bottom using `StyleSheet.create`
- **Types:** TypeScript with strict mode. Add types for props, state, navigation params, and callback functions
- **Naming:** PascalCase for components/screens, camelCase for variables/functions/hooks, UPPER_SNAKE_CASE for constants
- **Error Handling:** `try...catch` for async operations. `console.error` for logging errors, `Alert.alert` for user-facing errors
- **Components:** Functional components with hooks. Use `useState` for local state, `useEffect` for side effects
- **Navigation:** `@react-navigation/native-stack` with typed param lists. Use bottom tabs for main navigation
- **Async Patterns:** Use `async/await` with proper error handling. Avoid promises without try/catch
- **Environment:** Use `process.env.EXPO_PUBLIC_*` for environment variables. Never commit secrets
- **Logging:** Use `console.log` for debugging, `console.error` for errors. Include emojis for visual clarity
- **Project Structure:** Screens in `screens/` directory, assets in `assets/`, root-level config files

(No Cursor or Copilot rules found)
