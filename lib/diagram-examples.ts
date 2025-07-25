// Example Mermaid diagrams for testing and demonstration

export const exampleDiagrams = {
  flowchart: `flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,

  mindmap: `mindmap
  root((Project Planning))
    Research
      Market Analysis
      Competitor Study
      User Interviews
    Design
      Wireframes
      Prototypes
      User Testing
    Development
      Frontend
      Backend
      Database
    Launch
      Marketing
      Deployment
      Analytics`,

  sequence: `sequenceDiagram
    participant User
    participant App
    participant Database
    
    User->>App: Submit form
    App->>Database: Save data
    Database-->>App: Confirmation
    App-->>User: Success message`,

  class: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    
    class Project {
        +String title
        +Date created
        +addUser()
        +removeUser()
    }
    
    User ||--o{ Project : creates`,

  gantt: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Planning
    Research       :2024-01-01, 2w
    Analysis       :2024-01-15, 1w
    section Development
    Setup          :2024-02-01, 3d  
    Core Features  :2024-02-04, 2w
    Testing        :2024-02-18, 1w
    section Launch
    Deployment     :2024-03-01, 2d
    Marketing      :2024-03-03, 1w`
}

export const diagramPrompts = [
  "Create a flowchart for my morning routine",
  "Draw a mindmap of web development skills",
  "Show me a sequence diagram for user authentication",
  "Generate a class diagram for a blog system",
  "Create a gantt chart for a 3-month project"
]