# Development Guide for "Capture"

This document outlines the architectural, technical, and philosophical guidelines for building the `capture` application. It should be treated as the primary source of truth for all development decisions.

## 1. High-Level Vision

`capture` is a personal knowledge management and thought development application. Its core purpose is to provide a frictionless, conversational interface for a user to offload their thoughts, ideas, and web content, thereby reducing mental clutter. It is a "second brain" that acts as a creative partner, not just a storage system.

## 2. Core Principles

- **Conversational First:** The primary interaction model is a dialogue with an AI.
- **Frictionless Capture:** The highest priority is making it fast and easy to get an idea into the system. Voice is the preferred input method.
- **Manual Organization over Automation (for MVP):** The user is in full control of organizing their thoughts. The AI's role is to be a partner in developing ideas, not to manage the workspace automatically.
- **Inspired by the Best:** We are using the `midday-ai/midday` application as our visual and architectural **inspiration only**.

## 3. Technology Stack

The following technology stack is **non-negotiable** for the MVP:

- **Framework:** Next.js (with App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment & Hosting:** Vercel. All services (app, database, AI) will be hosted on Vercel to simplify management and ensure seamless integration for the MVP.
- **Database:** Vercel Postgres is the chosen database for the MVP.
- **Database ORM:** Prisma
- **AI Integration:** Vercel AI SDK
- **UI Components:** Shadcn/UI (or a similar "copy-paste" component library)
- **Layout:** `react-resizable-panels`

## 4. Architectural Blueprint (File Structure)

The project must follow this structure, based on our analysis of high-quality monorepos:

- **`src/` Directory:** All core application code will reside here.
- **`src/app/`:** For all pages, layouts, and routing, following Next.js App Router conventions.
- **`src/components/`:**
    - Contains high-level, feature-specific components (e.g., `ChatWindow`, `ProjectNavigator`).
    - **`src/components/ui/`:** Contains base-level, reusable UI elements like `Button.tsx`, `Dialog.tsx`, etc., in the style of Shadcn/UI.
- **`src/lib/`:** For shared logic, utility functions, database instantiation (`db.ts`), and Server Actions (`actions.ts`).

## 5. UI/UX Guidelines

- The interface must be a responsive, multi-panel "IDE-style" layout.
- The layout must be built with `react-resizable-panels` to allow for draggable resizing.
- It must collapse gracefully to a single-column view on mobile.
- The overall aesthetic (look, feel, and animations) should be heavily inspired by the **`midday-ai/midday`** dashboard.
- The specific implementation details for the design system are in `STYLEGUIDE.md`.

## 6. ⚠️ Licensing Constraint: Inspiration, Not Duplication

The `midday-ai/midday` repository (`/midday-inspiration`) is our visual and architectural blueprint. However, it is licensed under **AGPL-3.0**.

**You must NOT copy any code directly from this repository.**

Instead, analyze its structure and components, and then **re-implement them from scratch** within the `capture` codebase. This is a critical constraint to avoid licensing issues.

## 7. Development Workflow

All development must follow the structured workflow defined in this directory.

- **PRD:** The official requirements are in `tasks/prd-capture-mvp.md`.
- **Task List:** The implementation plan is in `tasks/tasks-prd-capture-mvp.md`.

You are to act as the AI Dev Agent as described in `process-task-list.md`, tackling one sub-task at a time and waiting for user approval before proceeding. 