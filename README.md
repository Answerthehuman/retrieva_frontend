# Retrieva - Enterprise RAG Front-End

Welcome to the proprietary front-end codebase for **Retrieva**, a highly polished enterprise Retrieval-Augmented Generation (RAG) platform tailored for retail analytics and conversational search. Inspired by ChatGPT and NotebookLM, Retrieva combines search capability with context controls.

This project is built using:
- **Framework**: React (Vite + TypeScript)
- **Styling**: Tailwind CSS & Vanilla CSS
- **Design Primitives**: Radix UI components
- **State Management**: Zustand
- **API Integration**: Axios

---

## Proprietary Software & Intellectual Property

> [!IMPORTANT]
> This repository represents proprietary intellectual property (IP). All styling, design layout systems, interactive panels, state configurations, and RAG UI widgets are private properties. Redistribution, cloning, or reproduction of these assets without explicit authorization is strictly prohibited.

---

## User Interaction Flows

### 1. Unified Sidebar Navigation
- **Navigation Panel**: The left sidebar provides instant access to the three core application areas:
  - **Chats**: Default active view for conversational query sessions.
  - **Knowledge Base**: Dedicated dashboard for document management. Selecting this expands a nested list of custom data collections (e.g., *Marketing*, *HR*, *Engineering*, *Finance*, *Product*).
  - **Settings**: Configuration center for system parameters.
- **Nested Collections**: Under the Knowledge Base item, users can view document counts for each collection. Clicking a collection loads the Knowledge Base page pre-filtered to that specific collection context. Users can also create new collections dynamically using the **+ New Collection** button.

### 2. Conversational Chat Workspace
- **Context Filtering**: Above the chat messages, a sticky **Active Context Selector** displays rounded collections pills that are currently used to filter the RAG query context. Users can remove a collection by clicking its `×` button, or add/change collections using the dropdown selection menu.
- **Drag-and-Drop File Attachments**: The message input box supports file attachments.
  - Click the paperclip icon `[📄]` to open the native explorer, supporting `.pdf`, `.docx`, `.txt`, `.md`, `.csv`, `.xlsx`, and `.pptx` formats.
  - Alternatively, drag documents directly onto the input box. The input container lights up with a glowing ring highlight during drag-over states.
  - Selected files are rendered as chips displaying file-type icons and delete buttons above the textbox.

#### Chat Interface Visual Layout
<!-- USER PLACEHOLDER: Replace the path below with your chat interface screenshot -->
![Chat Interface Screenshot](./docs/chat_interface.png)
*(Placeholder: Add your chat window screenshot inside the `./docs/` folder named `chat_interface.png`)*

### 3. Citations & Sliding Right Panel
- **Sources Used**: Below assistant messages that query the index, a dedicated citation section displays file cards containing type icons, names, pages, and similarity matching percentages.
- **Context Details Side Drawer**: Clicking any source card slides in a 360px panel from the right:
  - **Sources Tab**: Check or uncheck retrieved documents (local frontend state toggle), view aggregate retrieval confidence, and check which collection directories were searched.
  - **Relevant Chunks Tab**: Inspect textual snippets (chunks) extracted from files that match the search query, with expand buttons that reveal full chunks in monospace text.
  - **Details Tab**: Detailed technical diagnostics (query response times, similarity models, LLM engine names, top-K config, hybrid search weight sliders, vector DB host names).

### 4. Knowledge Base Workspace
- **Stats Dashboard**: Dynamic tiles displaying Total Documents, Indexed Files, Out-of-date Files, Chunk Counts, and disk space usage.
- **Search & Filters**: Search document tables instantly by title, file type, active status (Indexed, Processing, Failed, Needs Re-index), or collection.
- **Bulk Operations**: Selecting multiple rows toggles a bulk action banner at the bottom, letting administrators re-index files, move them into other collections, or batch-delete records.
- **Document Details Slider**: Clicking any row slides in a 400px details drawer from the right. This includes:
  - **Overview**: Complete file metadata, model types, file size, and direct options to delete, download, or re-index.
  - **Preview**: High-fidelity document render placeholder.
  - **Activity Tab**: Timed audit trail showing the lifecycle of the document (uploaded date, chunk splits count, indexing logs).

#### Knowledge Base Workspace Visual Layout
<!-- USER PLACEHOLDER: Replace the path below with your knowledge base screenshot -->
![Knowledge Base Screenshot](./docs/knowledge_base.png)
*(Placeholder: Add your knowledge base window screenshot inside the `./docs/` folder named `knowledge_base.png`)*

---

## Local Setup & Development

Ensure you have [Node.js](https://nodejs.org/) installed.

```bash
# 1. Install workspace dependencies
npm install

# 2. Start the local Vite development server
npm run dev

# 3. Build optimized production assets
npm run build
```
