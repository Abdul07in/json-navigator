# JSON Navigator

A modern, feature-rich JSON visualization and comparison tool built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **JSON Visualization**: Browse complex JSON structures with an interactive, collapsible tree view.
- **JSON Comparison**: Compare two JSON objects to identify differences (diffing) with visual highlights.
- **Modern UI**: Clean and responsive interface built with Shadcn UI and Tailwind CSS.
- **Dark Mode Support**: Seamlessly switch between light and dark themes.
- **Input Flexibility**: Paste JSON directly or potentially load from files (depending on implementation details).
- **Client-Side Processing**: All processing happens in your browser - your data never leaves your device.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) (via Shadcn UI)
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management/Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 📦 Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Abdul07in/json-navigator.git
    cd json-navigator
    ```

2.  **Install dependencies**

    Using npm:
    ```bash
    npm install
    ```
    
    Or using Bun (recommended if available):
    ```bash
    bun install
    ```

3.  **Start the development server**

    ```bash
    npm run dev
    # or
    bun run dev
    ```

4.  **Open the app**

    Visit `http://localhost:8080/json-navigator/` in your browser.

## 🚀 Deployment

The application is deployed using GitHub Pages.

**Live URL**: [https://Abdul07in.github.io/json-navigator/](https://Abdul07in.github.io/json-navigator/)

### Deploying Updates

To deploy updates to GitHub Pages:

1.  Make your changes and commit them to the `main` branch.
2.  Push to GitHub.
3.  Go to the "Actions" tab in your GitHub repository.
4.  Select the "Manual Deploy to GitHub Pages" workflow.
5.  Click "Run workflow".

Alternatively, you can use the GitHub CLI:

```bash
gh workflow run deploy.yml
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
