
# PRD: Capture - MVP

## 1. Introduction/Overview

This document outlines the requirements for the Minimum Viable Product (MVP) of `capture`, a personal knowledge management and thought development application. The core purpose of `capture` is to provide a single, reliable place for a user to offload their thoughts, ideas, and web content, thereby reducing mental clutter and closing open loops. The primary interaction model is conversational, allowing the user to not only store ideas but to actively develop them through dialogue with an AI partner.

## 2. Goals

*   **G-1:** Create a frictionless experience for capturing thoughts and ideas via voice or text.
*   **G-2:** Provide a structured yet flexible workspace for manually organizing captured thoughts into a hierarchy of Workspaces, Projects, and Conversations.
*   **G-3:** Enable users to develop their ideas through conversation with an AI, including the ability to generate on-demand diagrams and visualizations.
*   **G-4:** Serve as a central repository for web content, automatically summarizing articles from URLs to be reviewed later.

## 3. User Stories

*   **US-1:** As a user, I want to quickly capture a fleeting thought using my voice so that I don't lose the idea while I'm on the go.
*   **US-2:** As a user with many open browser tabs representing ideas, I want to paste a URL into the app and have it automatically saved and summarized so that I can confidently close the tab.
*   **US-3:** As a user developing a new concept, I want to have a conversation with an AI to brainstorm, explore edge cases, and refine my idea, preserving the entire dialogue for future reference.
*   **US-4:** As a user trying to understand a complex process, I want to ask the AI to generate a flowchart or mind map so I can visualize the information.
*   **US-5:** As a user organizing my thoughts, I want to group related conversations into projects (e.g., "Website Redesign") and broader workspaces (e.g., "Work") so I can maintain context and focus.
*   **US-6:** As a user planning a project, I want to create dependencies between two conversation threads to signify that one is blocked by the other.

## 4. Functional Requirements

### FR-1: Workspace Management
*   The system must allow the user to create, rename, and delete multiple Workspaces.
*   The user must be able to select one Workspace as the active context. All other views and actions will be contained within this active Workspace.

### FR-2: Project and Conversation Hierarchy
*   Within a Workspace, the system must allow the user to create, rename, and delete Projects.
*   Conversations must be containable within Projects or within a default `Inbox`.
*   The system must allow the user to move a Conversation from the `Inbox` to a Project, or between Projects.

### FR-3: Conversational Interface
*   The system must provide a chat interface as the primary method of interaction.
*   The user must be able to submit input via a keyboard.
*   The user must be able to submit input via voice.
*   Each user message and AI response will be part of a persistent `Conversation` thread.

### FR-4: AI-Powered Interaction
*   The system must integrate with an LLM to provide conversational responses.
*   The system must be able to receive a request for a diagram and generate a visual representation (e.g., a Mermaid.js diagram) in the chat interface.

### FR-5: Web Content Capture
*   If a user pastes a URL into the chat, the system must detect it, fetch the content in the background, generate a summary and title, and create a new Conversation with that information.

### FR-6: Organization
*   The system must allow a user to create a link between two distinct `Conversation` threads.
*   The system must allow a user to define a dependency relationship between two `Conversation` threads.

### FR-7: UI/UX
*   The application must feature a responsive, multi-panel layout.
*   On desktop, the layout will consist of resizable sidebars and a main content area.
*   On mobile, the layout will collapse into a single-column view to ensure usability.

## 5. Non-Goals (Out of Scope for MVP)

*   **NG-1:** The AI will not proactively or automatically suggest links between conversations or otherwise analyze the user's knowledge base.
*   **NG-2:** There will be no dedicated analytics dashboard for viewing usage statistics or thought trends.
*   **NG-3:** The application is for single-user access only. No collaboration, sharing, or multi-user features will be implemented.
*   **NG-4:** There will be no automated status tracking (e.g., "To Do," "In Progress"). Organization is handled purely by structure and dependencies.

## 6. Design Considerations

*   The UI should be clean, minimal, and prioritize speed to reduce friction in capturing ideas.
*   The multi-panel desktop layout should be inspired by modern IDEs like VS Code, using libraries like `react-resizable-panels` to achieve the desired feel.
*   The mobile view should be streamlined for quick capture and conversation, with organizational features accessible but not cluttering the primary interface.

## 7. Success Metrics

*   **Primary Metric:** The user feels a noticeable reduction in their mental clutter and the number of open browser tabs they need to manage.
*   **Driving Metrics:**
    *   The user engages with the app daily to capture thoughts.
    *   The user successfully develops new ideas from initial seeds into more structured concepts through AI conversation.

## 8. Open Questions

*   None at this time. The scope for the MVP is considered well-defined. 