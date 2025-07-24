# Capture - Personal Knowledge Management

A personal knowledge management and thought development application built with Next.js, Prisma, and AI.

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Vercel account with Postgres database
- An AI API key (OpenAI, Anthropic, or other providers supported by Vercel AI SDK)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Vercel Postgres:**
   - Go to your [Vercel dashboard](https://vercel.com/dashboard)
   - Navigate to the "Storage" tab
   - Click "Create Database" → Select "Postgres"
   - Choose a database name and region
   - Connect the database to your project

3. **Set up environment variables:**
   
   For local development, pull the environment variables from Vercel:
   ```bash
   vercel env pull .env.local
   ```
   
   Alternatively, you can manually copy the values:
   ```bash
   cp .env.local.example .env.local
   ```
   Then copy your database credentials from Vercel dashboard → Storage → Your Database → .env.local tab
   
   Don't forget to add your AI provider API key to `.env.local`.

4. **Set up the database schema:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
capture/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utilities and database client
├── prisma/          # Database schema and migrations
├── public/          # Static assets
├── ai-dev-tasks/    # AI development workflow definitions
└── tasks/           # Project documentation and task tracking
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint