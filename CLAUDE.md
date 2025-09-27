# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri desktop application with a React frontend called "claude-controller". It appears to be a workflow automation tool for managing development tasks with integration to Jira and Claude AI agents.

## Architecture

### Frontend (React + TypeScript)
- **Tech Stack**: React 19, TypeScript, Tailwind CSS v4, Vite
- **UI Components**: Custom UI components in `src/components/ui/` using Radix UI primitives
- **Main Components**:
  - `WorkflowPipeline`: Displays a 4-step workflow (Select Ticket → Plan → Develop → QA Test)
  - `JiraTicketSelector`: Interface for selecting Jira tickets
  - `PlanEditor`: Interface for editing implementation plans
  - `IntegrationStatus`: Shows status of various integrations
  - `StatusIndicator`: Displays status of different workflow components

### Backend (Rust + Tauri)
- **Framework**: Tauri v2 with Rust backend
- **Plugins**: tauri-plugin-opener for opening external URLs
- **Configuration**: Standard Tauri setup with window size 800x600

### Key Files Structure
```
src/
├── App.tsx                     # Main application component
├── components/
│   ├── ui/                     # Reusable UI components (button, card, input, etc.)
│   ├── WorkflowPipeline.tsx    # Main workflow visualization
│   ├── JiraTicketSelector.tsx  # Jira integration component
│   ├── PlanEditor.tsx          # Plan editing interface
│   └── StatusIndicator.tsx     # Status display component
├── lib/
│   └── utils.ts                # Utility functions (likely includes cn() for class merging)
└── styles/
    └── global.css              # Global styles and Tailwind imports

src-tauri/
├── src/
│   ├── main.rs                 # Tauri application entry point
│   └── lib.rs                  # Rust library code
├── Cargo.toml                  # Rust dependencies
└── tauri.conf.json             # Tauri configuration
```

## Development Commands

### Frontend Development
- **Start dev server**: `pnpm dev` (runs on http://localhost:1420)
- **Build frontend**: `pnpm build` (TypeScript compilation + Vite build)
- **Preview build**: `pnpm preview`

### Tauri Desktop App
- **Run Tauri dev**: `pnpm tauri dev` (builds both frontend and Tauri app)
- **Build Tauri app**: `pnpm tauri build`

### Project Management
- **Package manager**: pnpm (not npm)
- **TypeScript**: Strict mode enabled with comprehensive linting rules

## Key Configuration Notes

- **Path aliases**: `@/*` maps to `./src/*` for imports
- **Tailwind CSS**: v4 with Vite plugin integration
- **Tauri**: Configured to run frontend dev server before starting desktop app
- **TypeScript**: Strict configuration with unused variable/parameter checking
- **React**: Version 19 with modern JSX transform

## Workflow Concept

The application implements a 4-step development workflow:
1. **Select Ticket**: Choose a Jira ticket to work on
2. **Plan**: Claude AI creates an implementation plan
3. **Develop**: Code implementation phase
4. **QA Test**: Quality assurance and testing

This suggests the app is designed to automate or assist with software development workflows, potentially integrating with external tools like Jira for project management and Claude AI for planning assistance.