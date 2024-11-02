# ScrapeScribe Frontend

A modern web interface for interactive web scraping and API generation. This frontend application allows users to visually select elements from web pages and generate custom APIs for data extraction.

## 🚀 Features

- **URL Input & Preview**: Enter any URL and view the rendered page directly in the application
- **Interactive Element Selection**: Point-and-click interface for selecting target elements
- **Visual Data Preview**: Real-time preview of extracted data
- **Drag-and-drop API Builder**: Design your custom API endpoints with an intuitive interface
- **Live Documentation**: Automatically generated API documentation based on your configuration
- **WebAssembly Integration**: High-performance processing using Rust-compiled WebAssembly

## 🛠️ Tech Stack

- Svelte
- Embedded Headless Browser Integration
- RESTful API Integration
- Modern UI Component Library
- TypeScript for Type Safety
- Rust + WebAssembly for Performance-Critical Operations

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser
- Backend API service running
- Rust toolchain
- wasm-pack

## 🚀 Running Locally

1. Install wasm-pack:
```bash
cargo install wasm-pack
```

2. Clone the repository (private access required)
```bash
git clone https://github.com/SrapeScribe/client.git
cd client
```

3. Install dependencies:
```bash
npm install
```

4. Build the WebAssembly:
```bash
npm run wasm:build
```

5. Configure environment variables:
```bash
cp .env.example .env
```

6. Start the development server:
```bash
npm run dev
```

7. Navigate to http://localhost:5173/

## 🏗️ Project Structure

```
src/
├── components/
│   ├── BrowserView/        # Embedded browser component
│   ├── ElementSelector/    # Element selection tools
│   ├── DataPreview/       # Data preview panel
│   ├── ApiBuilder/        # API configuration interface
│   └── common/            # Shared UI components
├── services/
│   ├── api/              # Backend API integration
│   ├── browser/          # Browser control functions
│   └── selectors/        # Element selector logic
├── store/                # State management
├── types/                # TypeScript definitions
├── wasm/                 # WebAssembly modules
└── utils/                # Helper functions
```

## 🔍 Available Scripts

- `npm run dev` - Start development server + build WebAssembly modules
- `npm run build` - Build for production + build WebAssembly modules
- `npm run wasm:build` - Build WebAssembly modules
- `npm run lint` - Run linter
- `npm run format` - Format code

## 📝 Development Guidelines

- Follow the established code style and formatting rules
- Update documentation as needed
- Use semantic commit messages
- Keep pull requests focused and manageable in size
- Ensure crucial changes are approved by the team

## 📚 Documentation

Additional documentation is available in the `docs/` directory:

- [Architecture Overview](docs/architecture.md)
- [Component Guide](docs/components.md)
- [API Integration](docs/api-integration.md)
- [Testing Strategy](docs/testing.md)
- [WebAssembly Integration](docs/wasm.md)

## 📄 License

This software is proprietary. Copyright (c) 2024 MYKYTA VITKOVSKYI.

### Academic Use
This software may be viewed and evaluated for educational purposes as part of a student project presentation.

### Commercial and Production Use
All rights reserved. Unauthorized copying, modification, or distribution is prohibited. See the [LICENSE](LICENSE) file for details.

---
This is a student project with restricted usage rights. See LICENSE for details.
