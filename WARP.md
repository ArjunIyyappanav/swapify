# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Swapify** is a skill-swapping platform exclusively for VIT Chennai students. It enables students to share skills, learn from peers, collaborate, and form teams within a trusted campus ecosystem.

**Key Features:**
- Campus-only access (restricted to @vitstudent.ac.in emails)
- Skill exchange system with swap requests
- Team formation for hackathons and projects
- Real-time chat functionality
- Meeting scheduling
- User ratings and feedback system

## Architecture

### Full-Stack Architecture
- **Frontend**: React.js with Vite, Tailwind CSS, Redux Toolkit for state management
- **Backend**: Node.js + Express.js with ES6 modules
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with secure HTTP-only cookies
- **Real-time**: Socket.io for chat functionality
- **Deployment**: Vercel (both frontend and backend)

### Key Components

#### Frontend Structure (`frontend/src/`)
- **Pages**: Main application views (Dashboard, Chat, Teams, etc.)
- **Components**: Reusable UI components (NavBar, ProtectedRoute)
- **Redux**: State management with authSlice
- **Utils**: API configuration and navigation helpers

#### Backend Structure (`backend/`)
- **Controllers**: Business logic for auth, requests, chat, teams
- **Models**: MongoDB schemas (Users, requests, matches, messages, teams)
- **Routes**: API endpoint definitions
- **Middleware**: Authentication and request protection
- **Socket.io**: Real-time chat implementation

#### Database Models
- **Users**: Student profiles with skills offered/wanted
- **Requests**: Skill swap requests between users
- **Matches**: Accepted requests that enable chat (supports 'ended' status)
- **Messages**: Real-time chat messages
- **Teams**: Hackathon team formation with enhanced structure
- **TeamRequests**: Separate model for team join/invite requests
- **Meetings**: Meeting scheduling tied to accepted matches
- **Ratings**: Skill swap ratings system
- **BlockedUsers**: User blocking functionality

## Common Development Commands

### Frontend Development
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

### Backend Development
```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with nodemon (runs on port 3000)
npm run dev

# Start production server
npm run start

# Build (currently just echoes completion)
npm run build
```

### Full Application
```powershell
# Start both frontend and backend simultaneously
# Frontend: http://localhost:5173
# Backend: http://localhost:3000

# In two separate terminals:
# Terminal 1:
cd frontend && npm run dev

# Terminal 2:
cd backend && npm run dev
```

## Environment Configuration

### Frontend Environment Variables
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

### Backend Environment Variables
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
FRONTEND_ORIGIN=http://localhost:5173
PORT=3000
NODE_ENV=development
```

## Recently Implemented Features

The following backend implementations have been completed:

### 1. Meeting Scheduling System (`/meet`)
- **Status**: ✅ **COMPLETED**
- **Features**: Schedule meetings only with users who have accepted skill swaps
- **Endpoints**: `GET /meet`, `POST /meet`, `GET /meet/available-matches`
- **Frontend**: Enhanced Meet.jsx with better calendar UI and swap integration

### 2. Chat End & Rating System
- **Status**: ✅ **COMPLETED**
- **Features**: End chats and trigger inline rating system (no separate rating page)
- **Endpoints**: `POST /chat/:matchId/end`, `POST /rating`, `GET /rating/pending`
- **Integration**: Rating system integrated directly into chat workflow

### 3. User Blocking System
- **Status**: ✅ **COMPLETED**
- **Features**: Block users in chat, prevents messaging and hides from matches
- **Endpoints**: `POST /block`, `DELETE /block/:userId`, `GET /block/list`
- **Integration**: Fully integrated with chat and matching systems

### 4. Enhanced Team Management
- **Status**: ✅ **COMPLETED**
- **Features**: Create teams, join teams, team requests, team management
- **Endpoints**: `POST /teams/create`, `GET /teams`, `POST /teams/join`
- **Models**: Separate Team and TeamRequest models for better organization

## Remaining Implementation Tasks

### 1. Events/Hackathons API (`/events`)
- **Frontend calls**: `GET /events` in Dashboard.jsx
- **Purpose**: Fetch upcoming hackathons for dashboard display
- **Status**: Will be implemented with VIT Events Hub scraping
- **Note**: User will implement the web scraping functionality

### 2. Profile Updates Enhancement
- **Frontend**: Settings.jsx has additional profile update functionality
- **Purpose**: Update user profiles beyond just skills
- **Status**: Basic implementation exists, can be enhanced as needed

## Current API Endpoints

### Authentication Routes (`/api/auth/`)
- `POST /signup` - User registration (VIT Chennai emails only)
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /checkAuth` - Verify authentication status
- `PUT /updateSkills` - Update user's skills
- `DELETE /account` - Delete user account
- `PATCH /updateProfile` - Update user profile

### User Routes (`/api/users/`)
- `GET /search` - Search users by name, email, or skills
- `GET /:name` - Get public user profile

### Request Routes (`/api/request/`)
- `POST /create` - Create skill swap request
- `GET /mine` - Get user's sent and received requests
- `GET /pending/:username` - Check pending requests with specific user
- `PATCH /requests/update` - Update request status (accept/reject)
- `DELETE /delete/:id` - Delete request

### Chat Routes (`/api/chat/`)
- `GET /chat/matches` - Get user's chat matches (excludes blocked users and ended chats)
- `GET /chat/:matchId/messages` - Get messages for a match
- `POST /chat/:matchId/messages` - Send message (blocked by ended chats and blocks)
- `POST /chat/:matchId/read` - Mark messages as read
- `POST /chat/:matchId/end` - End a chat and prompt for rating
- `GET /chat/:matchId/status` - Get chat status (ended, blocked, etc.)

### Team Routes (`/api/team/` and `/api/teams/`)
**Legacy Team Request Routes:**
- `POST /team/create` - Create team request
- `GET /team/mine` - Get user's team requests
- `GET /team/pending/:username` - Check pending team requests
- `PATCH /team/update` - Update team request status
- `DELETE /team/delete/:id` - Delete team request

**New Team Management Routes:**
- `POST /teams/create` - Create a new team
- `GET /teams` - Get all public teams (with filters)
- `GET /teams/my` - Get user's teams (created or joined)
- `POST /teams/join` - Request to join a team
- `PATCH /teams/join-request` - Accept/reject team join requests
- `POST /teams/:teamId/leave` - Leave a team
- `PATCH /teams/:teamId` - Update team details
- `DELETE /teams/:teamId` - Delete a team

### Meeting Routes (`/api/meet/`)
- `GET /meet` - Get user's scheduled meetings
- `GET /meet/available-matches` - Get matches available for meeting scheduling
- `POST /meet` - Schedule a new meeting
- `PATCH /meet/:meetingId` - Update meeting details
- `DELETE /meet/:meetingId` - Cancel a meeting

### Rating Routes (`/api/rating/`)
- `POST /rating` - Create a rating for a skill swap
- `GET /rating/user/:userId?` - Get ratings for a user
- `GET /rating/pending` - Get matches that can be rated
- `PATCH /rating/:ratingId` - Update a rating
- `DELETE /rating/:ratingId` - Delete a rating

### Block Routes (`/api/block/`)
- `POST /block` - Block a user
- `POST /unblock` - Unblock a user
- `GET /blocked-users` - Get list of blocked users
- `GET /is-blocked/:userId` - Check if user is blocked

## Authentication System

### JWT Configuration
- Uses HTTP-only cookies for security
- Tokens include user ID for database lookups
- Production vs development cookie settings (secure/sameSite)
- Protected routes use `protectRoute` middleware

### Email Validation
- Strictly enforced @vitstudent.ac.in domain validation
- Case-insensitive email handling
- Duplicate email prevention

## Socket.io Implementation

### Real-time Features
- JWT authentication for socket connections
- Room-based messaging (match-specific)
- Message persistence in database
- Automatic message broadcasting to participants

### Socket Events
- `join` - Join match room
- `message` - Send/receive messages
- Connection authentication via cookie parsing

## Development Workflow

### Key Files to Understand
1. `backend/index.js` - Main server file with Socket.io setup
2. `frontend/src/App.jsx` - Main React component with routing
3. `backend/models/Users.js` - User schema definition
4. `frontend/src/utils/api.js` - Axios configuration
5. `frontend/src/utils/navigation.js` - Navigation structure

### Testing Strategy
- Manual testing via browser developer tools
- API testing with tools like Postman
- Real-time features testing with multiple browser tabs
- Authentication flow testing

### Common Issues
1. **CORS Configuration**: Ensure `FRONTEND_ORIGIN` matches development/production URLs
2. **Cookie Issues**: Check secure/sameSite settings for different environments
3. **Socket Connection**: Verify `VITE_SOCKET_URL` matches backend URL
4. **MongoDB Connection**: Ensure database connection string is correct

## Enhanced Features Implemented

### Meeting Scheduling System
- **Constraint-based scheduling**: Only allows meetings with users who have accepted skill swaps
- **Available matches endpoint**: Shows which swaps can have meetings scheduled
- **Enhanced calendar UI**: Better date/time selection and meeting management
- **Meeting links**: Support for Google Meet, Zoom, etc.
- **Duration management**: Flexible meeting durations (30min - 2hrs)

### Chat End & Rating Workflow
- **Integrated rating**: No separate rating page - ratings triggered when ending chats
- **One-time rating**: Prevents duplicate ratings per match
- **Rating validation**: 1-5 star system with optional review text
- **Pending ratings**: Track which matches need ratings

### User Blocking System
- **Complete isolation**: Blocked users can't send messages or see each other in matches
- **Chat integration**: Automatic filtering of blocked users from chat lists
- **Bidirectional blocking**: Either user can block, affects both directions
- **Block management**: View and manage blocked users list

### Enhanced Team Management
- **Team creation**: Full teams with descriptions, skill requirements, categories
- **Member management**: Join requests, accept/reject, leave teams
- **Team discovery**: Public teams with filtering by category and skills
- **Capacity management**: Teams with member limits and full status
- **Creator controls**: Only creators can update/delete teams

## Future Development Priorities

1. **Events/Hackathons System**: Web scraping from VIT Events Hub (user will implement)
2. **Push Notifications**: Real-time notifications for requests, messages, meetings
3. **Profile Enhancements**: Add profile pictures, bio sections, skill verification
4. **Search Improvements**: Advanced filtering, skill-based matching algorithms
5. **Analytics Dashboard**: User activity, successful swaps, rating statistics
6. **Mobile App**: React Native implementation for better mobile experience

## Code Style Guidelines

### Frontend (React/JavaScript)
- Uses functional components with hooks
- ES6+ syntax with destructuring and async/await
- Tailwind CSS for styling with dark theme
- Framer Motion for animations
- Lucide React for icons

### Backend (Node.js/Express)
- ES6 modules (type: "module" in package.json)
- Async/await for database operations
- Mongoose for MongoDB operations
- JWT for authentication
- Express middleware pattern

### Database Schema Conventions
- Use camelCase for field names
- Include timestamps on all models
- Use proper references between collections
- Validate required fields and data types