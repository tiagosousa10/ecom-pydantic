# 👕 ClothStore AI - Gen AI Powered E-Commerce

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Pydantic AI](https://img.shields.io/badge/Pydantic_AI-F05023?style=for-the-badge&logo=ai&logoColor=white)](https://pydantic.dev/)

Welcome to **ClothStore AI**! This project is a modern LLM-powered shopping experience. It features a sleek **Frontend** (Vanilla JS), a robust **FastAPI Backend**, a **MongoDB** database, and an intelligent **AI Shopping Assistant** powered by **Pydantic AI**.

---

- **📦 Dynamic Catalog**: Browse and filter clothing products by category (Men, Women, Kids) and price range.
- **🤖 AI Shopping Assistant**: A super-smart agent powered by **Pydantic AI** (Qwen-3 32B via Groq) that understands natural language queries and finds products instantly.
- **🛒 Smart Shopping Cart**: Add items to your cart and manage them with ease.
- **🚀 Bulk Store Generation**: Instantly populate your database with 500+ diverse demo products for testing.
- **📜 Simple Checkout**: Place orders using just an email identifier—no complex auth required for this demo.
- **🔭 Deep Observability**: Integrated with **Pydantic Logfire** for real-time monitoring of both the API and the AI agent.
- **🛠️ Admin Control**: Comprehensive endpoints for full CRUD operations on product inventory.

---

## 🛠️ Technology Stack

We built this mall using the best modern materials:

### Frontend (The Storefront)
- **Native Vanilla JS** (Loads the store visually instantly)
- **CSS** (Helps make things look pretty)

### Backend (The Warehouse Manager)
- **FastAPI** (Extremely fast Python worker that handles requests)
- **MongoDB Atlas** (Flexible digital filing cabinets for data)
- **Pydantic AI & Groq** (The smart brain of our AI Salesman)
- **Pydantic Logfire** (The security camera monitoring everything inside)

---

## 📖 Complete Documentation

Want to learn how it all works? We have easy-to-read guides!
Check the **[`docs/README.md`](./docs/README.md)** for the full table of contents, including a simple **Terminology Guide**!

---

## 🚀 Quick Start (Running the Store)

We created a simple switch to turn on the whole mall at once:

1. **Prepare the Keys (Setup)**
   - Create a `.env` file in the root directory.
   - Add your `MONGO_URI`, `GROQ_API_KEY`, and `LOGFIRE_TOKEN`.
   - Ensure **Python 3.10+** is installed.

2. **Flick the Switch (Run Everything)**
   ```bash
   python main.py
   ```
   *This starts the server and:*
   - Launches the FastAPI backend on `http://localhost:8000`.
   - Automatically serves the built-in frontend.
   - Monitors performance via Logfire.

---

## 🏗️ Manual Tool Setup

If you prefer turning things on one by one:

### Start the Server
```bash
python -m venv venv
venv\Scripts\activate   # (Or source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
python main.py
```
*(The native Frontend is gracefully embedded directly inside the python command!)*

---

FastAPI automatically generates an interactive map for all endpoints:
- Go to **`http://localhost:8000/docs`** to test the API!

Here are the primary routes:
| What it does | Method | Door (URL) |
| :--- | :--- | :--- |
| Browse/List Products | `GET` | `/products` |
| Add a New Product | `POST` | `/products` |
| Bulk Generate (500 Demo Items) | `POST` | `/products/bulk-generate-500` |
| Add item to Cart | `POST` | `/cart/add` |
| Get User's Cart | `GET` | `/cart/{email}` |
| Place New Order | `POST` | `/orders` |
| Talk to AI Assistant | `POST` | `/chat` |

---

## 📝 License

Distributed under the **MIT License**. Have fun building!
