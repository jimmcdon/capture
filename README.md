# Capture - Personal Knowledge Management

A personal knowledge management and thought development application built with Next.js, Prisma, and AI.

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Neon PostgreSQL database account
- An OpenRouter API key (recommended) or direct provider API keys

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Neon Database:**
   - Go to [Neon Console](https://console.neon.tech)
   - Create a new project
   - Copy your connection strings (pooled and direct)

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add:
   - Your Neon database connection strings (pooled and direct)
   - Your OpenRouter API key from [OpenRouter](https://openrouter.ai/keys)
   
   **Why OpenRouter?** It gives you access to 100+ AI models (GPT-4, Claude, Gemini, etc.) through one API key, often at better rates than going direct.

4. **Set up the database schema:**
   ```bash
   npx prisma generate
   npm run db:push
   ```
   
   Note: We use `db:push` instead of `migrate` for development with Neon to avoid migration files.

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

## Deployment to Vercel

1. **Connect your GitHub repository** to Vercel
2. **Add environment variables** in your Vercel project settings:
   - `POSTGRES_PRISMA_URL` - Your Neon pooled connection string
   - `POSTGRES_URL_NON_POOLING` - Your Neon direct connection string  
   - `OPENROUTER_API_KEY` - Your OpenRouter API key
   - `DEFAULT_MODEL` - Your preferred model (e.g., "anthropic/claude-3-5-sonnet-20241022")
3. **Deploy** - Vercel will automatically build and deploy your app

### Common Deployment Issues

**"No Output Directory named 'public' found"**
- Fixed: Project now includes a `public/` directory with required static assets

**Environment Variables Not Loading**
- Ensure all 4 environment variables are added in Vercel project settings
- Check that variable names match exactly (case-sensitive)
- Redeploy after adding environment variables

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio