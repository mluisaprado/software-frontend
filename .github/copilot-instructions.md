# Copilot / AI agent instructions for this repository

Short, actionable notes to help code-generating agents be productive in this React Native + Expo codebase.

- Project type: React Native app built with Expo, TypeScript. Web build supported (Expo → Netlify). See `package.json` scripts (`start`, `web`, `build:web`, `build:android`, `build:ios`, `deploy`).
- CI/CD: GitHub Actions drive web deploys to Netlify and mobile updates via EAS. See `.github/workflows/README.md` for workflow steps.

Key locations (use these as anchors when changing behavior):

- App entry & navigation
  - `App.tsx` / `src/App.jsx` — top-level app wrapper
  - `src/navigation/AppNavigator.tsx` — conditional routing: `AuthStack` (Login/Register) vs `MainTabs` (Home, Search, Create, Profile)

- Authentication & session
  - `src/context/AuthContext.tsx` — central auth state and reducer. Storage keys: `authToken` and `userData` (see `src/utils/storage.ts`). Restore token logic runs on app start.
  - `src/services/authService.ts` — uses `src/services/apiClient.ts` and contains `normalizeAuthResponse` to accept multiple backend shapes (`token`, `accessToken`, `data.user`, etc.). Prefer reusing this normalization pattern when adding auth-related services.

- HTTP client & services
  - `src/services/apiClient.ts` — the canonical axios instance. It reads env var `EXPO_PUBLIC_API_URL` (fallback `http://localhost:3000/api`) and attaches `Authorization` header using token from storage. Interceptors handle 401 logging.
  - Other service files (`src/services/tripService.ts`, `src/services/reservationService.ts`) call the backend. Note: `reservationService.ts` currently uses axios directly and `VITE_BACKEND_URL` (inconsistent with `apiClient.ts`). When adding endpoints, prefer using `apiClient` so interceptors and consistent baseURL are applied.

- Types and DTOs
  - `src/types/*.ts` contains shared TypeScript types (auth.types.ts, trip.types.ts). Use them for service signatures and component props.

Env vars and configuration

- Development: the README instructs using `.env` with `VITE_BACKEND_URL=http://localhost:3000`. The canonical environment var used by the central client is `EXPO_PUBLIC_API_URL` (see `src/services/apiClient.ts`). Be careful: both variables appear in the codebase — prefer `EXPO_PUBLIC_API_URL` for new code.
- EAS and Netlify configuration: `eas.json` and `netlify.toml` control production builds. Secrets live in GitHub Actions / Netlify settings (do not hardcode credentials).

Project-specific patterns to follow (observable in repo)

- Token storage: token and user are persisted via `src/utils/storage.ts` under keys `authToken` and `userData`. AuthContext expects `userData` to be JSON-serialized.
- Error handling: services typically wrap API calls and throw with `error.response?.data?.message` when available. `authService.normalizeAuthResponse` is tolerant to multiple shapes — mirror that approach for robustness.
- Navigation: `AppNavigator` chooses authenticated vs unauthenticated flows based on `useAuth()`; do not bypass `AuthProvider` when adding screens.
- UI: UI primitives come from `native-base` and plain React Native components. Keep styling consistent with existing components (e.g., safe area, padding conventions used in `HomeScreen.tsx`).

Quick examples (copy-paste friendly)

- Reserve a trip (use service):

  - Preferred: implement via `apiClient` so token is automatic

    ```ts
    import api from '../services/apiClient';

    export async function reserveTrip(tripId: string) {
      const res = await api.post(`/trips/${tripId}/reservations`);
      return res.data;
    }
    ```

  - Current implementation: `src/services/reservationService.ts` uses `axios` + `VITE_BACKEND_URL` and manually reads `authToken` from storage. Be aware of this inconsistency.

Developer workflows and commands (verified in `package.json`)

- Start dev (Expo): `npm start`
- Run in web: `npm run web`
- Build web for Netlify: `npm run build:web` (produces `dist/`)
- Mobile builds via EAS: `npm run build:android`, `npm run build:ios`. Use `npm run build:preview` for preview APK.
- Lint / typecheck: `npm run lint` (runs `tsc --noEmit`). Tests are placeholder (`npm test` prints a message).

When editing code

- Prefer `apiClient` over raw axios so interceptors (auth header, error handling) are preserved.
- Update `src/types/*` when response shapes change. Keep `normalizeAuthResponse`'s tolerant approach for auth endpoints.
- If you change storage keys or auth behavior, update `AuthContext.tsx` restore logic and any code that writes to `authToken`/`userData`.

Where to look for CI/CD implications

- `.github/workflows/` contains pipeline definitions that assume `npm run build:web` for web and EAS update for mobile. If you change build outputs or folder names, update workflows and `.github/workflows/README.md`.

If anything here is unclear or you'd like me to expand sections (routing, token flow, or convert `reservationService` to use `apiClient`), tell me which part and I'll update this file iteratively.
