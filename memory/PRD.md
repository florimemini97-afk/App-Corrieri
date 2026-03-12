# App Corrieri - PRD

## Project Overview
Courier delivery application - Base template ready for deployment on Emergent platform.

## Tech Stack
- **Frontend**: React 19 + CRA (Create React App) + Tailwind CSS
- **Backend**: FastAPI + Python
- **Database**: MongoDB

## What's Been Fixed (Mar 12, 2026)
- Converted from Vite to CRA (Emergent standard)
- Fixed `import.meta.env.VITE_*` → `process.env.REACT_APP_*`
- Fixed CSS `@apply border-border` error
- Removed vite.config.js, added craco.config.js
- Updated package.json scripts for CRA

## Environment Variables Required
### Backend (.env)
- MONGO_URL
- DB_NAME  
- CORS_ORIGINS

### Frontend (.env)
- REACT_APP_BACKEND_URL

## Deployment Notes
When redeploying from GitHub, remember to configure environment variables in deployment settings.

## Next Steps / Backlog
- Add courier app features (tracking, deliveries, etc.)
- User authentication
- Real-time updates
