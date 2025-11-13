# Build/Test/Lint Commands

## Backend (Node.js)
- Start: `cd backend && npm start`
- Dev: `cd backend && npm run dev`
- Lint: `cd backend && npm run lint`

## Frontend
- Start: `cd frontend && open index.html`

# Code Style Guidelines

## Backend
- ES6+ JavaScript with Node.js
- Async/await for promises
- Controller-Service-Model architecture
- Error handling: try/catch with custom error classes
- Environment variables via dotenv
- Logging with dedicated logger utility

## Naming Conventions
- Files: camelCase.js
- Classes: PascalCase
- Functions/variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Environment variables: UPPER_SNAKE_CASE

## Imports
- Node.js modules first
- Third-party packages second
- Local modules last
- Group by type with blank line separator