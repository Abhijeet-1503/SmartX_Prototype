# SmartProctor-X Real-Time Monitoring Dashboard

## Overview

SmartProctor-X is a real-time student monitoring dashboard built as a full-stack web application. The system provides live tracking of student behavior during examinations or study sessions, featuring AI-powered analysis, real-time alerts, and comprehensive monitoring capabilities.

## User Preferences

- Preferred communication style: Simple, everyday language
- UI Design: Futuristic theme with neon colors and glass morphism effects
- Authentication: Three access levels required - god mode (developer), admin, teacher
- God Mode ID: Special developer access with system manipulation capabilities

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme variables
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with real-time WebSocket support
- **Development Server**: Custom Vite integration for hot module replacement

### Data Storage Solutions
- **Database**: PostgreSQL with persistent storage via @neondatabase/serverless
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Production Storage**: DatabaseStorage implementation using PostgreSQL
- **Migration**: Drizzle Kit for database schema management

## Key Components

### Frontend Components
1. **Dashboard** (`/pages/dashboard.tsx`): Main application view with real-time monitoring
2. **Student Grid** (`/components/StudentGrid.tsx`): Grid layout displaying individual student cards
3. **Event Log Sidebar** (`/components/EventLogSidebar.tsx`): Real-time event filtering and display
4. **Alert Notifications** (`/components/AlertNotifications.tsx`): Pop-up alerts for high-priority events
5. **Top Navigation** (`/components/TopNavigation.tsx`): Search, controls, and connection status
6. **AI Analysis Panel** (`/components/AIAnalysisPanel.tsx`): Detailed AI analysis display for selected students

### Backend Components
1. **Routes** (`/server/routes.ts`): API endpoints and WebSocket server setup
2. **Storage Interface** (`/server/storage.ts`): Abstracted data access layer with in-memory implementation
3. **Vite Integration** (`/server/vite.ts`): Development server with SSR support
4. **AI Agents** (`/server/ai/`): Two specialized AI monitoring agents
   - **Face Agent** (`faceAgent.ts`): Emotion and gaze tracking using simulated FER+ analysis
   - **Gesture Agent** (`gestureAgent.ts`): Hand position and body pose detection using simulated Mediapipe
   - **AI Manager** (`aiManager.ts`): Orchestrates both agents and provides combined risk analysis

### Shared Components
1. **Schema** (`/shared/schema.ts`): Drizzle schema definitions and Zod validation schemas
2. **Types** (`/client/src/types/dashboard.ts`): TypeScript interfaces for frontend

## Data Flow

### Real-time Updates
1. WebSocket connection established between client and server
2. Server broadcasts events (student updates, new alerts, stats changes)
3. Frontend updates UI reactively using React state management
4. TanStack Query handles server state synchronization and caching

### API Communication
1. Initial data loading via REST API endpoints (`/api/students`, `/api/events`, `/api/stats`)
2. Event creation through POST `/api/events` with automatic student status updates
3. Real-time notifications via WebSocket for immediate UI updates

### Student Monitoring Workflow
1. **AI Agent Processing**: Two specialized AI agents run in parallel:
   - Face Agent: Analyzes emotion, gaze direction, face visibility, and attention levels every 3 seconds
   - Gesture Agent: Monitors hand positions, body pose, movement levels, and suspicious activities every 4 seconds
2. **Event Generation**: AI agents generate behavior events with confidence scores and risk assessments
3. **Real-time Analysis**: Events are categorized by priority (normal, warning, high) and broadcast via WebSocket
4. **Student Status Updates**: Behavior scores, alert counts, and status automatically update based on AI findings
5. **Dashboard Visualization**: Real-time updates display in student grid, event log, and detailed AI analysis panel

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI component library for accessible primitives
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with PostCSS for processing
- **Form Handling**: React Hook Form with Zod resolvers for validation
- **Date Handling**: date-fns for timestamp formatting

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **WebSocket**: Built-in WebSocket support for real-time communication
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Type Safety**: Comprehensive TypeScript configuration with strict mode
- **Code Quality**: Drizzle Kit for database operations and migrations
- **Build Process**: Vite with React plugin and custom Replit integrations

## Deployment Strategy

### Development Environment
- Single command startup: `npm run dev`
- Integrated development server with Vite HMR
- In-memory storage for rapid development iteration
- WebSocket development support with automatic reconnection

### Production Build Process
1. Frontend: Vite builds optimized React application
2. Backend: esbuild bundles Express server with external dependencies
3. Database: Drizzle migrations applied via `npm run db:push`
4. Static assets served from `dist/public` directory

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Automatic database provisioning check in Drizzle configuration
- Production/development mode detection for conditional features

### Monitoring Features
- Real-time connection status indicators
- Automatic WebSocket reconnection with exponential backoff
- Development-specific error overlays and debugging tools
- Session duration tracking and performance metrics

The application architecture emphasizes real-time capabilities, type safety, and developer experience while maintaining scalability for production deployment.