# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the "Capture" MVP project - a personal knowledge management and thought development application. The core purpose is to provide a single place for users to offload thoughts, ideas, and web content through a conversational AI interface.

## Project Structure

```
capture/
├── ai-dev-tasks/       # AI development workflow definitions
│   ├── create-prd.md   # Rules for generating Product Requirements Documents
│   ├── generate-tasks.md # Task generation workflow
│   └── process-task-list.md # Task processing rules
└── tasks/              # Project documentation and task tracking
    ├── prd-capture-mvp.md # Product Requirements Document
    └── tasks-prd-capture-mvp.md # Implementation task breakdown
```

## Key Architecture Patterns

### Tech Stack (Planned)
- **Frontend**: Next.js with React
- **UI Components**: shadcn/ui with react-resizable-panels for IDE-style layout
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Vercel AI SDK for conversational interface
- **API**: Next.js Server Actions for data mutations

### Core Data Models
- **Workspace**: Top-level container for organizing content
- **Project**: Groups related conversations within a workspace
- **Conversation**: Individual chat threads with AI, can contain links and dependencies

### UI Layout
- Multi-panel IDE-style layout (inspired by VS Code)
- Responsive design with mobile-first considerations
- Left sidebar: Project/conversation navigator
- Main area: Chat interface
- Right sidebar: Contextual details

## Development Workflow

### PRD Generation Process
When creating new features:
1. Use the `ai-dev-tasks/create-prd.md` guidelines
2. AI will ask clarifying questions before generating PRD
3. PRDs are saved in `tasks/prd-[feature-name].md`

### Task Implementation
- Tasks are broken down in `tasks-prd-capture-mvp.md`
- Each task includes relevant file paths
- Server Actions are preferred over traditional API routes

## Important Notes

- This is an MVP focused on single-user access
- No automated organization features - all organization is manual
- Web content capture happens automatically when URLs are pasted
- Voice input is planned but may be a stretch goal for MVP