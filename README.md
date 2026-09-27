# Field Service Job Order Management System

A full-stack field service application for managing equipment repair requests from customer submission through scheduling, technician work, completion, and administrative closure.

The project separates responsibilities across four roles:

- Customers choose a preferred technician, submit a service request, track progress, and communicate with that technician.
- Dispatchers assign or revise schedule dates. They do not select or replace the technician.
- Technicians accept or reject proposed schedules, perform the work, and update its progress.
- Administrators manage system records, monitor job orders, cancel active requests, and close completed work.

The public homepage, sign-in page, and customer registration page use an Auralis-inspired visual system with an indigo and cyan WebGL background, glass layers, responsive navigation, reduced-motion support, and a CSS fallback when WebGL is unavailable. Role dashboards remain visually and functionally separate from the public pages.

## Table of contents

- [Main features](#main-features)
- [Workflow](#workflow)
- [Role permissions](#role-permissions)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Getting started with Docker](#getting-started-with-docker)
- [Getting started without Docker](#getting-started-without-docker)
- [Local test accounts](#local-test-accounts)
- [Useful commands](#useful-commands)
- [API overview](#api-overview)
- [Testing and quality checks](#testing-and-quality-checks)
- [Important implementation notes](#important-implementation-notes)
- [Learning highlights](#learning-highlights)

## Main features

### Public experience

- Responsive product homepage with About, Services, How It Works, and Contact sections
- Shared public navigation with working section links
- Role-aware sign-in redirects
- Customer-only registration
- Three.js animated background with a static CSS fallback
- Reduced-motion and reduced-transparency support

### Customer experience

- Browse multiple active technician profiles
- Review technician introductions, specializations, and qualifications
- Select a preferred technician before submitting a repair request
- View only their own service requests
- Track the current job-order status and history
- Exchange private messages with the selected technician

### Dispatcher experience

- View requests awaiting scheduling or rescheduling
- Assign official start and end dates
- Check technician availability and scheduling conflicts
- Reschedule requests rejected by technicians
- Preserve schedule revision history
- Receive conflict responses when schedule data is stale or overlaps existing work

### Technician experience

- View only requests assigned to the signed-in technician
- Review upcoming work on a personal schedule
- Accept or reject a proposed date and time
- Start accepted work
- Mark work in progress as completed
- Communicate privately with the requesting customer

### Administrator experience

- View operational dashboard information
- Manage users, customers, and technician records
- Review job orders and status histories
- Edit non-workflow-controlled job-order information
- Cancel an active request
- Close completed work

## Workflow

```text
Customer selects a technician
            |
            v
Customer submits a service request
            |
            v
      pending_schedule
            |
            v
Dispatcher assigns the official date and time
            |
            v
 pending_technician_response
        /           \
       /             \
  accepted       technician_rejected
     |                   |
     v                   v
in_progress      Dispatcher reschedules
     |                   |
     v                   +----> pending_technician_response
 completed
     |
     v
Admin closes the job
     |
     v
   closed
```

An administrator may cancel an active request when necessary. Completed, closed, and cancelled conversations remain available as history but become read-only according to the workflow rules.

## Role permissions

| Capability | Customer | Dispatcher | Technician | Admin |
| --- | :---: | :---: | :---: | :---: |
| Register through the public site | Yes | No | No | No |
| Select the preferred technician | Yes | No | No | No |
| Create a service request | Yes | No | No | No |
| Assign or revise schedule dates | No | Yes | No | No |
| Replace the customer's technician choice | No | No | No | No |
| Accept or reject a schedule | No | No | Yes | No |
| Start and complete technician work | No | No | Yes | No |
| Use the private request conversation | Yes | No | Yes | No |
| Manage users and master records | No | No | No | Yes |
| Cancel active or close completed work | No | No | No | Yes |

Authorization is enforced in both places:

- React protected routes prevent users from opening pages outside their role.
- Laravel Sanctum and role middleware protect the API even if someone bypasses the frontend.

## Technology stack

### Frontend

- React 19
- TypeScript
- Vite 8
- React Router 8
- Tailwind CSS 4
- Base UI and customized shadcn-style components
- Axios
- Lucide React icons
- Three.js for the public-page background
- Geist Variable font

### Backend

- PHP 8.2+
- Laravel 12
- Laravel Sanctum bearer-token authentication
- MySQL 8 with Docker, or SQLite for local development and automated tests
- PHPUnit 11

### Infrastructure and tools

- Docker Compose
- Nginx
- PHP-FPM
- Postman collection for API testing
- ESLint
- Laravel Pint

## Project structure

```text
Field Service Job Order Management System/
|-- README.md
|-- Design.md
|-- backend/
|   |-- app/
|   |   |-- Http/Controllers/Api/   # API request handling
|   |   |-- Http/Requests/          # Validation and authorization
|   |   |-- Http/Resources/         # Consistent API responses
|   |   |-- Models/                 # Eloquent models and relationships
|   |   `-- Services/               # Workflow and domain rules
|   |-- database/
|   |   |-- migrations/
|   |   `-- seeders/
|   |-- postman/
|   |-- routes/api.php
|   |-- tests/
|   `-- docker-compose.yml
`-- frontend/
    |-- src/
    |   |-- components/
    |   |   |-- common/             # Shared application components
    |   |   |-- features/           # Role and workflow features
    |   |   |-- public/             # Homepage and authentication shell
    |   |   `-- ui/                 # Reusable UI primitives
    |   |-- contexts/               # Authentication state
    |   |-- lib/                    # Axios client and utilities
    |   |-- pages/                  # Route-level pages by role
    |   |-- routes/                 # React Router definitions
    |   |-- styles/
    |   `-- types/                  # Shared TypeScript contracts
    `-- package.json
```

`Design.md` preserves the Auralis source specification and explains how it was adapted for this field service application.

## Getting started with Docker

### Prerequisites

- Docker Desktop
- Node.js and npm
- Git

The commands below are written for PowerShell.

### 1. Configure and start the backend

```powershell
cd backend
Copy-Item .env.example .env
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

The services will be available at:

- Laravel API through Nginx: `http://localhost:8000/api`
- MySQL from the host: `localhost:3308`

To verify the containers:

```powershell
docker compose ps
```

### 2. Start the frontend

Open a second PowerShell terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite address printed in the terminal. By default, it is `http://localhost:5173`.

The frontend API client currently points to `http://localhost:8000/api` in `frontend/src/lib/axios.ts`.

## Getting started without Docker

### Prerequisites

- PHP 8.2 or newer with the required Laravel extensions
- Composer 2
- Node.js and npm

The included `.env.example` uses SQLite, and `backend/database/database.sqlite` is already present.

### Backend

```powershell
cd backend
composer install
Copy-Item .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

## Local test accounts

Running the database seeder creates these development accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@fieldservice.test` | `Password123!` |
| Dispatcher | `dispatcher@fieldservice.test` | `Password123!` |
| Technician | `technician.test@fieldservice.test` | `Password123!` |
| Customer | `juan.delacruz@example.test` | `Password123!` |

These credentials are for local development only. Replace or remove them before using the project in any deployed environment.

## Useful commands

### Docker backend

Run migrations and seed local accounts:

```powershell
docker compose exec app php artisan migrate --seed
```

Rebuild the database from scratch:

```powershell
docker compose exec app php artisan migrate:fresh --seed
```

View application logs:

```powershell
docker compose logs -f app
```

Stop the containers without deleting database data:

```powershell
docker compose down
```

### Frontend

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

## API overview

All protected endpoints require a Sanctum bearer token.

| Area | Example endpoints |
| --- | --- |
| Authentication | `POST /api/login`, `POST /api/customer/register`, `GET /api/user`, `POST /api/logout` |
| Customer technicians | `GET /api/customer/technicians`, `GET /api/customer/technicians/{id}` |
| Customer requests | `GET/POST /api/customer/service-requests`, `GET /api/customer/service-requests/{id}` |
| Conversations | `GET /api/conversations`, `GET/POST /api/conversations/{id}/messages` |
| Dispatcher scheduling | `GET /api/dispatcher/job-orders`, `PATCH /api/dispatcher/job-orders/{id}/schedule` |
| Availability | `GET /api/dispatcher/technicians/{id}/availability` |
| Technician workflow | `POST /api/technician/job-orders/{id}/accept`, `/reject`, `/start`, or `/complete` |
| Administration | `/api/users`, `/api/customers`, `/api/technicians`, and `/api/job-orders` |

The Postman collections are stored in `backend/postman/`.

## Testing and quality checks

### Backend tests

With Docker running:

```powershell
cd backend
docker compose exec -T app php artisan test
```

Without Docker:

```powershell
cd backend
php artisan test
```

The test suite covers:

- Role authorization and retired unsafe routes
- Customer technician selection and request ownership
- Dispatcher scheduling and conflict handling
- Technician availability, acceptance, rejection, start, and completion
- Schedule revisions and stale-version protection
- Private conversations and read-only terminal states
- Database workflow schema and audit history

Tests use an in-memory SQLite database configured in `backend/phpunit.xml`. This database is separate from the Docker MySQL database.

At the time this README was created, the backend suite passed all 53 tests with 360 assertions.

### Frontend checks

```powershell
cd frontend
npm run build
npm run lint
```

At the time this README was created, the frontend build passed. ESLint had no errors and reported four existing Fast Refresh warnings in shared component/context files. Vite also reported a non-blocking large-chunk warning because the application includes Three.js and the full role dashboards.

## Important implementation notes

### Authentication

The frontend stores the Sanctum token in browser `localStorage` under `field-service-auth-token`. Axios adds it to API requests as a bearer token. This is simple for a learning project; a production security review may choose an HTTP-only cookie approach.

### Scheduling ownership

The customer owns technician selection. The dispatcher owns only the official schedule. The backend prohibits dispatcher reassignment of the selected technician.

### Concurrency and schedule revisions

Every dispatcher schedule change creates an audit revision. Technician responses refer to the current schedule version, which prevents an old page or stale request from accepting an outdated schedule.

### Availability

The backend performs availability checks, rather than trusting only the interface. Overlapping active work returns a conflict response. Finished, rejected, or cancelled work does not incorrectly block future scheduling.

### Conversations

Each service request has one private conversation. Only the request's customer and currently selected technician may access it. Dispatchers and administrators cannot read private conversations.

### Public-page animation

The Three.js background is decorative and excluded from accessibility navigation. It:

- Dynamically loads Three.js
- Cleans up animation frames and WebGL resources
- Pauses while the browser tab is hidden
- Stops for users who prefer reduced motion
- Leaves a CSS gradient visible if WebGL cannot start

## Learning highlights

This project demonstrates several useful full-stack practices:

1. **Model business roles explicitly.** A role is more than a different sidebar. Each role has a clear responsibility enforced by backend authorization.
2. **Keep workflow rules on the server.** Buttons improve the experience, but API validation and services protect the real data.
3. **Use service classes for domain logic.** Scheduling, technician responses, availability, status transitions, and conversations are easier to test when they are not buried inside controllers.
4. **Protect ownership at every boundary.** Customers see their own requests, technicians see selected work, and conversations verify participation.
5. **Preserve audit history.** Status records and schedule revisions explain what changed, when it changed, and who changed it.
6. **Design for failure and accessibility.** Reduced motion, WebGL fallback, loading states, protected routes, validation feedback, and responsive navigation are part of the feature, not optional polish.
7. **Test business behavior.** The most valuable tests check permissions, conflicts, stale data, and valid state transitions instead of only checking that a page returns HTTP 200.

## Current scope

This repository is a learning and midterm project. Before production deployment, review environment secrets, token storage, HTTPS, rate limiting, mail delivery, background queues, monitoring, database backups, file uploads, and deployment-specific CORS settings.
