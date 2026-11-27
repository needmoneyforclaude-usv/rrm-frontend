# rrm-frontend

Frontend for Research Resource Manager. React + Vite.

Backend: https://github.com/needmoneyforclaude-usv/rrm-backend

## Requirements

- Node.js 18+
- rrm-backend running on http://localhost:8000

## Setup

```
npm install
```

## Run

```
npm run dev
```

App runs on http://localhost:5173. Requests to `/api` and `/static` are proxied to the backend.

## Build

```
npm run build
```

## End-to-end tests (Cypress)

Start the backend and the frontend first, then run:

```
npm run test:e2e
```

or open the Cypress UI with `npm run cy:open`.
