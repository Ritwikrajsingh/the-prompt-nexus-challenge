# The Prompt Nexus - Backend API

A robust REST API to manage AI Image Generation Prompts. This application serves as the backend infrastructure for The Prompt Nexus, handling data persistence, caching, and authentication.

### Live Links

  * **API Base URL:** [https://nexus-be.ritwikrajsingh.com/api/](https://nexus-be.ritwikrajsingh.com/api/)

-----

## Tech Stack

  * **Language:** Python 3.12
  * **Framework:** Django 5.x (Strictly Vanilla, No Django REST Framework)
  * **Database:** PostgreSQL 15
  * **Cache & Key-Value Store:** Redis 7
  * **Authentication:** PyJWT (Custom implementation)
  * **Infrastructure:** Docker & Docker Compose

-----

## Objectives & Requirements Completed

  * **Data Modeling:** Designed a `Prompt` model utilizing UUID primary keys, text content, and integer complexity with database-level validation constraints (1-10).
  * **REST API Endpoints:** Built and exposed endpoints to list all prompts, create new prompts, and retrieve individual prompts using custom JSON serialization.
  * **Redis Integration (View Counter):** Implemented a view counter where Redis acts as the absolute source of truth. The counter increments on every detail retrieval without writing to Postgres on read.
  * **Bonus A - JWT Authentication:** Built a custom JWT implementation from scratch using `PyJWT` to protect the prompt creation endpoint. Utilizes Django's internal PBKDF2 hashing for secure user registration.
  * **Bonus B - Tagging System:** Created a Many-to-Many `Tag` model relationship with the `Prompt` model, enabling API filtering via query parameters (e.g., `?tag=cyberpunk`).
  * **Bonus C - Live Hosting:** Fully containerized the application and deployed it securely using Traefik as a reverse proxy.

-----

## Architectural Choices & Optimizations

As per the challenge constraints, this API was built without the Django REST Framework (DRF). This required custom architectural decisions to ensure performance, security, and clean code:

1.  **Manual JSON Handling & Validation:** Endpoints utilize `json.loads()` and manual `JsonResponse` serialization. The `@csrf_exempt` decorator is used strategically, replacing session-based CSRF protection with stateless JWT Bearer token authentication.
2.  **Solving the N+1 Query Problem:** To attach real-time Redis view counts to the list view without making hundreds of individual network calls to the cache, the API utilizes the Redis `mget` (Multiple Get) command. This fetches all view counts for the entire database queryset in a single, lightning-fast round trip.
3.  **Smart Database Seeding:** The backend utilizes a custom `entrypoint.sh` script in Docker. Before starting the server, it runs database migrations and conditionally executes a custom `seed_db` management command. It intelligently checks if the Postgres tables are empty before injecting dummy data, preventing duplication on container restarts.
4.  **Environment Isolation:** All sensitive data (database credentials, Django Secret Key, CORS origins) are abstracted using `django-environ` to ensure strict security across local, CI/CD, and production environments.

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

## Local Setup Instructions

### Prerequisites

  * Docker and Docker Compose installed on your machine.

### 1\. Environment Configuration

Create a copy of the example environment file inside this backend directory:

```bash
cp .env.example .env
```

*(No further changes are needed for local Docker execution; the defaults will connect to the containerized databases).*

### 2\. Build and Run

From the root of the project repository (where the `docker-compose.yml` lives), run:

```bash
docker-compose up --build
```

### 3\. Automatic Seeding

Upon successful startup, the backend container will automatically run migrations and populate the database with dummy data (tags, prompts, and a test user).

  * **Test User:** `admin`
  * **Password:** `password123`

-----

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/register/` | Register a new user | No |
| `POST` | `/api/login/` | Receive JWT access token | No |
| `GET`  | `/api/prompts/` | List prompts (Optional query: `?tag=name`) | No |
| `GET`  | `/api/prompts/:id/` | Retrieve prompt & increment Redis view count | No |
| `POST` | `/api/prompts/` | Create a new prompt | **Yes (JWT)** |