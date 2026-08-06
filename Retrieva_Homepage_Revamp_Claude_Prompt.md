# Claude Code Prompt --- Retrieva Homepage Revamp

You are a senior frontend engineer and product designer. Redesign the
Retrieva homepage into a modern enterprise AI workspace while preserving
the existing React architecture and functionality. Do **not** redesign
the sidebar navigation structure or routing. Focus purely on the
homepage UI.

## Design Goals

-   Transform the homepage from a simple chatbot into an AI Knowledge
    Workspace.
-   Light mode only.
-   Premium SaaS aesthetic inspired by Glean, Linear, Notion AI, and
    modern enterprise AI tools.
-   Use **Open Sauce** as the global font.
-   Reduce empty whitespace while keeping the interface uncluttered.
-   Use subtle glassmorphism, soft shadows, rounded corners, and blue
    accents.

------------------------------------------------------------------------

# Global Styling

## Colour Palette

-   Background: `#F7FAFF`
-   Card: `#FFFFFF`
-   Primary Blue: `#2563EB`
-   Secondary Blue: `#3B82F6`
-   Accent Blue: `#60A5FA`
-   Borders: `#E4ECF7`
-   Primary Text: `#0F172A`
-   Secondary Text: `#64748B`

Avoid dark greys and black.

## Typography

Use **Open Sauce** throughout.

Hierarchy:

-   Greeting: 44--48px Bold
-   Section Titles: 24px Semibold
-   Card Titles: 18px Medium
-   Description Text: 14--15px Medium
-   Navigation: 16px

------------------------------------------------------------------------

# Sidebar Improvements

Keep the existing structure.

Improve:

-   Softer rounded containers
-   Better spacing
-   Improved active state
-   Larger icons
-   More premium hover effects

### New Chat Button

Keep placement.

Improve:

-   Gradient blue
-   Larger radius
-   Better padding
-   Softer shadow
-   Smooth hover transition

### Recent Chats

Keep existing functionality.

Improve typography, spacing and hover states.

### Sidebar Footer

Retain the Retrieva Pro usage card.

Include:

-   Progress bar
-   Upgrade CTA
-   Rounded corners
-   Soft shadow

------------------------------------------------------------------------

# Homepage

## Greeting

Replace

> What's on the agenda today?

with

> Good morning, John! 👋

Subtitle:

> Your AI knowledge companion for faster, smarter decisions.

------------------------------------------------------------------------

# Replace KPI Cards

Do NOT use KPI/stat cards.

Instead create four horizontally stacked Action Cards above the chat
box.

Cards:

1.  Summarise a doc
    -   Get key takeaways from long documents.
2.  Find Insights
    -   Discover patterns across your knowledge.
3.  Analyse Data
    -   Visualize and interpret structured data.
4.  Explain a Concept
    -   Get simple explanations with citations.

Each card should include:

-   Blue outline icon
-   White background
-   Rounded corners
-   Soft shadow
-   Blue hover border
-   Hover elevation

These are actionable shortcuts, not statistics.

------------------------------------------------------------------------

# Chat Area

Completely redesign the chat input.

Requirements:

-   Larger border radius
-   Increased padding
-   Taller input
-   Soft blue border
-   Glass-like white background
-   Subtle shadow

Layout:

Left:

-   Attachment icon

Center:

-   Placeholder: "How can I help you today?"

Right:

-   Microphone icon
-   Filled blue circular send button

The chat input should become the primary visual focus.

------------------------------------------------------------------------

# Quick Access

Below the chat area.

Purpose:

Provide one-click access to frequently used knowledge sources.

Examples:

-   Google Drive
-   Slack
-   Research Papers
-   Meeting Notes
-   All Sources

Display these as compact horizontal tiles instead of large cards.

Each tile should contain:

-   Connector icon
-   Connector name

Icons should be loaded from:

`frontend/public/connectors/`

Do not use external icons for connectors.

Make these tiles compact (≈55--65px height).

------------------------------------------------------------------------

# Remove These Sections

Remove entirely:

-   Pinned Prompts
-   Recent Activity
-   Recommended For You
-   Try Something New

Do not replace them with placeholder cards.

------------------------------------------------------------------------

# Top Navigation

Retain:

-   Username
-   Avatar
-   Theme toggle

Improve spacing only.

------------------------------------------------------------------------

# Layout

-   Reduce unused whitespace.
-   Increase information density without clutter.
-   Align everything on a consistent grid.
-   Ensure the homepage fits comfortably above the fold on 1440p
    displays.
-   Card radius: 16--20px.
-   Chat input radius: 24--28px.
-   Use subtle shadows and soft blue borders.

------------------------------------------------------------------------

# Interactions

Add smooth transitions (150--200ms).

Interactive components should have:

-   Blue border on hover
-   Slight elevation
-   Soft shadow

------------------------------------------------------------------------

# Empty State

Replace "No chats yet" with:

> Start a new conversation or choose one of the quick actions above to
> begin exploring your knowledge base.

------------------------------------------------------------------------

# Accessibility

-   Maintain high contrast.
-   Keyboard focus states.
-   Minimum 44x44 interaction targets.

The final result should feel like a premium enterprise AI workspace
rather than a generic chatbot.
