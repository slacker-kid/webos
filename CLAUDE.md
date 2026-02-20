# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WebOS is a browser-based desktop operating system simulation built with Next.js 16 (App Router), React 19, and TypeScript. It renders a full desktop environment with draggable windows, a virtual file system, a taskbar, and multiple built-in applications — all running client-side with localStorage persistence.

## Commands

- `npm run dev` — Start development server (Next.js dev mode)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint (flat config, v9)

No test framework is configured.

## Architecture

### Component Hierarchy

```
page.tsx → OS → FileSystemProvider → OSProvider → DesktopEnvironment
                                                    ├── Desktop (icons, wallpaper, right-click menu)
                                                    ├── WindowManager → Window[] → AppContainer → [App]
                                                    └── Taskbar (window list, clock)
```

### Two React Contexts Drive All State

1. **OSContext** (`src/context/OSContext.tsx`) — Window lifecycle (open/close/minimize/maximize/focus), z-index stacking, wallpaper. Exposes `useOS()` hook.
2. **FileSystemContext** (`src/context/FileSystemContext.tsx`) — In-memory tree of `FileNode` objects with path-based CRUD. Persists to localStorage on every change. Exposes `useFileSystem()` hook.

All components use `'use client'` — there is no server-side rendering in this project.

### Adding a New Application

1. Create component in `src/components/Apps/`
2. Add its type to the `AppType` union in `OSContext.tsx`
3. Add a case to the `AppContainer` switch in `OS.tsx`
4. Add a desktop icon in `Desktop.tsx` and a taskbar icon mapping in `Taskbar.tsx`

### Window System

Windows are managed as `WindowState[]` in OSContext. Each window gets a unique `id` (timestamp), `appType`, position, size, and z-index. `Window.tsx` uses Framer Motion for drag (title-bar only via `dragControls`) and animate between normal/maximized states. Maximized windows fill viewport minus 40px taskbar height.

### Virtual File System

`FileNode` is a recursive tree: directories have `children: { [name]: FileNode }`, files have `content: string`. All mutations deep-clone via `JSON.parse(JSON.stringify(...))`. The initial FS contains `/documents/welcome.txt` and `/desktop/`.

### Key Libraries

- **Framer Motion** — Window drag, open/close animations
- **Lucide React** — Icons throughout the UI
- **date-fns** — Clock formatting in Taskbar and Terminal `date` command

## Conventions

- Path alias: `@/*` maps to `./src/*`
- Tailwind CSS v4 (imported via `@import "tailwindcss"` in globals.css, no tailwind.config)
- React Compiler is enabled in `next.config.ts` for automatic memoization
- Dark theme throughout: base bg `#1e1e1e`, content bg `bg-gray-900`
- `eslint-disable-next-line react-compiler/react-compiler` is used in both contexts to suppress warnings on localStorage-driven state initialization inside useEffect

---
  UX Improvements Needed

  Window Management

  1. Window resizing is non-functional — Window.tsx:116-119 has a resize handle placeholder with an empty onMouseDown handler. Users cannot resize windows.
  2. Drag position tracking is broken — onDragEnd uses info.point.x/y (pointer position) instead of the window's actual position, so window position state drifts from where the window visually lands.
  3. No window snapping — Dragging a window to screen edges doesn't snap to half-screen or quarter-screen like modern desktop OSes.
  4. Minimized windows vanish from DOM — Window.tsx:38-39 returns null for minimized windows, losing all component state (Terminal history, editor content, game progress). Should hide with CSS instead.
  5. No restore animation — Minimizing/restoring jumps instantly instead of animating to/from the taskbar.

  Taskbar

  1. No system tray indicators — No battery, wifi, or volume icons. Even decorative ones would add polish.
  2. No Start menu or app launcher — The only way to open apps is via desktop icons, which are hidden behind open windows.

  Terminal

  1. No command history navigation — Arrow up/down doesn't cycle through previous commands.
  2. Limited command set — Missing common commands like mkdir, touch, rm, mv, cp that the file system already supports.
  3. No tab completion — Tab key does nothing for file/directory name completion.

  File Manager

  1. No drag-and-drop — Can't move files between folders by dragging.
  2. Uses window.prompt() for input — Creating files/folders uses browser native prompts instead of in-app dialogs, breaking the OS immersion.
  3. No breadcrumb navigation — Only shows current folder name, not the full path hierarchy.

  Text Editor

  1. No keyboard shortcut for save — Must click the Save button; Ctrl+S doesn't work.
  2. No unsaved changes warning — Closing a window with unsaved edits silently discards them.
  3. No syntax highlighting or line numbers — Plain textarea with no editor features.

  General

  1. No responsive/mobile support — The desktop metaphor assumes a large viewport; no touch gestures or mobile layout.
  2. localStorage size limits — Custom wallpaper images stored as base64 data URLs can quickly exhaust the ~5MB localStorage quota with no error handling.
  3. No keyboard shortcuts — No global shortcuts (e.g., Alt+F4 to close, Alt+Tab to switch windows).
  4. No loading/splash screen — The OS renders instantly with a flash; a boot animation would add immersion.
