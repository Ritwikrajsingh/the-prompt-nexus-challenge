# Prompt Nexus - Frontend

The Angular client for the Prompt Nexus application assignment. It handles prompt browsing, creation, and user authentication.

---

## Tech Overview

* **Framework:** Angular 21 (Standalone Components)
* **Styling:** Tailwind CSS v4
* **Icons:** PrimeIcons
* **State & Reactivity:** Angular Signals, RxJS
* **Node Version:** v24.14.1 (enforced via `.nvmrc`)

---

## Setup

### Prerequisites

Make sure you are using the correct Node.js version.
> If you have `nvm` installed, simply run:
>  ```bash
>  nvm use
>  ```
>  This reads the `.nvmrc` file and switches to Node v24.14.1.

### Installation & Running

1. **Install dependencies:**

    ```
    npm install
    ```

2. **Run the development server:**
    ```
    npm run dev
    ```

3. **Test the production build locally:**
    ```
    npm start
    ```
    > This uses the `production` environment configuration, pointing API calls to the live backend URL.

---

## Features Implemented

This frontend satisfies the core requirements and frontend-specific bonus challenges of the assignment:

* **Prompt List View:** Displays all prompts with title, tags, and a visual complexity badge. Includes URL-based tag filtering (`?tag=...`).

* **Prompt Detail View:** Fetches and displays full prompt content along with the live `view_count` retrieved from Redis.

* **Add Prompt Form:** A Reactive Form with strict validation:
  * **Title**: *Minimum 3 characters.*
  * **Content**: *Minimum 20 characters.*
  * **Complexity**: *Range slider (1-10).*
  * **Dynamic tag input** *(auto-formats to lowercase, removes spaces/special characters).*

* **Authentication (Bonus A):** Login and Registration flows. Stores JWT in `localStorage` and uses route guards to protect the creation page.

* **Tagging System (Bonus B):** Tags are clickable across the app, updating the URL to filter the list view automatically.

---

## Code Organization & Architecture

The codebase is structured to scale, following a feature-based architecture rather than grouping files by type.

### Design Decisions

1. **Standalone Components & Signals:**

    `NgModules` are completely omitted. Components manage their own imports. Local UI state (like loading spinners or form submission status) uses Angular Signals for targeted change detection.

2. **Route Guards:**
    - **CanActivate (`auth.guard`):** Intercepts navigation to `/prompts/create`. Unauthenticated users trigger a confirmation dialog routing them to the login page.
    - **CanDeactivate (`unsaved-changes.guard`):** Checks form controls and dynamic arrays for unsaved data, preventing accidental navigation away from draft prompts.

3. **Nested Layout Routing:**

    To keep the codebase DRY, global UI elements (like the navigation badge or the auth branding panel) live in layout components (`PromptsLayout`, `AuthLayout`). The router injects specific page components into these static shells using `<router-outlet>`, preventing DOM churn during navigation.

4. **Graceful Error Handling:**

    API calls utilize the RxJS `catchError` operator. If a user navigates to a non-existent prompt ID, the stream intercepts the `404` response, safely completes the observable with `EMPTY`, and routes the user back to the list view without breaking the UI.

### Directory Structure

The `src/app/` directory follows a modular, feature-driven architecture.

* `core/`: Contains application-wide singletons that do not depend on UI features.

  * `guards/`: Routing protection logic (`auth.guard.ts`, `unsaved-changes.guard.ts`).

  * `models/`: Shared TypeScript interfaces and types (`auth.model.ts`, `prompt.model.ts`).

* `features/`: The distinct business domains of the application. Each feature encapsulates its own UI and logic, making the codebase highly decoupled. The architecture of a feature is broken down into:

  * `pages/`: Routable "smart" components that represent full views (e.g., `prompt-list/`, `login/`).

  * `components/`: Reusable "dumb" presentation components specific to that domain (e.g., `complexity-badge/`, `error-banner/`).

  * `layout/`: Structural shells that define the overarching UI for that domain, like navigation elements or branding panels (e.g., `prompts-layout.ts`).

  * `services/`: Classes handling API communication and business logic for the feature (e.g., `prompt.service.ts`).

  * `[feature].routes.ts`: The lazy-loaded routing configuration for that specific domain.
