# the-prompt-nexus-challenge

A high-performance, robust full-stack application designed to manage, discover, and categorize AI Image Generation Prompts. It features a reactive Angular frontend and a vanilla Django backend, optimized with Redis caching, and deployed via a modern DevOps pipeline.

-----

## Live Links

  * **Frontend UI:** [https://nexus-fe.ritwikrajsingh.com/](https://nexus-fe.ritwikrajsingh.com/)
  * **API Root:** [https://nexus-be.ritwikrajsingh.com/api/](https://nexus-be.ritwikrajsingh.com/api/)

-----

## Tech Stack

### Frontend

  * **Framework:** Angular 21 (Standalone Components)
  * **Styling:** Tailwind CSS v4
  * **Icons:** PrimeIcons
  * **State & Reactivity:** Angular Signals, RxJS
  * **Environment:** Node v24.14.1 (enforced via `.nvmrc`)

### Backend

  * **Language:** Python 3.12
  * **Framework:** Django 5.x (Strictly Vanilla, No Django REST Framework)
  * **Database:** PostgreSQL 15
  * **Cache & Key-Value Store:** Redis 7
  * **Authentication:** PyJWT (Custom implementation)

### Infrastructure & DevOps

  * **Containerization:** Docker & Docker Compose
  * **Reverse Proxy:** Traefik v2.10
  * **Hosting:** Oracle Cloud Infrastructure (OCI) Compute (ARM-based Ampere A1 instance)
  * **Security:** Cloudflare Tunnels (`cloudflared`)
  * **CI/CD:** Jenkins

-----

## System Architecture and Infrastructure

Unlike traditional deployments, this application is hosted on a private Oracle Cloud Infrastructure (OCI) instance and exposed securely without opening any inbound firewall ports.

  * **Reverse Proxy:** Traefik acts as the internal edge router, managing traffic between the frontend, backend, and database services.
  * **Security (Cloudflare Tunnels):** The application is exposed to the internet via `cloudflared`. A persistent tunnel creates an outbound-only connection to Cloudflare’s edge, masking the origin IP and providing built-in DDoS protection.
  * **Network Isolation:** Services are segregated into an `internal-net` (bridge) for sensitive database and Redis traffic, while only Traefik interfaces with the `OlympusConnect` external network.

-----

## Features & Objectives Completed

This project satisfies the core requirements and all bonus challenges of the assignment:

  * **Core API Design:** RESTful endpoints for creating, retrieving, and listing prompts, built without third-party REST frameworks.
  * **Reactive UI:** Modern Angular signals ensure efficient change detection and a fluid user experience.
  * **Prompt List & Detail Views:** Displays prompts with titles, tags, and visual complexity badges. The detail view fetches full prompt content and live view counts.
  * **Form Validation:** The "Add Prompt" Reactive Form includes strict validation: Title (min 3 characters), Content (min 20 characters), Complexity (range slider 1-10), and dynamic tag input formatting.
  * **Redis Integration (View Counter):** Implemented a view counter where Redis acts as the absolute source of truth. The counter increments on every detail retrieval using atomic `INCR` operations, preventing unnecessary Postgres writes on read.
  * **Bonus A - JWT Authentication:** Custom JWT implementation from scratch using `PyJWT` to protect the prompt creation endpoint. Utilizes Django's internal PBKDF2 hashing for secure user registration. Frontend stores JWT in `localStorage`.
  * **Bonus B - Tagging System:** Many-to-Many `Tag` model relationship enabling API filtering (`?tag=...`). Tags are clickable across the frontend to automatically filter the list view.
  * **Bonus C - Live Hosting:** Fully containerized the application and deployed it securely.
  * **Automated DevOps (Smart Seeder):** Custom Django command checks for empty tables on startup and seeds initial dummy data automatically.

-----

## Database Schema & Models

The database is structured to be highly normalized, utilizing PostgreSQL for persistence and enforcing data integrity at the ORM level.

### `User` (Django Default)

Handles secure authentication and credential management.

  * `id`: Integer (Primary Key)
  * `username`: String (Unique)
  * `password`: String (PBKDF2 Hashed & Salted)

### `Prompt`

The core entity representing an AI image generation prompt.

  * `id`: UUID (Primary Key, Auto-generated)
  * `title`: String (Max length: 255)
  * `content`: Text
  * `complexity`: Integer (Database-level validation: Min 1, Max 10)
  * `created_at`: Datetime (Auto-now-add)
  * `tags`: ManyToManyField (Relates to `Tag` model)

### `Tag` (Bonus Objective)

Enables flexible categorization and efficient filtering of prompts.

  * `id`: Integer (Primary Key, Auto-increment)
  * `name`: String (Max length: 50, Unique)

### Redis Cache Structure

  * **Key Format:** `prompt_views:<prompt_uuid>`
  * **Value:** Integer (Atomic increment via `INCR`)

-----

## Architectural Choices & Optimizations

### Backend Design

As per the challenge constraints, this API was built without the Django REST Framework (DRF):

1.  **Manual JSON Handling & Validation:** Endpoints utilize `json.loads()` and manual `JsonResponse` serialization. The `@csrf_exempt` decorator is used strategically, replacing session-based CSRF protection with stateless JWT Bearer token authentication.
2.  **Solving the N+1 Query Problem:** To attach real-time Redis view counts to the list view without making hundreds of individual network calls to the cache, the API utilizes the Redis `mget` (Multiple Get) command. This fetches all view counts for the entire database queryset in a single, lightning-fast round trip.
3.  **Smart Database Seeding:** The backend utilizes a custom `entrypoint.sh` script in Docker. Before starting the server, it runs database migrations and conditionally executes a custom `seed_db` management command only if tables are empty.
4.  **Environment Isolation:** All sensitive data (database credentials, Django Secret Key, CORS origins) are abstracted using `django-environ` to ensure strict security across local, CI/CD, and production environments.

### Frontend: Feature-Driven Architecture

The Angular codebase is organized by feature modules to keep routing, state, and business logic tightly coupled, scaling efficiently without `NgModules`.

1.  **Standalone Components & Signals:** Components manage their own imports. Local UI state uses Angular Signals for targeted change detection. Data fetching is abstracted into dedicated services.
2.  **Route Guards:**
      * **CanActivate (`auth.guard`):** Intercepts navigation to `/prompts/create` and routes unauthenticated users to the login page via a confirmation dialog.
      * **CanDeactivate (`unsaved-changes.guard`):** Checks form controls and dynamic arrays for unsaved data, preventing accidental navigation away from draft prompts.
3.  **Nested Layout Routing:** Global UI elements (navigation badge, auth branding) live in layout components (`PromptsLayout`, `AuthLayout`). The router injects specific page components into these static shells using `<router-outlet>`, preventing DOM churn.
4.  **Graceful Error Handling:** API calls utilize the RxJS `catchError` operator. Navigating to a non-existent prompt ID safely completes the observable with `EMPTY` and routes the user back to the list view.
5.  **Directory Structure:**
      * `core/`: Application-wide singletons (`guards/`, `models/`).
      * `features/`: Distinct business domains. Subdivided into `pages/`, `components/`, `layout/`, `services/`, and `[feature].routes.ts`.

-----

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/register/` | Register a new user | No |
| `POST` | `/api/login/` | Receive JWT access token | No |
| `GET`  | `/api/prompts/` | List prompts (Optional query: `?tag=name`) | No |
| `GET`  | `/api/prompts/:id/` | Retrieve prompt & increment Redis view count | No |
| `POST` | `/api/prompts/` | Create a new prompt | **Yes (JWT)** |

-----

## Setup and Deployment Instructions

### Method 1: Full Stack via Docker (Recommended)

1.  **Environment Configuration:**
    Navigate to the `backend/` directory and create a copy of the example environment file:
    ```bash
    cp backend/.env.example backend/.env
    ```
2.  **Build and Run:**
    From the root of the project repository (where the `docker-compose.yml` lives), run:
    ```bash
    docker-compose up --build
    ```
3.  **Automatic Seeding:**
    Upon successful startup, the backend container automatically populates the database. Use the test credentials to log in:
      * **Username:** `admin`
      * **Password:** `password123`

### Method 2: Manual Development Setup

#### Backend setup

1.  Navigate to the `backend/` directory.
2.  Activate your virtual environment: `source venv/bin/activate`
3.  Install dependencies: `pip install -r requirements.txt`
4.  Set up your local `.env` file with your local database credentials.
5.  Run migrations: `python manage.py migrate`
6.  Start the server: `python manage.py runserver`

#### Frontend setup

1.  Navigate to the `frontend/` directory.
2.  Ensure correct Node version: `nvm use`
3.  Install dependencies: `npm install`
4.  Run the development server (connects to local backend): `npm run dev`
5.  *Optional:* Test the production build locally (connects to live OCI backend): `npm start`

-----

## CI/CD Pipeline

The project includes a `Jenkinsfile` designed for a Docker-out-of-Docker (DooD) setup. On every push to the `main` branch triggered by a GitHub Webhook:

1.  Jenkins fetches secrets securely from its credential vault.
2.  Injects the secrets as a transient `.env` file into the workspace.
3.  Executes `docker-compose up -d --build`.
4.  Deletes the `.env` file and prunes old images (`docker image prune -f`) to maintain OCI storage health.