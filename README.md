# FleetOps Frontend

The React Single Page Application (SPA) for the FleetOps Vehicle Maintenance Platform. It provides a stunning, responsive, and dynamic user interface with role-based routing for Drivers, Managers, and Admins.

## Tech Stack
*   **Framework:** React 18 + Vite
*   **Routing:** React Router v6
*   **State Management:** React Context API + `useReducer`
*   **Styling:** Vanilla CSS with custom design system (Glassmorphism, Dark Theme)
*   **API Client:** Axios (with automatic JWT interceptors)

## Features
*   **Role-Based Navigation:** 
    *   **Drivers:** View assigned vehicles and create maintenance tasks.
    *   **Managers:** View KPI Dashboard and approve/manage Service Requests.
    *   **Admins:** Full CRUD operations on the vehicle fleet.
*   **Fleet Dashboard:** Real-time metrics for vehicle statuses, breakdowns, and service alerts.
*   **Pending Tasks Drawer:** A slide-out panel for staging maintenance issues before submission.
*   **Service History:** A detailed timeline of all vehicle repair requests and their workflow states.
*   **Token Expiry Handling:** Automatically logs the user out and redirects to the login screen if the JWT expires.

## Running Locally

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```
*(When running via Docker Compose, the NGINX proxy routes `/api` to the backend services).*

### 3. Start Development Server
```bash
npm run dev
```

## Docker (Production Build)

The Dockerfile builds the static assets and serves them via NGINX.

```bash
docker build -t fleetops-frontend:v1.0.0 .
```
