# Product Requirements Document (PRD)
## Project: Keyboard-First Pageless RTF Editor with Split View (MVP)

### 1) Purpose
Build a desktop app (Electron-based) for rapid project planning and outlining. The editor is optimized for extreme efficiency, simplicity, and keyboard-first workflows (Vim/CLI/terminal-oriented users). The app supports rich text editing while enforcing Markdown-like structural rules so documents can be exported cleanly to Markdown (`.md`) or plain text (`.txt`) for CLI tools and LLM ingestion.

### 2) Goals
- Enable distraction-free, fast writing and outlining with minimal UI and strong keyboard workflows.
- Support rich text formatting commonly used for planning documents.
- Provide a split-view workflow for side-by-side referencing, comparison, and editing.
- Provide reliable, clean exports to `.md` and `.txt`.

### 3) Non-Goals (Out of Scope for MVP)
- Images, tables
- Plugins/extensions
- Cloud sync
- Collaboration/multi-user editing
- PDF export / printing
- Modal Vim editing (may be considered later; MVP is non-modal)

---

## 4) Target Users
- Builders/product/dev/design operators who plan MVPs rapidly.
- Keyboard-centric users accustomed to editor shortcuts, CLI tools, and structured notes.
- Users who want to export plans into Markdown/text for downstream tooling (CLI or LLMs).

---

## 5) Core Concepts and Definitions
- **Pageless document:** A single continuous scrollable document (no page boundaries).
- **Single-pane:** One document shown in a single editor pane.
- **Split view:** Two editor panes displayed side-by-side.
- **Same-document split:** Both panes display the same underlying document, with independent cursors and scroll positions.
- **Dual-document split:** Each pane displays a different document; one doc per pane.

---

## 6) MVP Feature Set

### 6.1 Editing Model
**Requirements**
- The editor is **pageless** and continuous.
- Default app launch opens in **single-pane** mode with one document.

**Acceptance Criteria**
- No page boundaries or pagination UI in the editor surface.
- Scrolling is continuous and smooth.

---

### 6.2 Rich Text Formatting (RTF-Oriented)
**Must-have formatting tools**
- Bold, Italic, Underline
- Font family selector
- Font size selector
- Font color selector
- Text alignment (left/center/right)

**Keyboard-first behavior**
- All formatting actions must be accessible via keyboard shortcuts and command palette.
- Mouse use must be optional.

**Acceptance Criteria**
- Users can apply formatting to selected text using keyboard-only.
- Formatting controls exist but do not overwhelm the UI (minimal toolbar + command palette).

---

### 6.3 Markdown-Style Structural Rules
**Intent**
Although the editor stores content as rich text, it follows Markdown-like structure so exports are clean.

**Markdown-safe subset (guaranteed on export)**
- Headings (at least H1–H3)
- Bulleted and numbered lists
- Bold/Italic (Underline is not standard Markdown; see Export Rules)
- (Optional but recommended) inline code + code block + blockquote (if included, must be consistent in export)

**Acceptance Criteria**
- Documents can be authored using headings and lists with predictable behavior.
- Structure is preserved in `.md` and `.txt` export.

---

### 6.4 Split View
#### 6.4.1 Enter/Exit Split View
- App starts in **single-pane**.
- User can toggle **Split view** at any time via keyboard shortcut/command.
- Window can be resized freely; split view should adapt to available width.

**Acceptance Criteria**
- Split view can be enabled/disabled without losing state.
- Split view works at various window sizes; no forced resizing.

#### 6.4.2 Same-Document Split (Model A)
**Requirements**
- Both panes show the same underlying document.
- Each pane has:
  - independent cursor/selection
  - independent scroll position
- When editing in Pane A, Pane B **remains fixed** at its current scroll position.
- Provide a **Sync scroll** toggle:
  - user-controlled
  - default OFF

**Acceptance Criteria**
- Editing in one pane does not force-scroll the other pane.
- Sync scroll, when enabled, synchronizes pane scroll positions per the defined behavior (implementation may be offset-based).

#### 6.4.3 Dual-Document Split
**Requirements**
- One document per pane (no tabs required for MVP).
- Each pane has:
  - independent undo/redo history
  - independent save state
  - independent export actions
- Provide clear document labels in each pane header.

**Acceptance Criteria**
- User can open/create a second document for the right pane.
- Edits in one document do not affect the other.

---

### 6.5 Focus, Visual Cues, and Active Pane Rules
**Requirements**
- The app must make it unambiguous which pane is active.
- Provide:
  - colored focus border on active pane
  - header highlight on active pane
- All commands apply to **active pane only** (formatting, typing, edit operations).

**Keyboard**
- Must include shortcuts to focus left pane and right pane.

**Acceptance Criteria**
- Active pane is visually obvious.
- Formatting command affects only the active pane selection.

---

### 6.6 Paste Behavior
**Requirements**
- Paste defaults to **plain text**.
- (Recommended) Provide an alternate action: “Paste with formatting” (menu/shortcut), but this may be deferred if necessary.

**Acceptance Criteria**
- Standard paste strips formatting from clipboard content by default.

---

### 6.7 Import/Export
#### 6.7.1 Export to Markdown (`.md`)
**Requirements**
- Export produces clean Markdown optimized for CLI/LLM consumption.
- Preserve Markdown-safe subset (headings, lists, bold/italic).
- Handle non-Markdown formatting consistently:
  - Font family/size/color: **not represented** in `.md` export (dropped)
  - Alignment: dropped
  - Underline: convert to italic/bold or drop (choose one policy; see below)

**Policy (MVP)**
- Default: **drop non-Markdown styling** on `.md` export.
- Underline policy: **drop underline** on `.md` export (recommended, simplest).

**Acceptance Criteria**
- `.md` export contains no inline HTML styling by default.
- Structure remains readable and consistent.

#### 6.7.2 Export to Plain Text (`.txt`)
**Requirements**
- Export as plain text preserving structure:
  - headings may be prefixed with `#` markers (recommended)
  - lists with `-` or numeric prefixes
- All formatting dropped.

**Acceptance Criteria**
- `.txt` export is readable and preserves outline structure.

#### 6.7.3 Import from Markdown (Optional for MVP, depending on priority)
**Requirements**
- Import supports the markdown-safe subset and converts it into internal rich text structure.
- Unsupported markdown constructs become plain text.

**Acceptance Criteria**
- Imported `.md` retains headings/lists and emphasis where possible.

---

### 6.8 Saving, Autosave, and Reliability (MVP-Level)
**Requirements**
- Local-first files.
- Autosave supported (frequency/trigger defined by implementation).
- Visible save state per document: “Saved / Saving / Unsaved”.
- Session restore on crash/restart (at least “restore last open document(s)”).

**Acceptance Criteria**
- Users do not lose content due to normal app closure or crash.
- Save indicator is visible and accurate.

---

## 7) Keyboard-First Requirements (Global)
**Requirements**
- Every core action must be accessible via keyboard:
  - toggle split view
  - focus left/right pane
  - toggle scroll sync (same-doc split)
  - open/new/save/save as
  - export `.md` and `.txt`
  - formatting actions
  - search (recommended)

**Acceptance Criteria**
- A user can complete all MVP workflows without using a mouse.

---

## 8) Primary User Workflows (MVP)

### Workflow A: Start writing a plan
1. Launch app → single-pane opens with a new or restored document
2. Write headings/lists
3. Save document
4. Export to `.md` and/or `.txt`

### Workflow B: Same-document split for reference + edit
1. Toggle split view
2. Same-document split opens
3. Scroll panes independently (reference on right, edit on left)
4. Optionally toggle scroll sync
5. Continue editing; right pane remains fixed unless sync is enabled

### Workflow C: Dual-document split for comparison
1. Toggle split view
2. Switch to dual-document mode (if a mode chooser exists)
3. Open a different document in the right pane
4. Edit either document with independent save states
5. Export either doc independently

---

## 9) UX/UI Requirements (Minimal, Non-Distracting)
- Minimal toolbar (only frequently used formatting + view toggles).
- Command palette for discoverability and speed.
- No heavy sidebars by default; optional lightweight outline/search is acceptable if it stays minimal.

**Active pane cues**
- Active pane has a clear border/highlight.
- Pane headers show document names and save state.

---

## 10) Performance Targets (MVP Guidance)
- Fast startup (target defined by team)
- Typing latency should feel instantaneous on large planning documents.
- Stable memory use; no degradation with long continuous documents (target defined by team).

---

## 11) Open Decisions (Must be finalized before build)
1. Underline export policy (recommended: drop underline on `.md` export).
2. Whether Markdown import is included in MVP or v1.1.
3. Whether to include inline code/code blocks/blockquote in MVP (recommended if the audience is CLI/LLM heavy; otherwise defer).
4. Exact shortcut scheme (Vim-like vs VS Code-like vs minimal custom).  
   (Requirement: must be keyboard-complete regardless of scheme.)

---

## 12) Delivery Criteria (Definition of Done)
MVP is considered complete when:
- Single-pane editing works with required rich text formatting.
- Split view works in both same-doc and dual-doc modes with correct focus cues.
- Same-doc split keeps the other pane fixed on edit; scroll sync toggle works.
- Default paste is plain text.
- Save/autosave prevents data loss and shows accurate save state.
- Export to `.md` and `.txt` produces clean, readable outputs and preserves structure.
- All core actions are keyboard-accessible via shortcuts and/or command palette.

---

## 13) Hand-off Notes for an AI Coding Agent
- Do not implement out-of-scope features.
- Prioritize correctness of:
  - same-document split behavior
  - save/autosave + recovery
  - clean export rules
  - keyboard completeness and focus state clarity
- Keep UI minimal and reduce configuration surfaces; optimize for speed and predictability.
