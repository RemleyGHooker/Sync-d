# Tripp'In - Microsoft Intern Summer Camp Event Platform

## Overview

Tripp'In is a mobile-first web application designed for Microsoft interns to create, discover, and participate in summer camp events in Seattle. The platform combines event management, real-time chat, photo sharing, and social networking features to help interns connect and make memories during their summer experience.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom camp-themed color variables
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with OpenID Connect
- **Real-time Communication**: WebSocket server for live chat
- **Session Management**: Express sessions with PostgreSQL store

### Mobile-First Design
- Progressive Web App (PWA) capabilities
- Responsive design with mobile breakpoints
- Touch-optimized interface components
- Native app-like navigation patterns

## Key Components

### Authentication System
- **Replit Auth Integration**: Mandatory OAuth2/OIDC flow for Replit users
- **Session Management**: PostgreSQL-backed session store with 7-day TTL
- **User Profiles**: Automatic user creation with profile customization
- **Protected Routes**: Authentication middleware for all API endpoints

### Event Management
- **Event Creation**: Rich form with type selection, location, tags, and scheduling
- **Event Discovery**: Filter by type, search, and trending tags
- **Event Participation**: Join/leave events with participant tracking
- **Event Categories**: Party, Hiking, Food, Gaming, Networking, Beach, Shopping

### Real-time Chat
- **WebSocket Integration**: Live messaging within event contexts
- **Message Persistence**: PostgreSQL storage with user attribution
- **Chat Overlay**: Mobile-optimized sliding chat interface
- **Event-specific Channels**: Isolated chat rooms per event

### Photo Sharing
- **Event Memories**: Upload and share photos from events
- **User Galleries**: Personal photo collections organized by event
- **Social Features**: View memories from participated events

## Data Flow

### User Authentication Flow
1. User accesses application
2. Replit Auth redirects to OIDC provider
3. Successful authentication creates/updates user record
4. Session established with PostgreSQL store
5. Protected routes accessible with valid session

### Event Lifecycle
1. Authenticated user creates event via form
2. Event stored with creator reference and metadata
3. Other users discover event through browse/search
4. Users join events, creating participation records
5. Event chat channels activated for participants
6. Photos and memories shared post-event

### Real-time Communication
1. WebSocket connection established on chat open
2. Messages sent through WebSocket to server
3. Server broadcasts to event participants
4. Messages persisted to database
5. Chat history loaded from database on reconnect

## External Dependencies

### Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **connect-pg-simple**: PostgreSQL session store

### Authentication
- **Replit Auth**: OAuth2/OIDC provider integration
- **OpenID Client**: Standards-compliant authentication flow
- **Passport.js**: Authentication middleware strategy

### UI & Frontend
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form state management
- **Zod**: Schema validation and type inference
- **Date-fns**: Date manipulation utilities

### Development Tools
- **TypeScript**: Static type checking
- **Vite**: Fast development server and bundler
- **ESBuild**: Production bundling
- **PostCSS**: CSS processing pipeline

## Deployment Strategy

### Production Build
- Frontend built with Vite to `dist/public`
- Backend bundled with ESBuild to `dist/index.js`
- Static assets served from Express in production

### Environment Configuration
- **Development**: Hot module replacement with Vite dev server
- **Production**: Express serves static files and API routes
- **Database**: PostgreSQL connection via DATABASE_URL
- **Sessions**: Secure cookie configuration for HTTPS

### Replit Integration
- **Autoscale Deployment**: Configured for Replit's hosting platform
- **Port Configuration**: External port 80 mapped to internal 5000
- **Module Dependencies**: Node.js 20, Web, PostgreSQL 16

## Recent Changes
- June 24, 2025: Redesigned with Posh-inspired clean, modern UI
  - Replaced adventure theme with sophisticated Posh-style design
  - Implemented clean typography using Inter font family  
  - Updated color palette to violet/slate scheme matching Posh aesthetics
  - Redesigned landing page with subtle gradients and glass effects
  - Updated navigation with minimal, clean card-based layout
  - Fixed event creation button functionality
  - Transformed event cards with clean white backgrounds and subtle shadows
  - Added Posh-style typography classes and visual effects

## User Preferences

Preferred communication style: Simple, everyday language.
Design style: Cool, adventure-focused layout with blocky fonts and dark theme.
Visual preference: Dark slate backgrounds, gradient accents, modern typography.
Authentication: Microsoft email validation for intern exclusivity.