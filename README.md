# 🌐 CloudCart Frontend Service

The React SPA (Single Page Application) frontend for the CloudCart E-commerce platform. It provides the user interface for browsing products, managing the shopping cart, placing orders, and an administrative dashboard for inventory management.

## 🛠️ Tech Stack
*   **Framework:** React 18, Vite
*   **Routing:** React Router v6
*   **State Management:** React Context API + `useReducer`
*   **Styling:** Vanilla CSS with custom design system variables (Glassmorphism theme)
*   **API Client:** Axios (with auth interceptors)
*   **Deployment:** NGINX (alpine) serving static files + reverse proxying API requests

## 🎯 Key Features
*   **Product Browsing:** View catalog with dynamic categorization. Public — no login needed.
*   **Role-Based UX (Admin vs Customer):**
    *   **ADMIN:** After login → redirected to `/admin`. Navbar shows only `Admin` link. Product cards show a read-only `Stock: N` badge — no buy buttons.
    *   **CUSTOMER:** After login → redirected to `/products`. Navbar shows `Orders` + `Cart`. Product cards show `Add to Cart` + `Buy Now`.
*   **Dual Checkout Flows (CUSTOMER only):**
    *   **Buy Now:** Immediate checkout for a single item, bypassing the cart.
    *   **Cart Checkout:** Add multiple items to a persistent cart and check out together.
*   **Order History & Reorder (CUSTOMER only):** View past orders with product names + images, and initiate a new checkout with a previous item.
*   **Admin Dashboard (ADMIN only):** Dedicated `/admin` interface to adjust stock (optimistic UI updates) and manage the full product catalog (create, edit, delete).
*   **Responsive UI:** Mobile-friendly design using CSS Grid and Flexbox.

## 🗺️ Frontend Routes

| Route | Who can access | Description |
|-------|---------------|-------------|
| `/` | Everyone | Home / landing page |
| `/products` | Everyone | Product catalog grid |
| `/login` | Everyone | Login + Register form |
| `/checkout` | CUSTOMER only | Checkout page (Buy Now or Cart mode) |
| `/orders` | CUSTOMER only | Order history + Reorder |
| `/admin` | ADMIN only | Product management dashboard |

## 🗂️ Project Structure

```
src/
├── assets/         # Static assets
├── components/     # Reusable UI components (Navbar, ProductCard, CartDrawer, etc.)
├── context/        # Global AppContext (auth state, cart count)
├── pages/          # Route components (Home, Products, Login, Checkout, Orders, Admin)
├── services/       # Axios API client setup and endpoint definitions
├── App.jsx         # Main router and layout wrapper
└── index.css       # Global design system (CSS variables, glass classes)
```

## 📡 API Integration & NGINX Routing

When deployed via Docker, the NGINX server acts as a reverse proxy. The React app makes calls to `/api/...`, and NGINX routes them to the appropriate backend service container:

*   `/api/auth/*` ➔ `http://auth-service:8080/auth/*`
*   `/api/products/*` ➔ `http://product-service:8080/products/*`
*   `/api/cart/*` ➔ `http://cart-service:8080/cart/*`
*   `/api/orders/*` ➔ `http://order-service:8080/orders/*`

## 🚀 Running Locally

### Prerequisites
*   Node.js (v18+)
*   npm

### Setup

```bash
npm install
npm run dev
```

*Note: For local development (`npm run dev`), Vite is configured to proxy `/api` requests to `localhost:8080` (assuming the backend services are running via Docker Compose port mapping).*

## 🐳 Docker

The Dockerfile uses a multi-stage build:
1.  **Build Stage:** Uses Node.js to `npm run build`, outputting static files to `/app/dist`.
2.  **Serve Stage:** Uses NGINX to serve the static files and apply the `nginx.conf` routing rules.

```bash
docker build -t cloudcart-frontend:v1.0.0 .
docker run -p 8080:80 cloudcart-frontend:v1.0.0
```
