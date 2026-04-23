# ðŸŒ FleetOps Frontend Service

The React SPA (Single Page Application) frontend for the FleetOps E-commerce platform. It provides the user interface for browsing products, managing the shopping cart, placing orders, and an administrative dashboard for inventory management.

## ðŸ› ï¸ Tech Stack
*   **Framework:** React 18, Vite
*   **Routing:** React Router v6
*   **State Management:** React Context API + `useReducer`
*   **Styling:** Vanilla CSS with custom design system variables (Glassmorphism theme)
*   **API Client:** Axios (with auth interceptors)
*   **Deployment:** NGINX (alpine) serving static files + reverse proxying API requests

## ðŸŽ¯ Key Features
*   **Product Browsing:** View catalog with dynamic categorization. Public â€” no login needed.
*   **Role-Based UX (Admin vs Customer):**
    *   **ADMIN:** After login â†’ redirected to `/admin`. Navbar shows only `Admin` link. Product cards show a read-only `Stock: N` badge â€” no buy buttons.
    *   **CUSTOMER:** After login â†’ redirected to `/products`. Navbar shows `Orders` + `Cart`. Product cards show `Add to Cart` + `Buy Now`.
*   **Dual Checkout Flows (CUSTOMER only):**
    *   **Buy Now:** Immediate checkout for a single item, bypassing the cart.
    *   **Cart Checkout:** Add multiple items to a persistent cart and check out together.
*   **Order History & Reorder (CUSTOMER only):** View past orders with product names + images, and initiate a new checkout with a previous item.
*   **Admin Dashboard (ADMIN only):** Dedicated `/admin` interface to adjust stock (optimistic UI updates) and manage the full product catalog (create, edit, delete).
*   **Responsive UI:** Mobile-friendly design using CSS Grid and Flexbox.

## ðŸ—ºï¸ Frontend Routes

| Route | Who can access | Description |
|-------|---------------|-------------|
| `/` | Everyone | Home / landing page |
| `/products` | Everyone | Product catalog grid |
| `/login` | Everyone | Login + Register form |
| `/checkout` | CUSTOMER only | Checkout page (Buy Now or Cart mode) |
| `/orders` | CUSTOMER only | Order history + Reorder |
| `/admin` | ADMIN only | Product management dashboard |

## ðŸ—‚ï¸ Project Structure

```
src/
â”œâ”€â”€ assets/         # Static assets
â”œâ”€â”€ components/     # Reusable UI components (Navbar, ProductCard, CartDrawer, etc.)
â”œâ”€â”€ context/        # Global AppContext (auth state, cart count)
â”œâ”€â”€ pages/          # Route components (Home, Products, Login, Checkout, Orders, Admin)
â”œâ”€â”€ services/       # Axios API client setup and endpoint definitions
â”œâ”€â”€ App.jsx         # Main router and layout wrapper
â””â”€â”€ index.css       # Global design system (CSS variables, glass classes)
```

## ðŸ“¡ API Integration & NGINX Routing

When deployed via Docker, the NGINX server acts as a reverse proxy. The React app makes calls to `/api/...`, and NGINX routes them to the appropriate backend service container:

*   `/api/auth/*` âž” `http://auth-service:8080/auth/*`
*   `/api/products/*` âž” `http://vehicle-service:8080/products/*`
*   `/api/cart/*` âž” `http://maintenance-service:8080/cart/*`
*   `/api/orders/*` âž” `http://request-service:8080/orders/*`

## ðŸš€ Running Locally

### Prerequisites
*   Node.js (v18+)
*   npm

### Setup

```bash
npm install
npm run dev
```

*Note: For local development (`npm run dev`), Vite is configured to proxy `/api` requests to `localhost:8080` (assuming the backend services are running via Docker Compose port mapping).*

## ðŸ³ Docker

The Dockerfile uses a multi-stage build:
1.  **Build Stage:** Uses Node.js to `npm run build`, outputting static files to `/app/dist`.
2.  **Serve Stage:** Uses NGINX to serve the static files and apply the `nginx.conf` routing rules.

```bash
docker build -t fleetops-frontend:v1.0.0 .
docker run -p 8080:80 fleetops-frontend:v1.0.0
```


