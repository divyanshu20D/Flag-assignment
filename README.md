# Feature Flags Demo

A simplified feature flag management system built with Next.js, Prisma, and Redis for real-time updates.

## Features

- **User Authentication**: Google/GitHub OAuth login
- **Role-Based Access**: READ_ONLY (default) and ADMIN roles
- **Feature Flag Management**: Create, update, delete, and toggle flags
- **Rule Engine**: Conditional flag evaluation based on attributes
- **Real-Time Updates**: Live updates across all connected users
- **Audit Logging**: Track all flag changes

## Quick Start

### 1. Setup Environment

```bash
# Copy environment variables
cp .env.example .env

# Fill in your OAuth credentials and database URLs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Reset and seed the database
npm run db:reset

# Or manually:
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

## User Management

### Default Users

The system comes with two default users:
- **admin@example.com** - ADMIN role (can create/edit/delete flags)
- **readonly@example.com** - READ_ONLY role (can only view flags)

### Making a User Admin

```bash
# Update any user to ADMIN role
npm run update-role user@example.com ADMIN

# Change back to READ_ONLY
npm run update-role user@example.com READ_ONLY
```

## API Endpoints

### Flags
- `GET /api/flags` - List all flags
- `POST /api/flags` - Create new flag (ADMIN only)
- `GET /api/flags/[key]` - Get specific flag
- `PUT /api/flags/[key]` - Update flag (ADMIN only)
- `DELETE /api/flags/[key]` - Delete flag (ADMIN only)

### Evaluation
- `POST /api/v1/evaluate` - Evaluate flag for a user/context

### Audit Logs
- `GET /api/audit-logs` - View audit history

## Real-Time Features

The system uses WebSockets and Redis to provide real-time updates:

- Flag changes are immediately broadcast to all connected users
- No page refresh needed to see updates
- Works across multiple browser tabs/windows

## Testing

```bash
# Test database functionality
npm run db:test

# Test real-time functionality
npm run realtime:test

# Check current users
npx tsx scripts/check-users.ts
```

## Database Schema

### Users
- `id`, `email`, `name`, `image`, `role`, `createdAt`, `updatedAt`

### Flags
- `id`, `key`, `defaultValue`, `enabled`, `createdAt`, `updatedAt`

### Rules
- `id`, `attribute`, `comparator`, `value`, `rolloutPercentage`, `flagId`

### Audit Logs
- `id`, `action`, `flagKey`, `userId`, `createdAt`

## Development

### Adding New Features

1. Update the Prisma schema if needed
2. Run `npx prisma db push` to apply changes
3. Update the data layer functions in `lib/data.ts`
4. Add API endpoints in `app/api/`
5. Update the UI components

### Database Reset

```bash
# Complete reset (destroys all data)
npm run db:reset

# Or manually:
npx prisma db push --force-reset
npm run db:seed
```

## Architecture

- **Frontend**: Next.js 15 with React 19
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO + Redis pub/sub
- **Authentication**: NextAuth.js with OAuth providers
- **Styling**: Tailwind CSS with shadcn/ui components

## Demo Use Cases

1. **Feature Rollouts**: Gradually enable new features
2. **A/B Testing**: Test different versions of features
3. **User Segmentation**: Show features based on user attributes
4. **Emergency Toggles**: Quickly disable problematic features
5. **Audit Trail**: Track who changed what and when

## Security

- OAuth authentication required for all operations
- Role-based access control (RBAC)
- Admin users can modify flags, read-only users can only view
- All changes are logged in audit trail
- Session-based authentication with JWT tokens
