# Implementation Tasks: Capture MVP

## Relevant Files

- `prisma/schema.prisma`: Defines all database models (Workspace, Project, Conversation, etc.).
- `app/layout.tsx`: The root layout for the entire application.
- `app/page.tsx`: The main page component that will host the IDE-style layout.
- `components/ui/resizable.tsx`: The core resizable panel components from a library like `shadcn/ui` built on `react-resizable-panels`.
- `components/capture-layout.tsx`: The main component that orchestrates the multi-panel IDE-style layout.
- `components/workspace-switcher.tsx`: UI component for viewing and switching between workspaces.
- `components/sidebar-left.tsx`: The left sidebar component, acting as the main navigator for projects and conversations.
- `components/sidebar-right.tsx`: The right sidebar component, displaying contextual details for the selected item.
- `components/chat.tsx`: The core conversational chat component, including message display and input form.
- `lib/db.ts`: Instantiates and exports the Prisma client for database access.
- `lib/actions.ts`: Server Actions for all database CRUD operations (Workspaces, Projects, etc.).
- `app/api/chat/route.ts`: The dedicated API route for handling the AI conversation stream via the Vercel AI SDK.
- `.env.local`: For storing all secret keys (database URL, AI provider keys).

### Notes

- We will use Next.js Server Actions for data mutations to simplify the API layer.
- Unit and integration tests will be created alongside the components and functionality they cover.

## Tasks

- [ ] **1.0 Project Scaffolding & Initial Setup**
  - [ ] 1.1 Initialize a new Next.js project using the most reliable method (manual copy from `vercel/ai` examples).
  - [ ] 1.2 Install all necessary dependencies: `ai`, `react-resizable-panels`, `@prisma/client`, `pg`.
  - [ ] 1.3 Install development dependencies: `prisma`, `typescript`, `@types/node`.
  - [ ] 1.4 Create and populate `.env.local.example` with required environment variables (DATABASE_URL, OPENAI_API_KEY, etc.).
  - [ ] 1.5 Configure `tsconfig.json` and `next.config.mjs`.
  - [ ] 1.6 Initialize Prisma and create the initial database schema in `prisma/schema.prisma` with models for `Workspace`, `Project`, and `Conversation`.

- [ ] **2.0 Core UI Layout & Shell**
  - [ ] 2.1 Create the root application layout in `app/layout.tsx`.
  - [ ] 2.2 Implement the main `capture-layout.tsx` component using `react-resizable-panels`.
  - [ ] 2.3 This component will define the resizable left sidebar, main content area, and right sidebar.
  - [ ] 2.4 Add placeholder components for `sidebar-left.tsx` and `sidebar-right.tsx`.
  - [ ] 2.5 Implement CSS media queries to make the layout collapse gracefully into a single-column view on mobile screens.

- [ ] **3.0 Database & API Layer**
  - [ ] 3.1 Finalize the Prisma schema to include all relations: links between conversations and dependencies.
  - [ ] 3.2 Run the initial database migration to create the tables.
  - [ ] 3.3 Create Next.js Server Actions in `lib/actions.ts` for all required database operations:
    - `fetchWorkspaces()`
    - `createWorkspace(name)`
    - `fetchProjects(workspaceId)`
    - `createProject(name, workspaceId)`
    - `fetchConversations(projectId)`
    - `moveConversationToProject(conversationId, projectId)`
  - [ ] 3.4 Implement the backend logic for the web capture feature. This will likely be a Server Action called from the chat component.

- [ ] **4.0 Conversational Chat Interface**
  - [ ] 4.1 Build the `chat.tsx` component with a message display area and the user input form.
  - [ ] 4.2 Integrate the Vercel AI SDK's `useChat` hook to manage the conversation state.
  - [ ] 4.3 Create the `app/api/chat/route.ts` backend route to stream responses from the chosen LLM.
  - [ ] 4.4 Connect the frontend chat component to this API route.
  - [ ] 4.5 Implement the UI for on-demand diagramming, which will detect when an AI response is Mermaid.js code and render it visually.
  - [ ] 4.6 (Stretch) Implement the initial UI for voice input (e.g., a "hold-to-talk" button).

- [ ] **5.0 Organizational Features**
  - [ ] 5.1 Implement the `sidebar-left.tsx` component to fetch and display the list of projects and conversations for the active workspace in a hierarchical view.
  - [ ] 5.2 Add functionality to the left sidebar for creating new projects.
  - [ ] 5.3 Implement drag-and-drop functionality to move conversations from the `Inbox` into projects.
  - [ ] 5.4 Implement the `sidebar-right.tsx` to display details for a selected conversation.
  - [ ] 5.5 In the right sidebar, add UI for creating and viewing links to other conversations.
  - [ ] 5.6 In the right sidebar, add UI for setting and viewing dependencies on other conversations. 