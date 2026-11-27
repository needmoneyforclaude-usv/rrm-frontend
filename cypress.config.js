import {defineConfig} from 'cypress';

// Testele end-to-end ruleaza pe aplicatia pornita local:
// backend pe :8000 si frontend (Vite) pe :5173.
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    video: false,
  },
});
