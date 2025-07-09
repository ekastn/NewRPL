# Dockerized Go + React Application

This is a full-stack application with a Go backend and a React frontend, containerized using Docker.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Build and run the application:**

    ```bash
    docker-compose up -d --build
    ```

    This command will build the Docker images for the frontend and backend services and then start the containers in detached mode.

3.  **Access the application:**

    -   Frontend: `http://localhost:5173`
    -   Backend API: `http://localhost:8080`

4.  **Stop the application:**

    ```bash
    docker-compose down
    ```

## Project Structure

-   `backend/`: Contains the Go backend application.
-   `frontend/`: Contains the React frontend application.
-   `docker-compose.yml`: Defines the services, networks, and volumes for the application.
-   `backend/Dockerfile`: Defines the Docker image for the backend service.
-   `frontend/Dockerfile`: Defines the Docker image for the frontend service.