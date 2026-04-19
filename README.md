# Translink CMS — Unified Studio

A deterministic, token-driven studio for content, camera, scene, audio, and 3D pipelines.

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install
```

### Development
```bash
# Start the local development server
npm run dev
```
The application will be available at `http://localhost:5173`.

### Production Build
```bash
# Build for production
npm run build
```
The optimized files will be generated in the `dist/` directory.

## 📁 Project Structure

- **`src/pages`**: Contains the main application routes (Editor, Studio, Camera, etc.).
- **`src/components`**: Shared and page-specific UI components.
- **`docs/`**: Internal documentation, including the [Component Structure](./docs/component-structure.md).
- **`public/`**: Static assets, including the custom `TP` favicon.

## 🛠 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: Zustand
- **Animations**: Framer Motion / Tailwind Animate

## 🔒 Offline & Local
This project is configured for **full offline development**. 
- No Git tracking is present.
- External analytics and metadata (like Lovable tags) have been removed.
- Browserslist update warnings are suppressed via `.env`.

---
© 2026 Translink. All rights reserved.
