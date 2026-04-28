# Deployment Guide

## Purpose

This document explains how the ClothStore application is deployed using **Docker**, **GitHub Actions (CI/CD)**, and **Amazon Web Services (AWS)**. 

Because we use a unified Vanilla JS + FastAPI architecture, the deployment process is extremely lightweight. The backend natively serves the frontend files without requiring complex multi-stage node builds.

## Technology Stack

| Technology | Role |
|------------|------|
| **Docker** | Containerizes the app so it runs identically everywhere. |
| **GitHub Actions**| The CI/CD pipeline that automatically builds and deploys code when you push to the `main` branch. |
| **Amazon ECR** | Elastic Container Registry. Think of it as a secure, private "Docker Hub" on AWS where we store our built images. |
| **Amazon EC2** | Elastic Compute Cloud. The physical/virtual server running in the cloud where the Docker container actually lives and serves users. |

---

## 1. Local Development (Ports)

Locally, the application runs on **Port 8000**.

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 2. Docker Architecture

The `Dockerfile` is extremely simplified. It pulls Python, installs `requirements.txt`, copies the backend + frontend files, and starts Uvicorn.

```mermaid
flowchart TD
    A[Python 3.10-slim Image] --> B[Copy Requirements]
    B --> C[Pip Install Dependencies]
    C --> D[Copy Source Code]
    D --> E[Expose Port 8000]
    E --> F[CMD: uvicorn main:app --port 8000]
    
    style A fill:#e1f5fe
    style C fill:#fff3e0
    style D fill:#e8f5e9
    style F fill:#fce4ec
```

---

## 3. CI/CD Pipeline (GitHub Actions)

The deployment pipeline (`.github/workflows/cicd.yaml`) is fully automated. Whenever a developer pushes code to the `main` branch, GitHub Actions takes over.

### Pipeline Flow Diagram

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub Actions
    participant ECR as Amazon ECR
    participant EC2 as Amazon EC2

    Dev->>GH: 1. Push code to `main` (Trigger)
    
    rect rgb(235, 248, 255)
    Note over GH: Continuous Integration (Ubuntu Runner)
    GH->>GH: 2. Checkout Code
    GH->>GH: 3. Configure AWS Credentials
    GH->>ECR: 4. Build & Push Docker Image
    end
    
    rect rgb(255, 243, 224)
    Note over GH, EC2: Continuous Deployment (Self-Hosted Runner on EC2)
    GH->>EC2: 5. Connect to EC2 Server
    EC2->>ECR: 6. Pull latest Docker Image
    EC2->>EC2: 7. Stop & Remove old container
    EC2->>EC2: 8. Run new container
    end
```

### Environment Variables Injected During Deployment

When the EC2 server runs the new container (Step 8), it automatically injects your secret API keys from GitHub Secrets into the Docker container. 

The `docker run` command explicitly passes these in:

| Secret | Purpose |
|--------|---------|
| `MONGO_URI` | The connection string for the remote MongoDB Atlas database. |
| `GROQ_API_KEY` | Provides access to the Qwen Large Language Model for the AI Chatbot. |
| `LOGFIRE_API_KEY` | Allows the Pydantic Logfire system to capture and send observability data. |
| `TAVILY_API_KEY` | API key for the AI web-search fallback (if used). |

_Note: The application internally exposes port **8000** and binds it directly to port **8000** on the EC2 host (`-p 8000:8000`)._
