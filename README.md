# PollCraft (MERN + Socket.IO)

A full-stack poll platform built for hackathon requirements.

## Features Implemented
- Authenticated creators can create polls.
- Polls support multiple single-choice questions.
- Each question can be required or optional.
- Poll response mode: anonymous or authenticated.
- Expiring poll links (hard backend enforcement).
- Public poll response submission flow.
- Duplicate response prevention (one response per respondent per poll).
- Creator analytics dashboard:
  - total responses
  - question-wise option counts
  - participation insights
- Publish final results.
- Same poll link serves public published results.
- Real-time updates via Socket.IO.

## Repository Structure
- `Backend/` Express + MongoDB + Socket.IO backend
- `Frontend/` React + Vite frontend

## Backend Setup
1. Copy env file:
   - `cp Backend/.env.example Backend/.env`
2. Install dependencies:
   - `cd Backend && npm install`
3. Start backend:
   - `npm start`

Backend runs on `http://localhost:3000` by default.

### Authentication setup

PollCraft uses Better Auth with MongoDB for email/password and Google sign-in. Add these values to `Backend/.env`:

```env
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<Google OAuth client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth client secret>
```

In Google Cloud Console, add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI. Use your deployed backend URL for production.

## Frontend Setup
1. Install dependencies:
   - `cd Frontend && npm install`
2. (Optional) configure env in `Frontend/.env`:
   - `VITE_API_BASE_URL=http://localhost:3000/api`
   - `VITE_AUTH_BASE_URL=http://localhost:3000/api/auth`
   - `VITE_SOCKET_URL=http://localhost:3000`
3. Start frontend:
   - `npm run dev`

Frontend runs on `http://localhost:5173` by default.

## Main API Endpoints
### Auth
- Better Auth handles `/api/auth/*`, including email/password and Google OAuth routes.

### Creator Polls (Protected)
- `POST /api/polls`
- `GET /api/polls/mine`
- `GET /api/polls/:pollId`
- `PATCH /api/polls/:pollId`
- `POST /api/polls/:pollId/publish`

### Analytics (Protected)
- `GET /api/polls/:pollId/analytics/summary`
- `GET /api/polls/:pollId/analytics/questions`
- `GET /api/polls/:pollId/analytics/participation`

### Public
- `GET /api/public/polls/:slug`
- `POST /api/public/polls/:slug/responses`
- `GET /api/public/polls/:slug/results`

## WebSocket Events
### Client emits
- `poll:join_owner` `{ pollId }`
- `poll:join_public` `{ slug }`

### Server emits
- `analytics:response_received`
- `analytics:question_updated`
- `poll:status_changed`

## Hackathon Demo Flow
1. Register/login as creator.
2. Create poll with required/optional questions and expiry.
3. Open public link `/p/:slug` and submit response.
4. Watch creator analytics update in real time.
5. Publish final results from analytics page.
6. Reopen same public link to view published summaries.

## Important Rule Coverage
- Single option per question: enforced in response schema + submit validation.
- Mandatory question validation: enforced backend-side.
- Expiry: enforced on submission.
- Authenticated response mode: submit requires login.
- Public results: blocked until publish.
