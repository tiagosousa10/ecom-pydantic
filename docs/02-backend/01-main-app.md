# Main Application (main.py)

## Purpose

This file is the entry point of the FastAPI application. It sets up the server and includes all route modules.

## What It Does

1. **Creates FastAPI App** - Initializes the main application
2. **Includes Routers** - Connects all the different route modules
3. **Serves Static Files** - Serves the frontend directly and makes uploaded images accessible via URL

## Key Components

```python
# Creates the FastAPI application
app = FastAPI()

# Includes all route modules
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(chatbot.router)

# Serves uploaded files statically
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Returns a welcome message |

## File Structure

```
backend/
├── main.py              # Main application (this file)
├── database.py          # Database connection
├── models.py            # Data models
├── routes/
│   ├── products.py      # Product management
│   ├── orders.py        # Order processing
│   ├── cart.py          # Shopping cart
│   └── chatbot.py       # AI chatbot
```

## How It Works

```mermaid
flowchart TD
    A[Request] --> B[FastAPI App]
    B --> D[Router]
    D --> F[Route Handler]
    F --> G[Database]
    G --> H[Response]
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style D fill:#fce4ec
    style G fill:#e8f5e9
```
