# Feature Flags Demo

A simplified feature flag management system built with Next.js, Prisma, and Redis.

## Quick Start

1. **Setup environment**
   ```bash
   cp .env.example .env
   # Fill in your OAuth credentials
   ```

2. **Start with Docker**
   ```bash
   docker-compose up --build -d
   ```

3. **Access the app**
   - Open http://localhost:3000

## Make User Admin

```bash
npm run update-role <your_email> ADMIN
```
