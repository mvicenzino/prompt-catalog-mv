# Implementation Plan - Prompt Catalog App

## Goal
Create a premium, modern web application to catalog and manage prompts for various media (photos, apps, images) from sources like X and Reddit, with the ability to add custom prompts.

## Tech Stack
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State/Storage**: LocalStorage for persistence

## Features
1.  **Dashboard**: Grid view of all prompts.
2.  **Categories**: Filter by Photos, Apps, Images, Coding, etc.
3.  **Add Prompt**: Modal/Page to add new prompts with metadata (Source, Tags).
4.  **Search**: Real-time filtering.
5.  **Copy to Clipboard**: One-click copy for prompts.

## Design System (Premium/Dark Mode)
- **Colors**: Deep dark backgrounds, glassmorphism effects, vibrant gradients for accents.
- **Typography**: Inter (Google Fonts).
- **Components**: Rounded corners, smooth transitions, hover effects.

## Step-by-Step Implementation

### Phase 1: Foundation & Styling
- [ ] Set up `index.css` with CSS variables for the theme.
- [ ] Create basic layout structure (Sidebar + Main Content).
- [ ] Install and configure `react-router-dom`.

### Phase 2: Core Components
- [ ] Create `PromptCard` component.
- [ ] Create `PromptGrid` component.
- [ ] Create `Sidebar` navigation.
- [ ] Create `Header` with Search.

### Phase 3: Data & Logic
- [ ] Create `usePrompts` hook for managing state and LocalStorage.
- [ ] Implement "Add Prompt" functionality (Modal or Page).
- [ ] Implement Search and Filter logic.

### Phase 4: Polish
- [ ] Add animations (framer-motion or CSS transitions).
- [ ] Add "Copy" feedback.
- [ ] Ensure responsive design.
