# Contributing to X-Repo

First off, thank you for considering contributing to X-Repo! We welcome all contributions to help democratize quantum computing education and collaboration.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Pull Requests](#pull-requests)
- [Reporting Issues](#reporting-issues)

## Code of Conduct
This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to professional and respectful conduct.

## Getting Started
1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/x-repo.git
    cd x-repo
    ```
3.  **Set up the environment** following the instructions in the [README.md](./README.md) for both Frontend and Backend.
    - Ensure you have the necessary API keys (Firebase, Supabase, Google Gemini).

## Development Workflow
1.  **Create a Branch**: Always create a new branch for your work.
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b fix/issue-description
    ```
2.  **Make Changes**: Implement your feature or fix.
3.  **Test Your Changes**:
    - **Frontend**: Ensure the app builds without TypeScript errors (`npm run build` runs `tsc`).
    - **Backend**: Run the server and test the endpoints manually or using available scripts.

## Style Guidelines

### Frontend (React + TypeScript)
- Use **Functional Components** with Hooks.
- Ensure **TypeScript** types are defined; avoid using `any` wherever possible.
- Follow the existing folder structure (`components`, `pages`, `services`, `contexts`).
- Use **Tailwind CSS** for styling; avoid writing custom CSS unless necessary.

### Backend (Python + FastAPI)
- Follow **PEP 8** style guidelines.
- Use **Type Hints** for all function arguments and return values.
- Leverage **Pydantic** models for data validation.
- Organize code into `routers`, `services`, and `models` to maintain separation of concerns.

## Pull Requests
1.  Push your branch to your fork.
2.  Open a Pull Request against the `main` branch of the original repository.
3.  Provide a clear title and description of your changes.
4.  Link any relevant issues (e.g., "Fixes #123").
5.  Wait for review and address any feedback.

## Reporting Issues
If you find a bug or have a feature request, please open an issue on GitHub. Include:
- A clear title.
- Steps to reproduce (for bugs).
- Expected vs. actual behavior.
- Environment details (OS, Browser, etc.).
