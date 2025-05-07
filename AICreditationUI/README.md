# AI Creditation UI

A React-based web application for automatically generating comprehensive service accreditation documentation using AI.

## Overview

AI Creditation is a user-friendly tool designed to help technical writers, developers, and service owners quickly create detailed documentation for various services and technologies. The application leverages AI to generate well-structured, professional documentation based on the topic you provide.

## Features

- **AI-Powered Documentation Generation**: Enter any service topic to get comprehensive documentation
- **Real-Time Streaming**: Watch as your documentation is generated in real-time
- **Document Extraction**: Easily extract and save just the document content without AI comments
- **Markdown Support**: Full markdown rendering with support for code blocks, tables, and more
- **Copy & Save Options**: Copy to clipboard or save as markdown files with a single click
- **Dark/Light Theme Support**: Comfortable viewing in any lighting environment

## Getting Started

### Prerequisites

- Node.js (version 16.x or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/auto-docs.git
   cd auto-docs/AICreditationUI
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables
   - Create a `.env` file in the root directory with the following:
   ```
   VITE_BACKEND_URL=http://your-backend-url
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage

1. Enter a service topic in the input field (e.g., "Azure Blob Storage")
2. Click "Generate" to start the AI documentation generation
3. View the real-time documentation generation
4. When complete, use the toolbar to:
   - Copy the full content
   - Copy only the document content (without AI comments)
   - Save the content as a markdown file

## Technologies Used

- React
- TypeScript
- Vite
- Fluent UI React Components
- React Markdown
- React Syntax Highlighter

## License

This project is licensed under the terms found in the [LICENSE](./LICENSE) file
